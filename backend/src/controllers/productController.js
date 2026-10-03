const db = require('../config/db');

// GET /api/products - Get all products with calculated total available stock
exports.getAllProducts = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        p.product_id,
        p.name,
        p.category,
        p.barcode,
        p.price,
        p.reorder_level,
        p.created_at,
        CAST(COALESCE(SUM(i.quantity), 0) AS SIGNED) AS available_stock
      FROM products p
      LEFT JOIN inventory i ON p.product_id = i.product_id
      GROUP BY p.product_id, p.name, p.category, p.barcode, p.price, p.reorder_level, p.created_at
      ORDER BY p.product_id ASC
    `);

    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch products', error: error.message });
  }
};

// GET /api/products/:id - Get product details with warehouse inventory breakdown
exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const [products] = await db.query(
      `SELECT p.*, CAST(COALESCE(SUM(i.quantity), 0) AS SIGNED) AS available_stock 
       FROM products p 
       LEFT JOIN inventory i ON p.product_id = i.product_id 
       WHERE p.product_id = ? 
       GROUP BY p.product_id`,
      [id]
    );

    if (products.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const product = products[0];

    // Fetch breakdown per warehouse
    const [warehouseStock] = await db.query(
      `SELECT w.warehouse_id, w.name AS warehouse_name, w.location, COALESCE(i.quantity, 0) AS quantity
       FROM warehouses w
       LEFT JOIN inventory i ON w.warehouse_id = i.warehouse_id AND i.product_id = ?
       ORDER BY w.warehouse_id ASC`,
      [id]
    );

    res.json({
      success: true,
      data: {
        ...product,
        warehouses: warehouseStock
      }
    });
  } catch (error) {
    console.error('Error fetching product by ID:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch product', error: error.message });
  }
};

// POST /api/products - Create product & initialize 0 inventory across existing warehouses
exports.createProduct = async (req, res) => {
  const connection = await db.getConnection();
  try {
    const { name, category, barcode, price, reorder_level } = req.body;

    if (!name || !category || !price) {
      return res.status(400).json({ success: false, message: 'Name, category, and price are required' });
    }

    await connection.beginTransaction();

    const [result] = await connection.query(
      `INSERT INTO products (name, category, barcode, price, reorder_level) VALUES (?, ?, ?, ?, ?)`,
      [name, category, barcode || `BAR-${Date.now()}`, price, reorder_level || 10]
    );

    const productId = result.insertId;

    // Get all warehouses and initialize inventory = 0
    const [warehouses] = await connection.query(`SELECT warehouse_id FROM warehouses`);
    for (const w of warehouses) {
      await connection.query(
        `INSERT INTO inventory (product_id, warehouse_id, quantity) VALUES (?, ?, 0)`,
        [productId, w.warehouse_id]
      );
    }

    await connection.commit();

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: { product_id: productId, name, category, barcode, price, reorder_level: reorder_level || 10, available_stock: 0 }
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error creating product:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ success: false, message: 'Barcode already exists' });
    }
    res.status(500).json({ success: false, message: 'Failed to create product', error: error.message });
  } finally {
    connection.release();
  }
};

// PATCH /api/products/:id - Update product
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, price, reorder_level } = req.body;

    const [result] = await db.query(
      `UPDATE products 
       SET name = COALESCE(?, name), 
           category = COALESCE(?, category), 
           price = COALESCE(?, price), 
           reorder_level = COALESCE(?, reorder_level) 
       WHERE product_id = ?`,
      [name, category, price, reorder_level, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.json({ success: true, message: 'Product updated successfully' });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ success: false, message: 'Failed to update product', error: error.message });
  }
};
