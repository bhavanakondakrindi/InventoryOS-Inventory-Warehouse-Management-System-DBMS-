const db = require('../config/db');

// GET /api/purchase-orders - List all purchase orders
exports.getAllPurchaseOrders = async (req, res) => {
  try {
    const { warehouse_id, status } = req.query;
    const conditions = [];
    const params = [];
    if (warehouse_id) { conditions.push('po.warehouse_id = ?'); params.push(parseInt(warehouse_id, 10)); }
    if (status)       { conditions.push('po.status = ?');       params.push(status); }
    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const [rows] = await db.query(`
      SELECT 
        po.purchase_order_id,
        po.supplier_id,
        s.name AS supplier_name,
        po.warehouse_id,
        w.name AS warehouse_name,
        w.location AS warehouse_location,
        po.status,
        po.order_date,
        po.expected_date,
        COUNT(poi.purchase_order_item_id) AS total_line_items,
        COALESCE(SUM(poi.quantity * poi.unit_price), 0) AS total_value
      FROM purchase_orders po
      JOIN suppliers s ON po.supplier_id = s.supplier_id
      JOIN warehouses w ON po.warehouse_id = w.warehouse_id
      LEFT JOIN purchase_order_items poi ON po.purchase_order_id = poi.purchase_order_id
      ${where}
      GROUP BY po.purchase_order_id
      ORDER BY po.purchase_order_id DESC
    `, params);

    res.json({ success: true, count: rows.length, data: rows });
  } catch (error) {
    console.error('Error fetching purchase orders:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch purchase orders', error: error.message });
  }
};

// GET /api/purchase-orders/:id - Get specific PO with line items
exports.getPurchaseOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const [pos] = await db.query(`
      SELECT po.*, s.name AS supplier_name, w.name AS warehouse_name
      FROM purchase_orders po
      JOIN suppliers s ON po.supplier_id = s.supplier_id
      JOIN warehouses w ON po.warehouse_id = w.warehouse_id
      WHERE po.purchase_order_id = ?
    `, [id]);
    if (pos.length === 0) return res.status(404).json({ success: false, message: 'Purchase order not found' });

    const [items] = await db.query(`
      SELECT poi.*, p.name AS product_name, p.category, p.barcode
      FROM purchase_order_items poi
      JOIN products p ON poi.product_id = p.product_id
      WHERE poi.purchase_order_id = ?
    `, [id]);

    res.json({ success: true, data: { ...pos[0], items } });
  } catch (error) {
    console.error('Error fetching PO by ID:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch purchase order', error: error.message });
  }
};

// POST /api/purchase-orders - Create a new purchase order
exports.createPurchaseOrder = async (req, res) => {
  const connection = await db.getConnection();
  try {
    const { supplier_id, warehouse_id, expected_date, items } = req.body;
    if (!supplier_id || !warehouse_id || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'supplier_id, warehouse_id, and items[] are required' });
    }

    await connection.beginTransaction();

    const [poResult] = await connection.query(
      `INSERT INTO purchase_orders (supplier_id, warehouse_id, status, expected_date) VALUES (?, ?, 'PENDING', ?)`,
      [supplier_id, warehouse_id, expected_date || null]
    );
    const poId = poResult.insertId;

    for (const item of items) {
      await connection.query(
        `INSERT INTO purchase_order_items (purchase_order_id, product_id, quantity, unit_price) VALUES (?, ?, ?, ?)`,
        [poId, item.product_id, item.quantity, item.unit_price || 0]
      );
    }

    await connection.commit();
    res.status(201).json({ success: true, message: 'Purchase order created', data: { purchase_order_id: poId } });
  } catch (error) {
    await connection.rollback();
    console.error('Error creating purchase order:', error);
    res.status(500).json({ success: false, message: 'Failed to create purchase order', error: error.message });
  } finally {
    connection.release();
  }
};

// PATCH /api/purchase-orders/:id/status - Update PO status (RECEIVED triggers stock-in)
exports.updatePurchaseOrderStatus = async (req, res) => {
  const connection = await db.getConnection();
  try {
    const { id } = req.params;
    const { status } = req.body;
    const validStatuses = ['PENDING', 'ORDERED', 'RECEIVED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: `Invalid status. Allowed: ${validStatuses.join(', ')}` });
    }

    const [pos] = await connection.query(`SELECT * FROM purchase_orders WHERE purchase_order_id = ?`, [id]);
    if (pos.length === 0) return res.status(404).json({ success: false, message: 'Purchase order not found' });

    await connection.beginTransaction();
    await connection.query(`UPDATE purchase_orders SET status = ? WHERE purchase_order_id = ?`, [status, id]);

    // If marking RECEIVED: add stock to inventory and record movements
    if (status === 'RECEIVED' && pos[0].status !== 'RECEIVED') {
      const [items] = await connection.query(
        `SELECT * FROM purchase_order_items WHERE purchase_order_id = ?`, [id]
      );
      const warehouseId = pos[0].warehouse_id;

      for (const item of items) {
        await connection.query(
          `INSERT INTO inventory (product_id, warehouse_id, quantity) VALUES (?, ?, ?)
           ON DUPLICATE KEY UPDATE quantity = quantity + ?`,
          [item.product_id, warehouseId, item.quantity, item.quantity]
        );
        await connection.query(
          `INSERT INTO stock_movements (product_id, warehouse_id, movement_type, quantity, purchase_order_id)
           VALUES (?, ?, 'STOCK_IN', ?, ?)`,
          [item.product_id, warehouseId, item.quantity, id]
        );
      }
    }

    await connection.commit();
    res.json({ success: true, message: `Purchase order marked as ${status}`, purchase_order_id: parseInt(id), status });
  } catch (error) {
    await connection.rollback();
    console.error('Error updating PO status:', error);
    res.status(500).json({ success: false, message: 'Failed to update purchase order status', error: error.message });
  } finally {
    connection.release();
  }
};
