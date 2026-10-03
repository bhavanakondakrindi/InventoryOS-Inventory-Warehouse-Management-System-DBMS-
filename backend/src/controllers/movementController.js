const db = require('../config/db');

// GET /api/movements - Get stock movement history
exports.getAllMovements = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        sm.movement_id,
        sm.product_id,
        p.name AS product_name,
        p.category,
        sm.warehouse_id,
        w.name AS warehouse_name,
        sm.movement_type,
        sm.quantity,
        sm.order_id,
        sm.transfer_id,
        sm.purchase_order_id,
        sm.created_at
      FROM stock_movements sm
      JOIN products p ON sm.product_id = p.product_id
      JOIN warehouses w ON sm.warehouse_id = w.warehouse_id
      ORDER BY sm.movement_id DESC
    `);

    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error fetching stock movements:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch stock movements', error: error.message });
  }
};

// GET /api/movements/product/:productId - Get stock movement history for a product
exports.getProductMovements = async (req, res) => {
  try {
    const { productId } = req.params;
    const [rows] = await db.query(`
      SELECT 
        sm.movement_id,
        sm.product_id,
        p.name AS product_name,
        sm.warehouse_id,
        w.name AS warehouse_name,
        sm.movement_type,
        sm.quantity,
        sm.order_id,
        sm.created_at
      FROM stock_movements sm
      JOIN products p ON sm.product_id = p.product_id
      JOIN warehouses w ON sm.warehouse_id = w.warehouse_id
      WHERE sm.product_id = ?
      ORDER BY sm.movement_id DESC
    `, [productId]);

    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error fetching product movements:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch product stock movements', error: error.message });
  }
};
