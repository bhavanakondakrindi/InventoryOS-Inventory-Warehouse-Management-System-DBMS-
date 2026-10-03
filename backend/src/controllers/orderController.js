const db = require('../config/db');

// POST /api/orders - Place Customer Order with Smart Warehouse Allocation & Transaction
exports.createOrder = async (req, res) => {
  const connection = await db.getConnection();
  try {
    const { customer_id = 1, items } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart items are required' });
    }

    // Validate items structure
    for (const item of items) {
      if (!item.product_id || !item.quantity || item.quantity <= 0) {
        return res.status(400).json({ success: false, message: 'Invalid product_id or quantity in order items' });
      }
    }

    await connection.beginTransaction();

    // 1. Validate customer
    const [userRows] = await connection.query(`SELECT user_id, name FROM users WHERE user_id = ?`, [customer_id]);
    if (userRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: `Customer ID ${customer_id} not found` });
    }

    // 2. Fetch product details and calculate total amount from DB prices
    let totalAmount = 0;
    const validatedItems = [];

    for (const item of items) {
      const [productRows] = await connection.query(
        `SELECT product_id, name, price FROM products WHERE product_id = ?`,
        [item.product_id]
      );

      if (productRows.length === 0) {
        await connection.rollback();
        return res.status(404).json({ success: false, message: `Product ID ${item.product_id} not found` });
      }

      const product = productRows[0];
      const unitPrice = parseFloat(product.price);
      const itemTotal = unitPrice * item.quantity;
      totalAmount += itemTotal;

      validatedItems.push({
        product_id: product.product_id,
        name: product.name,
        quantity: parseInt(item.quantity, 10),
        unit_price: unitPrice
      });
    }

    // 3. Smart Warehouse Allocation Algorithm:
    // Find warehouses that have sufficient stock for ALL requested products
    const [allWarehouses] = await connection.query(`SELECT warehouse_id, name FROM warehouses`);
    
    let selectedWarehouse = null;
    let maxStockFound = -1;

    for (const w of allWarehouses) {
      let canFulfill = true;
      let totalWarehouseStockForOrder = 0;

      for (const item of validatedItems) {
        const [invRows] = await connection.query(
          `SELECT quantity FROM inventory WHERE warehouse_id = ? AND product_id = ?`,
          [w.warehouse_id, item.product_id]
        );

        const available = invRows.length > 0 ? invRows[0].quantity : 0;
        if (available < item.quantity) {
          canFulfill = false;
          break;
        }
        totalWarehouseStockForOrder += available;
      }

      if (canFulfill) {
        if (totalWarehouseStockForOrder > maxStockFound) {
          maxStockFound = totalWarehouseStockForOrder;
          selectedWarehouse = w;
        }
      }
    }

    if (!selectedWarehouse) {
      await connection.rollback();
      return res.status(409).json({
        success: false,
        message: 'Order failed: Insufficient stock across all single warehouses to fulfill this complete order.'
      });
    }

    const warehouseId = selectedWarehouse.warehouse_id;

    // 4. Create Order
    const [orderResult] = await connection.query(
      `INSERT INTO orders (customer_id, warehouse_id, status, total_amount) VALUES (?, ?, 'PENDING', ?)`,
      [customer_id, warehouseId, totalAmount]
    );

    const orderId = orderResult.insertId;

    // 5. Process each item: insert order_item, reduce inventory, record stock_movement
    for (const item of validatedItems) {
      // Row lock check
      const [invCheck] = await connection.query(
        `SELECT quantity FROM inventory WHERE warehouse_id = ? AND product_id = ? FOR UPDATE`,
        [warehouseId, item.product_id]
      );

      if (invCheck.length === 0 || invCheck[0].quantity < item.quantity) {
        throw new Error(`Concurrency constraint: Stock for product ${item.name} changed during order placement`);
      }

      // Insert Order Item
      await connection.query(
        `INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES (?, ?, ?, ?)`,
        [orderId, item.product_id, item.quantity, item.unit_price]
      );

      // Decrease Inventory
      await connection.query(
        `UPDATE inventory SET quantity = quantity - ? WHERE warehouse_id = ? AND product_id = ?`,
        [item.quantity, warehouseId, item.product_id]
      );

      // Record Stock Movement with movement_type = ORDER
      await connection.query(
        `INSERT INTO stock_movements (product_id, warehouse_id, movement_type, quantity, order_id) 
         VALUES (?, ?, 'ORDER', ?, ?)`,
        [item.product_id, warehouseId, item.quantity, orderId]
      );
    }

    await connection.commit();

    res.status(201).json({
      success: true,
      message: 'Order placed successfully!',
      data: {
        order_id: orderId,
        customer_id,
        warehouse_id: warehouseId,
        warehouse_name: selectedWarehouse.name,
        status: 'PENDING',
        total_amount: totalAmount.toFixed(2),
        items: validatedItems
      }
    });

  } catch (error) {
    await connection.rollback();
    console.error('Error placing order:', error);
    res.status(500).json({ success: false, message: 'Failed to place order', error: error.message });
  } finally {
    connection.release();
  }
};

// GET /api/orders - Get all orders
exports.getAllOrders = async (req, res) => {
  try {
    const [orders] = await db.query(`
      SELECT 
        o.order_id,
        o.customer_id,
        u.name AS customer_name,
        o.warehouse_id,
        w.name AS warehouse_name,
        o.status,
        o.total_amount,
        o.created_at,
        COUNT(oi.order_item_id) AS total_items
      FROM orders o
      JOIN users u ON o.customer_id = u.user_id
      JOIN warehouses w ON o.warehouse_id = w.warehouse_id
      LEFT JOIN order_items oi ON o.order_id = oi.order_id
      GROUP BY o.order_id
      ORDER BY o.order_id DESC
    `);

    res.json({ success: true, data: orders });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch orders', error: error.message });
  }
};

// GET /api/orders/:id - Get specific order details
exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const [orders] = await db.query(`
      SELECT 
        o.order_id,
        o.customer_id,
        u.name AS customer_name,
        u.email AS customer_email,
        o.warehouse_id,
        w.name AS warehouse_name,
        w.location AS warehouse_location,
        o.status,
        o.total_amount,
        o.created_at
      FROM orders o
      JOIN users u ON o.customer_id = u.user_id
      JOIN warehouses w ON o.warehouse_id = w.warehouse_id
      WHERE o.order_id = ?
    `, [id]);

    if (orders.length === 0) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const order = orders[0];

    const [items] = await db.query(`
      SELECT 
        oi.order_item_id,
        oi.product_id,
        p.name AS product_name,
        p.category,
        p.barcode,
        oi.quantity,
        oi.unit_price,
        (oi.quantity * oi.unit_price) AS line_total
      FROM order_items oi
      JOIN products p ON oi.product_id = p.product_id
      WHERE oi.order_id = ?
    `, [id]);

    res.json({
      success: true,
      data: {
        ...order,
        items
      }
    });
  } catch (error) {
    console.error('Error fetching order by ID:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch order details', error: error.message });
  }
};

// GET /api/orders/customer/:customerId - Get order history for customer
exports.getCustomerOrders = async (req, res) => {
  try {
    const { customerId } = req.params;
    const [orders] = await db.query(`
      SELECT 
        o.order_id,
        o.warehouse_id,
        w.name AS warehouse_name,
        o.status,
        o.total_amount,
        o.created_at
      FROM orders o
      JOIN warehouses w ON o.warehouse_id = w.warehouse_id
      WHERE o.customer_id = ?
      ORDER BY o.order_id DESC
    `, [customerId]);

    // Fetch items for each order
    for (let order of orders) {
      const [items] = await db.query(`
        SELECT oi.product_id, p.name AS product_name, oi.quantity, oi.unit_price
        FROM order_items oi
        JOIN products p ON oi.product_id = p.product_id
        WHERE oi.order_id = ?
      `, [order.order_id]);
      order.items = items;
    }

    res.json({ success: true, data: orders });
  } catch (error) {
    console.error('Error fetching customer orders:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch customer orders', error: error.message });
  }
};

// PATCH /api/orders/:id/status - Update Order Status (e.g., PENDING -> DELIVERED)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status = 'DELIVERED' } = req.body;

    const validStatuses = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status '${status}'. Allowed statuses: ${validStatuses.join(', ')}`
      });
    }

    // 1. Verify order exists
    const [orders] = await db.query(
      `SELECT order_id, status FROM orders WHERE order_id = ?`,
      [id]
    );

    if (orders.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Order #${id} not found`
      });
    }

    const currentStatus = orders[0].status;

    if (currentStatus === status) {
      return res.status(200).json({
        success: true,
        message: `Order #${id} is already ${status}`,
        order_id: parseInt(id, 10),
        status: status
      });
    }

    // 2. Execute parameterized SQL query to update status in MySQL
    // IMPORTANT: Inventory was already reduced during order creation.
    // This is purely a fulfillment/status operation.
    await db.query(
      `UPDATE orders SET status = ? WHERE order_id = ?`,
      [status, id]
    );

    res.json({
      success: true,
      message: `Order marked as ${status.toLowerCase()}`,
      order_id: parseInt(id, 10),
      previous_status: currentStatus,
      status: status
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ success: false, message: 'Failed to update order status', error: error.message });
  }
};

