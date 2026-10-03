const db = require('../config/db');

// POST /api/transfers - Warehouse Stock Transfer (Transaction)
exports.createTransfer = async (req, res) => {
  const connection = await db.getConnection();
  try {
    const { product_id, source_warehouse_id, destination_warehouse_id, quantity } = req.body;

    const qty = parseInt(quantity, 10);
    const srcId = parseInt(source_warehouse_id, 10);
    const destId = parseInt(destination_warehouse_id, 10);
    const prodId = parseInt(product_id, 10);

    if (!prodId || !srcId || !destId || isNaN(qty) || qty <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid product, source, destination, or quantity' });
    }

    if (srcId === destId) {
      return res.status(400).json({ success: false, message: 'Source and destination warehouses cannot be the same' });
    }

    await connection.beginTransaction();

    // Lock source inventory
    const [sourceInv] = await connection.query(
      `SELECT quantity FROM inventory WHERE product_id = ? AND warehouse_id = ? FOR UPDATE`,
      [prodId, srcId]
    );

    if (sourceInv.length === 0 || sourceInv[0].quantity < qty) {
      await connection.rollback();
      const currentQty = sourceInv.length > 0 ? sourceInv[0].quantity : 0;
      return res.status(409).json({
        success: false,
        message: `Insufficient stock at source warehouse. Requested: ${qty}, Available: ${currentQty}`
      });
    }

    // Deduct from source
    await connection.query(
      `UPDATE inventory SET quantity = quantity - ? WHERE product_id = ? AND warehouse_id = ?`,
      [qty, prodId, srcId]
    );

    // Upsert into destination
    await connection.query(
      `INSERT INTO inventory (product_id, warehouse_id, quantity) 
       VALUES (?, ?, ?) 
       ON DUPLICATE KEY UPDATE quantity = quantity + ?`,
      [prodId, destId, qty, qty]
    );

    // Create warehouse transfer record
    const [transferResult] = await connection.query(
      `INSERT INTO warehouse_transfers (product_id, source_warehouse_id, destination_warehouse_id, quantity, status, completed_at) 
       VALUES (?, ?, ?, ?, 'COMPLETED', NOW())`,
      [prodId, srcId, destId, qty]
    );

    const transferId = transferResult.insertId;

    // Record TRANSFER_OUT movement for source
    await connection.query(
      `INSERT INTO stock_movements (product_id, warehouse_id, movement_type, quantity, transfer_id) 
       VALUES (?, ?, 'TRANSFER_OUT', ?, ?)`,
      [prodId, srcId, qty, transferId]
    );

    // Record TRANSFER_IN movement for destination
    await connection.query(
      `INSERT INTO stock_movements (product_id, warehouse_id, movement_type, quantity, transfer_id) 
       VALUES (?, ?, 'TRANSFER_IN', ?, ?)`,
      [prodId, destId, qty, transferId]
    );

    await connection.commit();

    res.status(201).json({
      success: true,
      message: `Successfully transferred ${qty} units`,
      data: {
        transfer_id: transferId,
        product_id: prodId,
        source_warehouse_id: srcId,
        destination_warehouse_id: destId,
        quantity: qty,
        status: 'COMPLETED'
      }
    });

  } catch (error) {
    await connection.rollback();
    console.error('Error creating transfer:', error);
    res.status(500).json({ success: false, message: 'Transfer failed', error: error.message });
  } finally {
    connection.release();
  }
};

// GET /api/transfers - List all transfers
exports.getAllTransfers = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        wt.transfer_id,
        wt.product_id,
        p.name AS product_name,
        wt.source_warehouse_id,
        w1.name AS source_warehouse_name,
        wt.destination_warehouse_id,
        w2.name AS destination_warehouse_name,
        wt.quantity,
        wt.status,
        wt.created_at,
        wt.completed_at
      FROM warehouse_transfers wt
      JOIN products p ON wt.product_id = p.product_id
      JOIN warehouses w1 ON wt.source_warehouse_id = w1.warehouse_id
      JOIN warehouses w2 ON wt.destination_warehouse_id = w2.warehouse_id
      ORDER BY wt.transfer_id DESC
    `);

    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error fetching transfers:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch transfers', error: error.message });
  }
};
