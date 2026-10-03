const db = require('../config/db');

// GET /api/suppliers - List all suppliers with product counts
exports.getAllSuppliers = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        s.supplier_id,
        s.name,
        s.email,
        s.phone,
        s.address,
        s.created_at,
        COUNT(DISTINCT ps.product_id) AS product_count
      FROM suppliers s
      LEFT JOIN product_suppliers ps ON s.supplier_id = ps.supplier_id
      GROUP BY s.supplier_id
      ORDER BY s.name ASC
    `);
    res.json({ success: true, count: rows.length, data: rows });
  } catch (error) {
    console.error('Error fetching suppliers:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch suppliers', error: error.message });
  }
};

// GET /api/suppliers/:id - Get supplier details with supplied products
exports.getSupplierById = async (req, res) => {
  try {
    const { id } = req.params;
    const [suppliers] = await db.query(`SELECT * FROM suppliers WHERE supplier_id = ?`, [id]);
    if (suppliers.length === 0) {
      return res.status(404).json({ success: false, message: 'Supplier not found' });
    }
    const [products] = await db.query(`
      SELECT p.product_id, p.name, p.category, p.barcode, p.price, ps.supplier_price
      FROM product_suppliers ps
      JOIN products p ON ps.product_id = p.product_id
      WHERE ps.supplier_id = ?
      ORDER BY p.name ASC
    `, [id]);
    res.json({ success: true, data: { ...suppliers[0], products } });
  } catch (error) {
    console.error('Error fetching supplier by ID:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch supplier', error: error.message });
  }
};

// POST /api/suppliers - Create a new supplier
exports.createSupplier = async (req, res) => {
  try {
    const { name, email, phone, address } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Supplier name is required' });
    const [result] = await db.query(
      `INSERT INTO suppliers (name, email, phone, address) VALUES (?, ?, ?, ?)`,
      [name, email || null, phone || null, address || null]
    );
    res.status(201).json({ success: true, message: 'Supplier created', data: { supplier_id: result.insertId, name, email, phone, address } });
  } catch (error) {
    console.error('Error creating supplier:', error);
    res.status(500).json({ success: false, message: 'Failed to create supplier', error: error.message });
  }
};
