-- Create database
CREATE DATABASE IF NOT EXISTS inventory_warehouse_db;
USE inventory_warehouse_db;

-- Drop existing tables in correct order if re-running
DROP TABLE IF EXISTS warehouse_transfers;
DROP TABLE IF EXISTS stock_movements;
DROP TABLE IF EXISTS purchase_order_items;
DROP TABLE IF EXISTS purchase_orders;
DROP TABLE IF EXISTS product_suppliers;
DROP TABLE IF EXISTS suppliers;
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS inventory;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS warehouses;
DROP TABLE IF EXISTS users;

-- 1. USERS TABLE
CREATE TABLE users (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('CUSTOMER', 'WAREHOUSE_MANAGER', 'ADMIN') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. WAREHOUSES TABLE
CREATE TABLE warehouses (
  warehouse_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  location VARCHAR(150) NOT NULL,
  manager_id INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (manager_id) REFERENCES users(user_id) ON DELETE SET NULL
);

-- 3. PRODUCTS TABLE (No stock quantity column here!)
CREATE TABLE products (
  product_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  category VARCHAR(100) NOT NULL,
  barcode VARCHAR(100) UNIQUE,
  price DECIMAL(10,2) NOT NULL,
  reorder_level INT NOT NULL DEFAULT 10,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. INVENTORY TABLE (Product + Warehouse = Quantity)
CREATE TABLE inventory (
  inventory_id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  warehouse_id INT NOT NULL,
  quantity INT NOT NULL DEFAULT 0,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE,
  FOREIGN KEY (warehouse_id) REFERENCES warehouses(warehouse_id) ON DELETE CASCADE,
  CONSTRAINT unique_product_warehouse UNIQUE (product_id, warehouse_id)
);

-- 5. SUPPLIERS TABLE
CREATE TABLE suppliers (
  supplier_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(150),
  phone VARCHAR(20),
  address VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. PRODUCT_SUPPLIERS TABLE
CREATE TABLE product_suppliers (
  product_id INT NOT NULL,
  supplier_id INT NOT NULL,
  supplier_price DECIMAL(10,2),
  PRIMARY KEY (product_id, supplier_id),
  FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE,
  FOREIGN KEY (supplier_id) REFERENCES suppliers(supplier_id) ON DELETE CASCADE
);

-- 7. ORDERS TABLE
CREATE TABLE orders (
  order_id INT AUTO_INCREMENT PRIMARY KEY,
  customer_id INT NOT NULL,
  warehouse_id INT NOT NULL,
  status ENUM('PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED') DEFAULT 'PENDING',
  total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (warehouse_id) REFERENCES warehouses(warehouse_id) ON DELETE CASCADE
);

-- 8. ORDER_ITEMS TABLE
CREATE TABLE order_items (
  order_item_id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
);

-- 9. PURCHASE_ORDERS TABLE
CREATE TABLE purchase_orders (
  purchase_order_id INT AUTO_INCREMENT PRIMARY KEY,
  supplier_id INT NOT NULL,
  warehouse_id INT NOT NULL,
  status ENUM('PENDING', 'ORDERED', 'RECEIVED', 'CANCELLED') DEFAULT 'PENDING',
  order_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  expected_date DATE,
  FOREIGN KEY (supplier_id) REFERENCES suppliers(supplier_id) ON DELETE CASCADE,
  FOREIGN KEY (warehouse_id) REFERENCES warehouses(warehouse_id) ON DELETE CASCADE
);

-- 10. PURCHASE_ORDER_ITEMS TABLE
CREATE TABLE purchase_order_items (
  purchase_order_item_id INT AUTO_INCREMENT PRIMARY KEY,
  purchase_order_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (purchase_order_id) REFERENCES purchase_orders(purchase_order_id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
);

-- 11. STOCK_MOVEMENTS TABLE
CREATE TABLE stock_movements (
  movement_id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  warehouse_id INT NOT NULL,
  movement_type ENUM('STOCK_IN', 'STOCK_OUT', 'ORDER', 'TRANSFER_IN', 'TRANSFER_OUT') NOT NULL,
  quantity INT NOT NULL,
  order_id INT NULL,
  transfer_id INT NULL,
  purchase_order_id INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE,
  FOREIGN KEY (warehouse_id) REFERENCES warehouses(warehouse_id) ON DELETE CASCADE,
  FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE SET NULL
);

-- 12. WAREHOUSE_TRANSFERS TABLE
CREATE TABLE warehouse_transfers (
  transfer_id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  source_warehouse_id INT NOT NULL,
  destination_warehouse_id INT NOT NULL,
  quantity INT NOT NULL,
  status ENUM('PENDING', 'IN_TRANSIT', 'COMPLETED', 'CANCELLED') DEFAULT 'PENDING',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP NULL,
  FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE,
  FOREIGN KEY (source_warehouse_id) REFERENCES warehouses(warehouse_id) ON DELETE CASCADE,
  FOREIGN KEY (destination_warehouse_id) REFERENCES warehouses(warehouse_id) ON DELETE CASCADE,
  CONSTRAINT check_different_warehouses CHECK (source_warehouse_id <> destination_warehouse_id)
);

-- ==================================================
-- SEED DATA
-- ==================================================

-- Users
INSERT INTO users (user_id, name, email, password_hash, role) VALUES
(1, 'Rahul Sharma', 'customer@demo.com', 'customer123', 'CUSTOMER'),
(2, 'Ananya Roy', 'manager@demo.com', 'manager123', 'WAREHOUSE_MANAGER'),
(3, 'Admin User', 'admin@demo.com', 'admin123', 'ADMIN');

-- Warehouses
INSERT INTO warehouses (warehouse_id, name, location, manager_id) VALUES
(1, 'Hyderabad Central Hub', 'Hyderabad, Telangana', 2),
(2, 'Bangalore Tech Depot', 'Bangalore, Karnataka', 2),
(3, 'Chennai Logistics Park', 'Chennai, Tamil Nadu', 2);

-- Products
INSERT INTO products (product_id, name, category, barcode, price, reorder_level) VALUES
(1, 'Wireless Ergonomic Mouse', 'Accessories', 'BAR-001', 899.00, 10),
(2, 'Mechanical RGB Keyboard', 'Accessories', 'BAR-002', 3499.00, 8),
(3, '27" 4K Gaming Monitor', 'Monitors', 'BAR-003', 18499.00, 5),
(4, 'Noise-Cancelling Headphones', 'Headphones', 'BAR-004', 5999.00, 5),
(5, 'Ultra-thin Pro Laptop 15"', 'Laptops', 'BAR-005', 64999.00, 3),
(6, 'USB-C Multi-port Hub 7-in-1', 'Accessories', 'BAR-006', 1499.00, 15),
(7, 'Ergonomic Desk Cushion', 'Accessories', 'BAR-007', 1299.00, 8),
(8, 'Ultra HD Webcam 1080p', 'Monitors', 'BAR-008', 2999.00, 5),
(9, 'Bluetooth Desk Speakers', 'Headphones', 'BAR-009', 2499.00, 5),
(10, 'Portable Rugged SSD 1TB', 'Accessories', 'BAR-010', 7999.00, 5);

-- Inventory (Product, Warehouse, Quantity)
INSERT INTO inventory (product_id, warehouse_id, quantity) VALUES
-- Wireless Mouse (reorder: 10) Total = 35
(1, 1, 10),
(1, 2, 20),
(1, 3, 5),
-- Mechanical Keyboard (reorder: 8) Total = 25
(2, 1, 15),
(2, 2, 8),
(2, 3, 2),
-- 27" Gaming Monitor (reorder: 5) Total = 7
(3, 1, 5),
(3, 2, 2),
(3, 3, 0),
-- Noise Cancelling Headphones (reorder: 5) Total = 18
(4, 1, 2),
(4, 2, 12),
(4, 3, 4),
-- Laptop 15" (reorder: 3) Total = 5
(5, 1, 1),
(5, 2, 4),
(5, 3, 0),
-- USB-C Hub (reorder: 15) Total = 53
(6, 1, 25),
(6, 2, 18),
(6, 3, 10),
-- Ergonomic Cushion (reorder: 8) Total = 26
(7, 1, 12),
(7, 2, 6),
(7, 3, 8),
-- Webcam (reorder: 5) Total = 15
(8, 1, 7),
(8, 2, 3),
(8, 3, 5),
-- Bluetooth Speakers (reorder: 5) Total = 14
(9, 1, 10),
(9, 2, 3),
(9, 3, 1),
-- SSD 1TB (reorder: 5) Total = 27
(10, 1, 8),
(10, 2, 15),
(10, 3, 4);

-- Initial Stock Movements
INSERT INTO stock_movements (product_id, warehouse_id, movement_type, quantity) VALUES
(1, 1, 'STOCK_IN', 10),
(1, 2, 'STOCK_IN', 20),
(1, 3, 'STOCK_IN', 5),
(2, 1, 'STOCK_IN', 15),
(2, 2, 'STOCK_IN', 8),
(2, 3, 'STOCK_IN', 2),
(3, 1, 'STOCK_IN', 5),
(3, 2, 'STOCK_IN', 2),
(4, 1, 'STOCK_IN', 2),
(4, 2, 'STOCK_IN', 12),
(4, 3, 'STOCK_IN', 4),
(5, 1, 'STOCK_IN', 1),
(5, 2, 'STOCK_IN', 4),
(6, 1, 'STOCK_IN', 25),
(6, 2, 'STOCK_IN', 18),
(6, 3, 'STOCK_IN', 10),
(7, 1, 'STOCK_IN', 12),
(7, 2, 'STOCK_IN', 6),
(7, 3, 'STOCK_IN', 8),
(8, 1, 'STOCK_IN', 7),
(8, 2, 'STOCK_IN', 3),
(8, 3, 'STOCK_IN', 5),
(9, 1, 'STOCK_IN', 10),
(9, 2, 'STOCK_IN', 3),
(9, 3, 'STOCK_IN', 1),
(10, 1, 'STOCK_IN', 8),
(10, 2, 'STOCK_IN', 15),
(10, 3, 'STOCK_IN', 4);

-- Suppliers
INSERT INTO suppliers (supplier_id, name, email, phone, address) VALUES
(1, 'TechSupply Global', 'sales@techsupply.com', '+91 9876543210', 'Tech Park, Whitefield, Bangalore'),
(2, 'ElectroComp Ltd', 'contact@electrocomp.in', '+91 9123456789', 'HITEC City, Hyderabad');

-- Product Suppliers
INSERT INTO product_suppliers (product_id, supplier_id, supplier_price) VALUES
(1, 1, 500.00),
(2, 1, 2200.00),
(3, 2, 14000.00),
(4, 2, 4000.00),
(5, 1, 52000.00);
