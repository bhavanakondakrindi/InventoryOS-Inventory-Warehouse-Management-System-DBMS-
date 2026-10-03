const db = require('../config/db');

// GET /api/warehouses - List all warehouses with stock summary
exports.getAllWarehouses = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        w.warehouse_id,
        w.name,
        w.location,
        w.manager_id,
        u.name AS manager_name,
        w.created_at,
        CAST(COALESCE(SUM(i.quantity), 0) AS SIGNED) AS total_units,
        COUNT(DISTINCT CASE WHEN i.quantity > 0 THEN i.product_id END) AS total_products
      FROM warehouses w
      LEFT JOIN users u ON w.manager_id = u.user_id
      LEFT JOIN inventory i ON w.warehouse_id = i.warehouse_id
      GROUP BY w.warehouse_id, w.name, w.location, w.manager_id, u.name, w.created_at
      ORDER BY w.warehouse_id ASC
    `);

    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error fetching warehouses:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch warehouses', error: error.message });
  }
};

// GET /api/warehouses/:id - Get specific warehouse details with inventory
exports.getWarehouseById = async (req, res) => {
  try {
    const { id } = req.params;
    const [warehouses] = await db.query(`
      SELECT w.*, u.name AS manager_name
      FROM warehouses w
      LEFT JOIN users u ON w.manager_id = u.user_id
      WHERE w.warehouse_id = ?
    `, [id]);

    if (warehouses.length === 0) {
      return res.status(404).json({ success: false, message: 'Warehouse not found' });
    }

    const warehouse = warehouses[0];

    const [inventory] = await db.query(`
      SELECT 
        i.inventory_id,
        i.product_id,
        p.name AS product_name,
        p.category,
        p.price,
        p.reorder_level,
        i.quantity,
        i.updated_at,
        CASE 
          WHEN i.quantity <= p.reorder_level THEN 'RED'
          WHEN i.quantity <= p.reorder_level * 1.5 THEN 'YELLOW'
          ELSE 'GREEN'
        END AS health_status
      FROM inventory i
      JOIN products p ON i.product_id = p.product_id
      WHERE i.warehouse_id = ?
      ORDER BY p.name ASC
    `, [id]);

    res.json({
      success: true,
      data: {
        ...warehouse,
        inventory
      }
    });
  } catch (error) {
    console.error('Error fetching warehouse by ID:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch warehouse details', error: error.message });
  }
};
