const db = require('../config/db');

// GET /api/inventory - Get inventory, optionally filtered by warehouse_id and/or category
exports.getInventory = async (req, res) => {
  try {
    const { warehouse_id, category, search } = req.query;
    const conditions = [];
    const params = [];

    if (warehouse_id) {
      conditions.push('i.warehouse_id = ?');
      params.push(parseInt(warehouse_id, 10));
    }
    if (category) {
      conditions.push('p.category = ?');
      params.push(category);
    }
    if (search) {
      conditions.push('p.name LIKE ?');
      params.push(`%${search}%`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const [rows] = await db.query(`
      SELECT 
        i.inventory_id,
        i.product_id,
        p.name AS product_name,
        p.barcode,
        p.category,
        p.reorder_level,
        p.price,
        i.warehouse_id,
        w.name AS warehouse_name,
        w.location AS warehouse_location,
        i.quantity,
        i.updated_at,
        CASE 
          WHEN i.quantity <= p.reorder_level THEN 'RED'
          WHEN i.quantity <= p.reorder_level * 1.5 THEN 'YELLOW'
          ELSE 'GREEN'
        END AS health_status
      FROM inventory i
      JOIN products p ON i.product_id = p.product_id
      JOIN warehouses w ON i.warehouse_id = w.warehouse_id
      ${whereClause}
      ORDER BY p.name ASC, w.name ASC
    `, params);

    res.json({
      success: true,
      count: rows.length,
      data: rows
    });
  } catch (error) {
    console.error('Error fetching inventory:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch inventory', error: error.message });
  }
};

// POST /api/inventory/stock-in - Perform Stock IN (Transaction)
exports.stockIn = async (req, res) => {
  const connection = await db.getConnection();
  try {
    const { product_id, warehouse_id, quantity } = req.body;

    const qty = parseInt(quantity, 10);
    if (!product_id || !warehouse_id || isNaN(qty) || qty <= 0) {
      return res.status(400).json({ success: false, message: 'Product ID, Warehouse ID, and positive Quantity are required' });
    }

    await connection.beginTransaction();

    // Verify product & warehouse exist
    const [products] = await connection.query(`SELECT product_id FROM products WHERE product_id = ?`, [product_id]);
    if (products.length === 0) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const [warehouses] = await connection.query(`SELECT warehouse_id FROM warehouses WHERE warehouse_id = ?`, [warehouse_id]);
    if (warehouses.length === 0) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: 'Warehouse not found' });
    }

    // Upsert inventory
    await connection.query(
      `INSERT INTO inventory (product_id, warehouse_id, quantity) 
       VALUES (?, ?, ?) 
       ON DUPLICATE KEY UPDATE quantity = quantity + ?`,
      [product_id, warehouse_id, qty, qty]
    );

    // Record stock movement
    await connection.query(
      `INSERT INTO stock_movements (product_id, warehouse_id, movement_type, quantity) 
       VALUES (?, ?, 'STOCK_IN', ?)`,
      [product_id, warehouse_id, qty]
    );

    await connection.commit();

    // Get updated stock quantity
    const [updated] = await db.query(
      `SELECT quantity FROM inventory WHERE product_id = ? AND warehouse_id = ?`,
      [product_id, warehouse_id]
    );

    res.json({
      success: true,
      message: `Successfully added ${qty} units to inventory`,
      data: {
        product_id,
        warehouse_id,
        added_quantity: qty,
        new_total_quantity: updated[0]?.quantity || qty
      }
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error performing stock-in:', error);
    res.status(500).json({ success: false, message: 'Stock-in failed', error: error.message });
  } finally {
    connection.release();
  }
};

// POST /api/inventory/stock-out - Perform Stock OUT (Transaction)
exports.stockOut = async (req, res) => {
  const connection = await db.getConnection();
  try {
    const { product_id, warehouse_id, quantity } = req.body;

    const qty = parseInt(quantity, 10);
    if (!product_id || !warehouse_id || isNaN(qty) || qty <= 0) {
      return res.status(400).json({ success: false, message: 'Product ID, Warehouse ID, and positive Quantity are required' });
    }

    await connection.beginTransaction();

    // Check existing inventory with Row Lock (FOR UPDATE)
    const [inventoryRows] = await connection.query(
      `SELECT quantity FROM inventory WHERE product_id = ? AND warehouse_id = ? FOR UPDATE`,
      [product_id, warehouse_id]
    );

    if (inventoryRows.length === 0 || inventoryRows[0].quantity < qty) {
      await connection.rollback();
      const currentQty = inventoryRows.length > 0 ? inventoryRows[0].quantity : 0;
      return res.status(409).json({
        success: false,
        message: `Insufficient stock. Requested: ${qty}, Available: ${currentQty}`
      });
    }

    // Deduct inventory
    await connection.query(
      `UPDATE inventory SET quantity = quantity - ? WHERE product_id = ? AND warehouse_id = ?`,
      [qty, product_id, warehouse_id]
    );

    // Record stock movement
    await connection.query(
      `INSERT INTO stock_movements (product_id, warehouse_id, movement_type, quantity) 
       VALUES (?, ?, 'STOCK_OUT', ?)`,
      [product_id, warehouse_id, qty]
    );

    await connection.commit();

    const newQty = inventoryRows[0].quantity - qty;

    res.json({
      success: true,
      message: `Successfully removed ${qty} units from inventory`,
      data: {
        product_id,
        warehouse_id,
        removed_quantity: qty,
        remaining_quantity: newQty
      }
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error performing stock-out:', error);
    res.status(500).json({ success: false, message: 'Stock-out failed', error: error.message });
  } finally {
    connection.release();
  }
};

// GET /api/inventory/low-stock - Get products at or below reorder level
exports.getLowStock = async (req, res) => {
  try {
    const { warehouse_id } = req.query;
    const params = [];
    let warehouseFilter = '';
    if (warehouse_id) {
      warehouseFilter = 'AND i.warehouse_id = ?';
      params.push(parseInt(warehouse_id, 10));
    }

    const [rows] = await db.query(`
      SELECT 
        i.inventory_id,
        i.product_id,
        p.name AS product_name,
        p.category,
        p.barcode,
        p.price,
        p.reorder_level,
        i.warehouse_id,
        w.name AS warehouse_name,
        w.location AS warehouse_location,
        i.quantity,
        i.quantity AS current_stock,
        'RED' AS health_status
      FROM inventory i
      JOIN products p ON i.product_id = p.product_id
      JOIN warehouses w ON i.warehouse_id = w.warehouse_id
      WHERE i.quantity <= p.reorder_level ${warehouseFilter}
      ORDER BY i.quantity ASC
    `, params);

    res.json({
      success: true,
      count: rows.length,
      data: rows
    });
  } catch (error) {
    console.error('Error fetching low stock:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch low stock items', error: error.message });
  }
};
