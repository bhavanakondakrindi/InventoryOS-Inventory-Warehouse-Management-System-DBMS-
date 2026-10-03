const db = require('../config/db');

// GET /api/dashboard/summary - Key system metrics from real SQL
exports.getSummary = async (req, res) => {
  try {
    const [[{ totalProducts }]] = await db.query(`SELECT COUNT(*) AS totalProducts FROM products`);
    const [[{ totalUnits }]] = await db.query(`SELECT CAST(COALESCE(SUM(quantity), 0) AS SIGNED) AS totalUnits FROM inventory`);
    // Count individual product-warehouse inventory rows at or below reorder level,
    // matching the row granularity of the Low Stock Alerts page (one row per
    // product per warehouse). Low-stock definition: i.quantity <= p.reorder_level.
    const [[{ lowStockProducts }]] = await db.query(`
      SELECT COUNT(*) AS lowStockProducts
      FROM inventory i
      JOIN products p ON i.product_id = p.product_id
      WHERE i.quantity <= p.reorder_level
    `);
    const [[{ pendingOrders }]] = await db.query(`SELECT COUNT(*) AS pendingOrders FROM orders WHERE status = 'PENDING'`);
    const [[{ totalWarehouses }]] = await db.query(`SELECT COUNT(*) AS totalWarehouses FROM warehouses`);

    const [recentMovements] = await db.query(`
      SELECT 
        sm.movement_id,
        sm.movement_type,
        sm.quantity,
        p.name AS product_name,
        w.name AS warehouse_name,
        sm.created_at
      FROM stock_movements sm
      JOIN products p ON sm.product_id = p.product_id
      JOIN warehouses w ON sm.warehouse_id = w.warehouse_id
      ORDER BY sm.movement_id DESC
      LIMIT 5
    `);

    const [warehouseDistribution] = await db.query(`
      SELECT 
        w.warehouse_id,
        w.name AS warehouse_name,
        w.location,
        CAST(COALESCE(SUM(i.quantity), 0) AS SIGNED) AS total_quantity
      FROM warehouses w
      LEFT JOIN inventory i ON w.warehouse_id = i.warehouse_id
      GROUP BY w.warehouse_id, w.name, w.location
      ORDER BY w.warehouse_id ASC
    `);

    res.json({
      success: true,
      data: {
        totalProducts,
        totalUnits,
        lowStockProducts,
        pendingOrders,
        totalWarehouses,
        recentMovements,
        warehouseDistribution
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard summary:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch dashboard summary', error: error.message });
  }
};
