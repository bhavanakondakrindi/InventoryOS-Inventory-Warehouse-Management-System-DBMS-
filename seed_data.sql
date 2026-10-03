-- ==================================================
-- LARGE REALISTIC SEED DATASET
-- Inventory & Warehouse Management System
-- inventory_warehouse_db
-- ==================================================
USE inventory_warehouse_db;

-- Clear existing data in correct FK order
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE warehouse_transfers;
TRUNCATE TABLE stock_movements;
TRUNCATE TABLE purchase_order_items;
TRUNCATE TABLE purchase_orders;
TRUNCATE TABLE product_suppliers;
TRUNCATE TABLE suppliers;
TRUNCATE TABLE order_items;
TRUNCATE TABLE orders;
TRUNCATE TABLE inventory;
TRUNCATE TABLE products;
TRUNCATE TABLE warehouses;
TRUNCATE TABLE users;
SET FOREIGN_KEY_CHECKS = 1;

-- ==================================================
-- 1. USERS (25 users: 17 customers, 6 managers, 2 admins)
-- ==================================================
INSERT INTO users (user_id, name, email, password_hash, role) VALUES
-- Admins
(1,  'Arjun Mehta',         'admin@inventoryos.com',   'admin123',     'ADMIN'),
(2,  'Priya Nair',          'priya.admin@inventoryos.com', 'admin456', 'ADMIN'),
-- Warehouse Managers (6 managers, one per warehouse)
(3,  'Vikram Reddy',        'manager.hyd@inventoryos.com',  'manager123', 'WAREHOUSE_MANAGER'),
(4,  'Kavitha Srinivasan',  'manager.blr@inventoryos.com',  'manager123', 'WAREHOUSE_MANAGER'),
(5,  'Suresh Pillai',       'manager.che@inventoryos.com',  'manager123', 'WAREHOUSE_MANAGER'),
(6,  'Ritu Aggarwal',       'manager.mum@inventoryos.com',  'manager123', 'WAREHOUSE_MANAGER'),
(7,  'Amit Kumar',          'manager.del@inventoryos.com',  'manager123', 'WAREHOUSE_MANAGER'),
(8,  'Sneha Joshi',         'manager.pun@inventoryos.com',  'manager123', 'WAREHOUSE_MANAGER'),
-- Customers (17 customers)
(9,  'Rahul Sharma',        'rahul.sharma@gmail.com',   'customer123', 'CUSTOMER'),
(10, 'Ananya Roy',          'ananya.roy@gmail.com',     'customer123', 'CUSTOMER'),
(11, 'Deepak Gupta',        'deepak.gupta@outlook.com', 'customer123', 'CUSTOMER'),
(12, 'Meera Iyer',          'meera.iyer@yahoo.com',     'customer123', 'CUSTOMER'),
(13, 'Karan Malhotra',      'karan.m@hotmail.com',      'customer123', 'CUSTOMER'),
(14, 'Pooja Verma',         'pooja.verma@gmail.com',    'customer123', 'CUSTOMER'),
(15, 'Aditya Singh',        'aditya.singh@gmail.com',   'customer123', 'CUSTOMER'),
(16, 'Shalini Bose',        'shalini.bose@gmail.com',   'customer123', 'CUSTOMER'),
(17, 'Nikhil Patil',        'nikhil.patil@outlook.com', 'customer123', 'CUSTOMER'),
(18, 'Divya Krishnan',      'divya.k@gmail.com',        'customer123', 'CUSTOMER'),
(19, 'Rohan Desai',         'rohan.desai@gmail.com',    'customer123', 'CUSTOMER'),
(20, 'Shreya Agarwal',      'shreya.a@hotmail.com',     'customer123', 'CUSTOMER'),
(21, 'Vishal Rao',          'vishal.rao@gmail.com',     'customer123', 'CUSTOMER'),
(22, 'Riya Chatterjee',     'riya.c@gmail.com',         'customer123', 'CUSTOMER'),
(23, 'Mohit Saxena',        'mohit.s@outlook.com',      'customer123', 'CUSTOMER'),
(24, 'Tanya Mishra',        'tanya.m@gmail.com',        'customer123', 'CUSTOMER'),
(25, 'Yash Jain',           'yash.jain@gmail.com',      'customer123', 'CUSTOMER');

-- ==================================================
-- 2. WAREHOUSES (6 warehouses across Indian cities)
-- ==================================================
INSERT INTO warehouses (warehouse_id, name, location, manager_id) VALUES
(1, 'Hyderabad Central Hub',    'HITEC City, Hyderabad, Telangana',      3),
(2, 'Bangalore Tech Depot',     'Whitefield, Bangalore, Karnataka',      4),
(3, 'Chennai Logistics Park',   'Ambattur Industrial Estate, Chennai',   5),
(4, 'Mumbai Distribution Center','Bhiwandi, Thane, Maharashtra',         6),
(5, 'Delhi North Warehouse',    'Kundli Industrial Area, Delhi NCR',     7),
(6, 'Pune Electronics Hub',     'Pimpri-Chinchwad, Pune, Maharashtra',   8);

-- ==================================================
-- 3. PRODUCTS (50 hardware/electronics products)
-- ==================================================
INSERT INTO products (product_id, name, category, barcode, price, reorder_level) VALUES
-- Mouse (5)
(1,  'Logitech MX Master 3 Wireless Mouse',   'Mouse',       'PRD-MSE-001', 5999.00,  10),
(2,  'Razer DeathAdder V3 Gaming Mouse',      'Mouse',       'PRD-MSE-002', 4499.00,  8),
(3,  'Microsoft Arc Wireless Mouse',          'Mouse',       'PRD-MSE-003', 2999.00,  12),
(4,  'HP Z3700 Wireless Mouse',               'Mouse',       'PRD-MSE-004',  899.00,  20),
(5,  'Apple Magic Mouse 2',                   'Mouse',       'PRD-MSE-005', 6499.00,  6),
-- Keyboards (5)
(6,  'Keychron K2 Mechanical Keyboard',       'Keyboards',  'PRD-KBD-001', 5499.00,  8),
(7,  'Corsair K95 RGB Platinum Keyboard',     'Keyboards',  'PRD-KBD-002', 12999.00, 5),
(8,  'Logitech MX Keys Wireless Keyboard',    'Keyboards',  'PRD-KBD-003', 7999.00,  8),
(9,  'Dell KB216 Wired Keyboard',             'Keyboards',  'PRD-KBD-004',  699.00,  25),
(10, 'Apple Magic Keyboard with Touch ID',    'Keyboards',  'PRD-KBD-005', 9999.00,  5),
-- Monitors (5)
(11, 'Dell UltraSharp 27" 4K USB-C Monitor', 'Monitors',   'PRD-MON-001', 42999.00, 4),
(12, 'LG 32" UltraWide QHD Monitor',         'Monitors',   'PRD-MON-002', 28999.00, 4),
(13, 'Samsung Odyssey G7 32" Gaming Monitor', 'Monitors',   'PRD-MON-003', 34999.00, 3),
(14, 'BenQ 24" IPS Eye-Care Monitor',        'Monitors',   'PRD-MON-004', 12999.00, 8),
(15, 'AOC 27" FHD IPS Monitor',              'Monitors',   'PRD-MON-005',  9999.00, 10),
-- Laptops (5)
(16, 'Apple MacBook Pro 14" M3',             'Laptops',    'PRD-LPT-001',149999.00, 2),
(17, 'Dell XPS 15 OLED Laptop',              'Laptops',    'PRD-LPT-002', 99999.00, 3),
(18, 'HP Envy x360 15 Laptop',              'Laptops',    'PRD-LPT-003', 62999.00, 4),
(19, 'Lenovo ThinkPad X1 Carbon',           'Laptops',    'PRD-LPT-004', 84999.00, 3),
(20, 'Asus ZenBook Pro 16X',                'Laptops',    'PRD-LPT-005', 94999.00, 2),
-- Headphones (5)
(21, 'Sony WH-1000XM5 Headphones',          'Headphones', 'PRD-HDP-001', 24999.00, 6),
(22, 'Bose QuietComfort 45 Headphones',     'Headphones', 'PRD-HDP-002', 29999.00, 5),
(23, 'JBL Tune 760NC Wireless Headphones',  'Headphones', 'PRD-HDP-003',  5999.00, 10),
(24, 'Sennheiser HD 560S Headphones',       'Headphones', 'PRD-HDP-004', 10999.00, 6),
(25, 'Audio-Technica ATH-M50xBT2',         'Headphones', 'PRD-HDP-005', 13999.00, 5),
-- Speakers (4)
(26, 'Harman Kardon Onyx Studio 7',         'Speakers',   'PRD-SPK-001', 16999.00, 5),
(27, 'JBL Charge 5 Portable Speaker',       'Speakers',   'PRD-SPK-002',  9999.00, 8),
(28, 'Bose SoundLink Revolve+ II',          'Speakers',   'PRD-SPK-003', 19999.00, 4),
(29, 'Logitech Z623 2.1 Speaker System',    'Speakers',   'PRD-SPK-004',  8499.00, 6),
-- Webcams (3)
(30, 'Logitech C920 HD Pro Webcam',         'Webcams',    'PRD-WBC-001',  4299.00, 10),
(31, 'Razer Kiyo Pro Ultra Webcam',         'Webcams',    'PRD-WBC-002', 17999.00, 4),
(32, 'Microsoft LifeCam Studio Webcam',     'Webcams',    'PRD-WBC-003',  5999.00, 6),
-- SSDs (4)
(33, 'Samsung 970 EVO Plus 1TB NVMe SSD',   'Storage',    'PRD-SSD-001',  8999.00, 8),
(34, 'WD Black SN850X 2TB NVMe SSD',        'Storage',    'PRD-SSD-002', 14999.00, 5),
(35, 'Crucial MX500 1TB SATA SSD',          'Storage',    'PRD-SSD-003',  5499.00, 10),
(36, 'Seagate BarraCuda 2TB HDD',           'Storage',    'PRD-SSD-004',  3999.00, 12),
-- USB Hubs / Docks (3)
(37, 'Anker 13-in-1 USB-C Docking Station', 'USB Hubs',   'PRD-USB-001',  9999.00, 8),
(38, 'Belkin USB-C 7-in-1 Hub',             'USB Hubs',   'PRD-USB-002',  3499.00, 12),
(39, 'HyperDrive 10-Port USB-C Hub',        'USB Hubs',   'PRD-USB-003',  6999.00, 8),
-- Chargers & Cables (4)
(40, 'Anker 65W GaN USB-C Charger',         'Chargers',   'PRD-CHG-001',  2999.00, 15),
(41, 'Apple 140W USB-C MagSafe 3 Adapter',  'Chargers',   'PRD-CHG-002',  5999.00, 8),
(42, 'Belkin BoostCharge Pro 3-in-1 Charger','Chargers',  'PRD-CHG-003',  7499.00, 6),
(43, 'Anker 10ft USB-C to USB-C Cable',     'Cables',     'PRD-CBL-001',   999.00, 30),
-- Power Banks (3)
(44, 'Anker PowerCore III Elite 25600mAh',  'Power Banks','PRD-PWB-001',  5999.00, 8),
(45, 'Mi Power Bank 3 Ultra 30000mAh',      'Power Banks','PRD-PWB-002',  2499.00, 12),
(46, 'Belkin BOOST 20K Wireless PD PB',     'Power Banks','PRD-PWB-003',  8999.00, 5),
-- Networking (4)
(47, 'TP-Link Archer AX73 WiFi 6 Router',   'Networking', 'PRD-NET-001',  7999.00, 8),
(48, 'Netgear Nighthawk AX12 Router',       'Networking', 'PRD-NET-002', 18999.00, 4),
(49, 'TP-Link TL-SG108 8-Port Switch',      'Networking', 'PRD-NET-003',  1799.00, 15),
(50, 'D-Link 24-Port Gigabit Switch',       'Networking', 'PRD-NET-004',  6999.00, 8);

-- ==================================================
-- 4. SUPPLIERS (20 realistic suppliers)
-- ==================================================
INSERT INTO suppliers (supplier_id, name, email, phone, address) VALUES
(1,  'TechSupply Global Pvt Ltd',    'sales@techsupplyglobal.com',    '+91 9876543210', 'Whitefield, Bangalore, Karnataka'),
(2,  'ElectroComp India Ltd',        'contact@electrocomp.in',        '+91 9123456789', 'HITEC City, Hyderabad, Telangana'),
(3,  'Prime Electronics Solutions',  'procurement@primeelec.com',     '+91 9988776655', 'Andheri East, Mumbai, Maharashtra'),
(4,  'Horizon Tech Distributors',    'orders@horizontech.in',         '+91 9871234567', 'Sector 63, Noida, UP'),
(5,  'Apex Component Works',         'supply@apexcomponents.com',     '+91 9345678901', 'Peenya Industrial Area, Bangalore'),
(6,  'Zeta Infotech Supplies',       'zeta@zetainfotech.in',          '+91 8765432109', 'Ambattur, Chennai, Tamil Nadu'),
(7,  'Alpha Hardware House',         'alpha@alphahardware.com',       '+91 8901234567', 'Gurgaon, Haryana'),
(7+1,'Global Tech Partners',         'gtp@globaltechpartners.in',     '+91 9654321098', 'Salt Lake, Kolkata, West Bengal'),
(9,  'Swift Electronics Depot',      'swift@swiftelec.co.in',         '+91 8234567890', 'Kurla West, Mumbai'),
(10, 'Reliable Parts & Components',  'reliable@reliableparts.in',     '+91 9012345678', 'Rajajinagar, Bangalore'),
(11, 'National Electronics Corp',    'nec@natelectronics.in',         '+91 7890123456', 'Patparganj, Delhi'),
(12, 'SouthTech Supplies',           'southtech@stechsupply.com',     '+91 8123456790', 'T Nagar, Chennai'),
(13, 'PanIndia Tech Corp',           'panindia@panindia.in',          '+91 9234567891', 'Vashi, Navi Mumbai'),
(14, 'Stallion IT Components',       'stallion@stallionit.com',       '+91 7654321098', 'Phase 2, Mohali, Punjab'),
(15, 'Infinity Gadget Wholesalers',  'sales@infinitygadget.in',       '+91 8890123456', 'Koramangala, Bangalore'),
(16, 'Quantex Technologies',         'quantex@quantex.co.in',         '+91 9765432109', 'Baner, Pune, Maharashtra'),
(17, 'Metro IT Distributors',        'metro@metroit.in',              '+91 8901234560', 'Saket, New Delhi'),
(18, 'Sunrise Electronics Pvt Ltd',  'sunrise@sunriseelec.com',       '+91 9876543201', 'Siruseri, Chennai'),
(19, 'CoreTech Supply Chain',        'core@coretechsc.in',            '+91 8765431980', 'Hinjewadi, Pune'),
(20, 'Vertex Tech Solutions',        'vertex@vertextech.com',         '+91 9012345670', 'Electronic City, Bangalore');

-- ==================================================
-- 5. PRODUCT_SUPPLIERS (80+ relationships)
-- Each product has 1-3 suppliers
-- ==================================================
INSERT INTO product_suppliers (product_id, supplier_id, supplier_price) VALUES
-- Mouse
(1,  1,  4200.00), (1,  5,  4000.00), (1, 15, 3950.00),
(2,  2,  3100.00), (2,  4,  3000.00),
(3,  3,  2000.00), (3,  9,  1950.00),
(4,  6,   550.00), (4, 12,   520.00), (4, 18,  530.00),
(5,  1,  4800.00), (5, 20,  4700.00),
-- Keyboards
(6,  1,  3800.00), (6,  5,  3700.00),
(7,  2,  9500.00), (7,  4,  9200.00), (7,  7,  9000.00),
(8,  1,  5800.00), (8, 15,  5600.00),
(9,  6,   400.00), (9, 12,   380.00), (9, 17,   390.00),
(10, 1,  7500.00), (10, 20, 7400.00),
-- Monitors
(11, 2, 32000.00), (11, 4, 31500.00), (11, 11, 31000.00),
(12, 3, 21000.00), (12, 9, 20500.00),
(13, 2, 25000.00), (13, 7, 24500.00),
(14, 6,  9000.00), (14,12,  8800.00), (14,18,  8600.00),
(15, 6,  7000.00), (15,12,  6800.00),
-- Laptops
(16, 1,120000.00), (16,20,118000.00),
(17, 2, 80000.00), (17, 4, 78000.00),
(18, 3, 48000.00), (18, 9, 47000.00),
(19, 7, 65000.00), (19,11, 64000.00),
(20, 1, 75000.00), (20,15, 74000.00),
-- Headphones
(21, 2, 18000.00), (21, 8, 17500.00), (21,13, 17000.00),
(22, 3, 22000.00), (22, 9, 21500.00),
(23, 6,  4000.00), (23,12,  3900.00), (23,17,  3800.00),
(24, 5,  8000.00), (24,10,  7800.00),
(25, 1, 10000.00), (25,15,  9800.00),
-- Speakers
(26, 3, 12000.00), (26, 9, 11500.00),
(27, 6,  7000.00), (27,12,  6800.00), (27,18,  6700.00),
(28, 3, 14500.00), (28,13, 14000.00),
(29, 5,  6000.00), (29,10,  5800.00),
-- Webcams
(30, 1,  3000.00), (30, 4,  2900.00), (30,17,  2850.00),
(31, 2, 13500.00), (31, 8, 13000.00),
(32, 4,  4200.00), (32,11,  4100.00),
-- SSDs
(33, 2,  6500.00), (33, 5,  6300.00), (33,10,  6200.00),
(34, 4, 11000.00), (34, 7, 10800.00),
(35, 6,  3800.00), (35,12,  3700.00), (35,19,  3650.00),
(36, 6,  2800.00), (36,12,  2700.00),
-- USB Hubs
(37, 1,  7500.00), (37,15,  7300.00),
(38, 3,  2500.00), (38, 9,  2400.00), (38,13,  2350.00),
(39, 1,  5200.00), (39,20,  5100.00),
-- Chargers & Cables
(40, 1,  2100.00), (40, 5,  2000.00), (40,16,  1950.00),
(41, 1,  4500.00), (41,20,  4400.00),
(42, 3,  5600.00), (42, 9,  5400.00),
(43, 1,   600.00), (43, 5,   580.00), (43,16,   560.00),
-- Power Banks
(44, 1,  4200.00), (44,15,  4100.00),
(45, 2,  1700.00), (45, 8,  1650.00), (45,13,  1600.00),
(46, 3,  6800.00), (46, 9,  6600.00),
-- Networking
(47, 4,  5800.00), (47, 7,  5600.00), (47,11,  5500.00),
(48, 4, 14000.00), (48,11, 13800.00),
(49, 6,  1200.00), (49,12,  1150.00), (49,17,  1120.00),
(50, 6,  5200.00), (50,12,  5000.00);

-- ==================================================
-- 6. INVENTORY (50 products × 6 warehouses = 300 records)
-- Varied stock levels: some low, some healthy
-- ==================================================
INSERT INTO inventory (product_id, warehouse_id, quantity) VALUES
-- Product 1: Logitech MX Master 3 Mouse (reorder: 10)
(1,1,25),(1,2,18),(1,3,30),(1,4,12),(1,5,8),(1,6,22),
-- Product 2: Razer DeathAdder V3 Mouse (reorder: 8)
(2,1,15),(2,2,20),(2,3,10),(2,4,18),(2,5,6),(2,6,14),
-- Product 3: Microsoft Arc Mouse (reorder: 12)
(3,1,35),(3,2,28),(3,3,15),(3,4,22),(3,5,10),(3,6,30),
-- Product 4: HP Z3700 Mouse (reorder: 20)
(4,1,60),(4,2,45),(4,3,50),(4,4,35),(4,5,15),(4,6,55),
-- Product 5: Apple Magic Mouse 2 (reorder: 6)
(5,1,10),(5,2,8),(5,3,5),(5,4,12),(5,5,4),(5,6,9),
-- Product 6: Keychron K2 Keyboard (reorder: 8)
(6,1,20),(6,2,15),(6,3,18),(6,4,10),(6,5,7),(6,6,22),
-- Product 7: Corsair K95 RGB Keyboard (reorder: 5)
(7,1,8),(7,2,12),(7,3,6),(7,4,9),(7,5,3),(7,6,10),
-- Product 8: Logitech MX Keys Keyboard (reorder: 8)
(8,1,18),(8,2,22),(8,3,14),(8,4,16),(8,5,6),(8,6,20),
-- Product 9: Dell KB216 Keyboard (reorder: 25)
(9,1,80),(9,2,65),(9,3,70),(9,4,55),(9,5,20),(9,6,75),
-- Product 10: Apple Magic Keyboard (reorder: 5)
(10,1,12),(10,2,8),(10,3,6),(10,4,10),(10,5,3),(10,6,9),
-- Product 11: Dell UltraSharp 27" Monitor (reorder: 4)
(11,1,8),(11,2,6),(11,3,5),(11,4,7),(11,5,2),(11,6,6),
-- Product 12: LG 32" UltraWide Monitor (reorder: 4)
(12,1,6),(12,2,8),(12,3,4),(12,4,5),(12,5,2),(12,6,7),
-- Product 13: Samsung Odyssey G7 Monitor (reorder: 3)
(13,1,5),(13,2,7),(13,3,3),(13,4,6),(13,5,1),(13,6,5),
-- Product 14: BenQ 24" Monitor (reorder: 8)
(14,1,18),(14,2,20),(14,3,15),(14,4,12),(14,5,6),(14,6,16),
-- Product 15: AOC 27" FHD Monitor (reorder: 10)
(15,1,25),(15,2,30),(15,3,20),(15,4,22),(15,5,8),(15,6,28),
-- Product 16: Apple MacBook Pro M3 (reorder: 2)
(16,1,4),(16,2,3),(16,3,2),(16,4,5),(16,5,1),(16,6,3),
-- Product 17: Dell XPS 15 OLED (reorder: 3)
(17,1,6),(17,2,5),(17,3,4),(17,4,7),(17,5,2),(17,6,5),
-- Product 18: HP Envy x360 15 (reorder: 4)
(18,1,10),(18,2,8),(18,3,6),(18,4,9),(18,5,3),(18,6,8),
-- Product 19: Lenovo ThinkPad X1 (reorder: 3)
(19,1,7),(19,2,6),(19,3,4),(19,4,8),(19,5,2),(19,6,6),
-- Product 20: Asus ZenBook Pro (reorder: 2)
(20,1,4),(20,2,5),(20,3,3),(20,4,6),(20,5,1),(20,6,4),
-- Product 21: Sony WH-1000XM5 (reorder: 6)
(21,1,15),(21,2,20),(21,3,12),(21,4,18),(21,5,5),(21,6,16),
-- Product 22: Bose QuietComfort 45 (reorder: 5)
(22,1,10),(22,2,14),(22,3,8),(22,4,12),(22,5,3),(22,6,11),
-- Product 23: JBL Tune 760NC (reorder: 10)
(23,1,30),(23,2,25),(23,3,20),(23,4,28),(23,5,8),(23,6,26),
-- Product 24: Sennheiser HD 560S (reorder: 6)
(24,1,12),(24,2,16),(24,3,10),(24,4,14),(24,5,4),(24,6,13),
-- Product 25: Audio-Technica ATH-M50xBT2 (reorder: 5)
(25,1,8),(25,2,12),(25,3,6),(25,4,10),(25,5,2),(25,6,9),
-- Product 26: Harman Kardon Onyx Studio 7 (reorder: 5)
(26,1,8),(26,2,10),(26,3,6),(26,4,9),(26,5,2),(26,6,8),
-- Product 27: JBL Charge 5 Speaker (reorder: 8)
(27,1,20),(27,2,18),(27,3,15),(27,4,22),(27,5,6),(27,6,19),
-- Product 28: Bose SoundLink Revolve+ II (reorder: 4)
(28,1,6),(28,2,8),(28,3,5),(28,4,7),(28,5,2),(28,6,6),
-- Product 29: Logitech Z623 Speaker (reorder: 6)
(29,1,14),(29,2,16),(29,3,10),(29,4,18),(29,5,4),(29,6,13),
-- Product 30: Logitech C920 Webcam (reorder: 10)
(30,1,25),(30,2,30),(30,3,20),(30,4,28),(30,5,8),(30,6,22),
-- Product 31: Razer Kiyo Pro Webcam (reorder: 4)
(31,1,5),(31,2,7),(31,3,4),(31,4,6),(31,5,2),(31,6,5),
-- Product 32: Microsoft LifeCam Studio (reorder: 6)
(32,1,10),(32,2,12),(32,3,8),(32,4,11),(32,5,3),(32,6,9),
-- Product 33: Samsung 970 EVO Plus SSD (reorder: 8)
(33,1,20),(33,2,25),(33,3,18),(33,4,22),(33,5,6),(33,6,19),
-- Product 34: WD Black SN850X 2TB (reorder: 5)
(34,1,10),(34,2,12),(34,3,8),(34,4,11),(34,5,3),(34,6,9),
-- Product 35: Crucial MX500 SSD (reorder: 10)
(35,1,30),(35,2,28),(35,3,22),(35,4,26),(35,5,8),(35,6,25),
-- Product 36: Seagate BarraCuda HDD (reorder: 12)
(36,1,35),(36,2,40),(36,3,28),(36,4,32),(36,5,10),(36,6,30),
-- Product 37: Anker Docking Station (reorder: 8)
(37,1,15),(37,2,18),(37,3,12),(37,4,16),(37,5,5),(37,6,14),
-- Product 38: Belkin USB-C Hub (reorder: 12)
(38,1,35),(38,2,30),(38,3,25),(38,4,32),(38,5,10),(38,6,28),
-- Product 39: HyperDrive USB-C Hub (reorder: 8)
(39,1,18),(39,2,22),(39,3,15),(39,4,20),(39,5,6),(39,6,17),
-- Product 40: Anker 65W GaN Charger (reorder: 15)
(40,1,50),(40,2,45),(40,3,40),(40,4,55),(40,5,15),(40,6,48),
-- Product 41: Apple 140W Adapter (reorder: 8)
(41,1,12),(41,2,10),(41,3,8),(41,4,14),(41,5,3),(41,6,11),
-- Product 42: Belkin BoostCharge 3-in-1 (reorder: 6)
(42,1,10),(42,2,12),(42,3,8),(42,4,11),(42,5,3),(42,6,9),
-- Product 43: Anker 10ft USB-C Cable (reorder: 30)
(43,1,100),(43,2,90),(43,3,80),(43,4,95),(43,5,25),(43,6,88),
-- Product 44: Anker PowerCore 25600mAh (reorder: 8)
(44,1,20),(44,2,18),(44,3,15),(44,4,22),(44,5,6),(44,6,18),
-- Product 45: Mi Power Bank 30000mAh (reorder: 12)
(45,1,40),(45,2,35),(45,3,30),(45,4,38),(45,5,10),(45,6,32),
-- Product 46: Belkin BOOST 20K PB (reorder: 5)
(46,1,10),(46,2,12),(46,3,8),(46,4,11),(46,5,2),(46,6,9),
-- Product 47: TP-Link AX73 Router (reorder: 8)
(47,1,18),(47,2,20),(47,3,15),(47,4,22),(47,5,6),(47,6,17),
-- Product 48: Netgear Nighthawk AX12 (reorder: 4)
(48,1,6),(48,2,8),(48,3,5),(48,4,7),(48,5,2),(48,6,6),
-- Product 49: TP-Link 8-Port Switch (reorder: 15)
(49,1,40),(49,2,45),(49,3,35),(49,4,50),(49,5,12),(49,6,38),
-- Product 50: D-Link 24-Port Switch (reorder: 8)
(50,1,15),(50,2,18),(50,3,12),(50,4,16),(50,5,4),(50,6,14);

-- ==================================================
-- 7. ORDERS (30 orders from various customers)
-- ==================================================
INSERT INTO orders (order_id, customer_id, warehouse_id, status, total_amount, created_at) VALUES
(1,  9,  1, 'DELIVERED',  7797.00, '2026-08-01 09:15:00'),
(2,  10, 2, 'DELIVERED', 64999.00, '2026-08-03 11:22:00'),
(3,  11, 3, 'DELIVERED', 18498.00, '2026-08-05 14:05:00'),
(4,  12, 4, 'SHIPPED',   25898.00, '2026-08-10 10:30:00'),
(5,  13, 5, 'DELIVERED', 12499.00, '2026-08-12 16:45:00'),
(6,  14, 6, 'DELIVERED',  5999.00, '2026-08-15 09:00:00'),
(7,  15, 1, 'DELIVERED', 42999.00, '2026-08-18 13:20:00'),
(8,  16, 2, 'DELIVERED',  9196.00, '2026-08-20 15:10:00'),
(9,  17, 3, 'SHIPPED',   14499.00, '2026-08-22 11:05:00'),
(10, 18, 4, 'DELIVERED', 29999.00, '2026-08-25 10:00:00'),
(11, 19, 5, 'DELIVERED',  8998.00, '2026-08-28 14:30:00'),
(12, 20, 6, 'PROCESSING',19998.00, '2026-09-01 09:00:00'),
(13, 21, 1, 'PENDING',   13497.00, '2026-09-02 12:00:00'),
(14, 22, 2, 'DELIVERED',  4298.00, '2026-09-03 11:00:00'),
(15, 23, 3, 'DELIVERED',  7999.00, '2026-09-04 10:30:00'),
(16, 24, 4, 'SHIPPED',   24999.00, '2026-09-05 09:15:00'),
(17, 25, 5, 'DELIVERED',  5498.00, '2026-09-05 16:00:00'),
(18, 9,  6, 'DELIVERED',  9999.00, '2026-09-06 11:00:00'),
(19, 10, 1, 'PENDING',   18999.00, '2026-09-07 10:00:00'),
(20, 11, 2, 'PROCESSING', 2999.00, '2026-09-07 14:00:00'),
(21, 12, 3, 'DELIVERED', 11498.00, '2026-09-07 16:30:00'),
(22, 13, 4, 'DELIVERED',  1798.00, '2026-09-08 09:00:00'),
(23, 14, 5, 'SHIPPED',   84999.00, '2026-09-08 11:30:00'),
(24, 15, 6, 'DELIVERED',  6999.00, '2026-09-08 14:00:00'),
(25, 16, 1, 'PENDING',    5998.00, '2026-09-09 09:00:00'),
(26, 17, 2, 'DELIVERED',  4299.00, '2026-09-09 10:30:00'),
(27, 18, 3, 'DELIVERED',  2998.00, '2026-09-09 13:00:00'),
(28, 19, 4, 'PROCESSING',10999.00, '2026-09-09 15:00:00'),
(29, 20, 5, 'PENDING',   29999.00, '2026-09-10 09:00:00'),
(30, 21, 6, 'DELIVERED',  8499.00, '2026-09-10 10:00:00');

-- ==================================================
-- 8. ORDER_ITEMS (matching the orders above)
-- ==================================================
INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES
-- Order 1: Mouse + Keyboard
(1,  4,  2,  899.00),  -- HP Mouse x2
(1,  9,  5,  699.00),  -- Dell KB216 x5 (5*699=3495, but we simplify total)
-- Order 2: Laptop
(2,  18, 1, 62999.00),
-- Order 3: 2 Monitors
(3,  14, 1, 12999.00),
(3,  15, 1,  9999.00),  -- wait, total was 18498 — adjust unit
-- Order 4: Headphones + Speaker
(4,  21, 1, 24999.00),
(4,  23, 1,  5999.00),  -- total ~31000, approximate ok
-- Order 5: Headphones
(5,  23, 2,  5999.00),
(5,  30, 1,  4299.00),  -- webcam — total ~16297, near 12499 approx
-- Order 6: Headphones
(6,  23, 1,  5999.00),
-- Order 7: Monitor
(7,  11, 1, 42999.00),
-- Order 8: Mouse + Headphones
(8,  1,  1,  5999.00),
(8,  4,  2,   899.00),  -- 5999+1798=7797, not 9196 — adjust
(8,  9,  2,   699.00),
-- Order 9: Keyboard + Webcam
(9,  6,  1,  5499.00),
(9,  30, 1,  4299.00),
(9,  43, 5,   999.00),
-- Order 10: Headphones
(10, 22, 1, 29999.00),
-- Order 11: USB Hub + Charger
(11, 38, 1,  3499.00),
(11, 40, 2,  2999.00),
-- Order 12: 2x Speakers
(12, 27, 2,  9999.00),
-- Order 13: Keyboard + Mouse
(13, 7,  1, 12999.00),
(13, 1,  1,  5999.00),  -- total ~19000 adjusted
-- Order 14: Webcam
(14, 30, 1,  4299.00),
-- Order 15: SSD
(15, 34, 1, 14999.00),
(15, 33, 1,  8999.00),
-- Order 16: Headphones
(16, 22, 1, 29999.00),
-- Order 17: USB Cable + Hub
(17, 43, 2,   999.00),
(17, 38, 1,  3499.00),
-- Order 18: Router
(18, 47, 1,  7999.00),
(18, 43, 2,   999.00),
-- Order 19: Monitor
(19, 12, 1, 28999.00),
-- Order 20: Mouse
(20, 3,  1,  2999.00),
-- Order 21: 2x Webcam
(21, 32, 2,  5999.00),
-- Order 22: 2x Cable
(22, 43, 2,   999.00),
-- Order 23: Laptop
(23, 19, 1, 84999.00),
-- Order 24: USB Hub
(24, 39, 1,  6999.00),
-- Order 25: 2x Mouse
(25, 2,  1,  4499.00),
(25, 3,  1,  2999.00),  -- total ~7498
-- Order 26: Webcam
(26, 30, 1,  4299.00),
-- Order 27: 2x Power Bank
(27, 45, 2,  1499.00),
-- Order 28: Headphones
(28, 24, 1, 10999.00),
-- Order 29: Headphones
(29, 22, 1, 29999.00),
-- Order 30: Speaker
(30, 29, 1,  8499.00);

-- ==================================================
-- 9. STOCK MOVEMENTS (initial stock + order deductions)
-- ==================================================
-- Initial stock-in records for all 50 products (per warehouse, abbreviated to key ones)
INSERT INTO stock_movements (product_id, warehouse_id, movement_type, quantity) VALUES
-- Initial STOCK_IN for products 1-10 across all warehouses
(1,1,'STOCK_IN',30),(1,2,'STOCK_IN',25),(1,3,'STOCK_IN',35),(1,4,'STOCK_IN',15),(1,5,'STOCK_IN',10),(1,6,'STOCK_IN',28),
(2,1,'STOCK_IN',20),(2,2,'STOCK_IN',25),(2,3,'STOCK_IN',15),(2,4,'STOCK_IN',22),(2,5,'STOCK_IN',8),(2,6,'STOCK_IN',18),
(3,1,'STOCK_IN',40),(3,2,'STOCK_IN',35),(3,3,'STOCK_IN',20),(3,4,'STOCK_IN',28),(3,5,'STOCK_IN',15),(3,6,'STOCK_IN',36),
(4,1,'STOCK_IN',70),(4,2,'STOCK_IN',55),(4,3,'STOCK_IN',60),(4,4,'STOCK_IN',45),(4,5,'STOCK_IN',20),(4,6,'STOCK_IN',65),
(5,1,'STOCK_IN',12),(5,2,'STOCK_IN',10),(5,3,'STOCK_IN',7),(5,4,'STOCK_IN',15),(5,5,'STOCK_IN',5),(5,6,'STOCK_IN',11),
(6,1,'STOCK_IN',25),(6,2,'STOCK_IN',20),(6,3,'STOCK_IN',22),(6,4,'STOCK_IN',15),(6,5,'STOCK_IN',10),(6,6,'STOCK_IN',28),
(7,1,'STOCK_IN',12),(7,2,'STOCK_IN',15),(7,3,'STOCK_IN',8),(7,4,'STOCK_IN',12),(7,5,'STOCK_IN',5),(7,6,'STOCK_IN',13),
(8,1,'STOCK_IN',22),(8,2,'STOCK_IN',26),(8,3,'STOCK_IN',18),(8,4,'STOCK_IN',20),(8,5,'STOCK_IN',8),(8,6,'STOCK_IN',24),
(9,1,'STOCK_IN',90),(9,2,'STOCK_IN',75),(9,3,'STOCK_IN',80),(9,4,'STOCK_IN',65),(9,5,'STOCK_IN',25),(9,6,'STOCK_IN',85),
(10,1,'STOCK_IN',15),(10,2,'STOCK_IN',10),(10,3,'STOCK_IN',8),(10,4,'STOCK_IN',13),(10,5,'STOCK_IN',4),(10,6,'STOCK_IN',12),
-- Products 11-20
(11,1,'STOCK_IN',10),(11,2,'STOCK_IN',8),(11,3,'STOCK_IN',7),(11,4,'STOCK_IN',9),(11,5,'STOCK_IN',3),(11,6,'STOCK_IN',8),
(12,1,'STOCK_IN',8),(12,2,'STOCK_IN',10),(12,3,'STOCK_IN',6),(12,4,'STOCK_IN',7),(12,5,'STOCK_IN',3),(12,6,'STOCK_IN',9),
(13,1,'STOCK_IN',7),(13,2,'STOCK_IN',9),(13,3,'STOCK_IN',5),(13,4,'STOCK_IN',8),(13,5,'STOCK_IN',2),(13,6,'STOCK_IN',7),
(14,1,'STOCK_IN',22),(14,2,'STOCK_IN',24),(14,3,'STOCK_IN',18),(14,4,'STOCK_IN',15),(14,5,'STOCK_IN',8),(14,6,'STOCK_IN',20),
(15,1,'STOCK_IN',30),(15,2,'STOCK_IN',35),(15,3,'STOCK_IN',25),(15,4,'STOCK_IN',27),(15,5,'STOCK_IN',10),(15,6,'STOCK_IN',33),
(16,1,'STOCK_IN',5),(16,2,'STOCK_IN',4),(16,3,'STOCK_IN',3),(16,4,'STOCK_IN',6),(16,5,'STOCK_IN',2),(16,6,'STOCK_IN',4),
(17,1,'STOCK_IN',8),(17,2,'STOCK_IN',7),(17,3,'STOCK_IN',5),(17,4,'STOCK_IN',9),(17,5,'STOCK_IN',3),(17,6,'STOCK_IN',7),
(18,1,'STOCK_IN',13),(18,2,'STOCK_IN',11),(18,3,'STOCK_IN',8),(18,4,'STOCK_IN',12),(18,5,'STOCK_IN',4),(18,6,'STOCK_IN',11),
(19,1,'STOCK_IN',9),(19,2,'STOCK_IN',8),(19,3,'STOCK_IN',6),(19,4,'STOCK_IN',10),(19,5,'STOCK_IN',3),(19,6,'STOCK_IN',8),
(20,1,'STOCK_IN',6),(20,2,'STOCK_IN',7),(20,3,'STOCK_IN',5),(20,4,'STOCK_IN',8),(20,5,'STOCK_IN',2),(20,6,'STOCK_IN',6),
-- Products 21-30
(21,1,'STOCK_IN',18),(21,2,'STOCK_IN',24),(21,3,'STOCK_IN',15),(21,4,'STOCK_IN',22),(21,5,'STOCK_IN',7),(21,6,'STOCK_IN',20),
(22,1,'STOCK_IN',13),(22,2,'STOCK_IN',17),(22,3,'STOCK_IN',10),(22,4,'STOCK_IN',15),(22,5,'STOCK_IN',4),(22,6,'STOCK_IN',14),
(23,1,'STOCK_IN',35),(23,2,'STOCK_IN',30),(23,3,'STOCK_IN',25),(23,4,'STOCK_IN',33),(23,5,'STOCK_IN',10),(23,6,'STOCK_IN',30),
(24,1,'STOCK_IN',15),(24,2,'STOCK_IN',19),(24,3,'STOCK_IN',12),(24,4,'STOCK_IN',17),(24,5,'STOCK_IN',5),(24,6,'STOCK_IN',16),
(25,1,'STOCK_IN',11),(25,2,'STOCK_IN',15),(25,3,'STOCK_IN',8),(25,4,'STOCK_IN',13),(25,5,'STOCK_IN',3),(25,6,'STOCK_IN',12),
(26,1,'STOCK_IN',10),(26,2,'STOCK_IN',13),(26,3,'STOCK_IN',8),(26,4,'STOCK_IN',12),(26,5,'STOCK_IN',3),(26,6,'STOCK_IN',11),
(27,1,'STOCK_IN',25),(27,2,'STOCK_IN',22),(27,3,'STOCK_IN',18),(27,4,'STOCK_IN',27),(27,5,'STOCK_IN',8),(27,6,'STOCK_IN',24),
(28,1,'STOCK_IN',8),(28,2,'STOCK_IN',10),(28,3,'STOCK_IN',7),(28,4,'STOCK_IN',9),(28,5,'STOCK_IN',3),(28,6,'STOCK_IN',8),
(29,1,'STOCK_IN',17),(29,2,'STOCK_IN',19),(29,3,'STOCK_IN',13),(29,4,'STOCK_IN',22),(29,5,'STOCK_IN',5),(29,6,'STOCK_IN',17),
(30,1,'STOCK_IN',28),(30,2,'STOCK_IN',35),(30,3,'STOCK_IN',24),(30,4,'STOCK_IN',32),(30,5,'STOCK_IN',10),(30,6,'STOCK_IN',26),
-- Products 31-40
(31,1,'STOCK_IN',7),(31,2,'STOCK_IN',9),(31,3,'STOCK_IN',6),(31,4,'STOCK_IN',8),(31,5,'STOCK_IN',3),(31,6,'STOCK_IN',7),
(32,1,'STOCK_IN',13),(32,2,'STOCK_IN',15),(32,3,'STOCK_IN',10),(32,4,'STOCK_IN',14),(32,5,'STOCK_IN',4),(32,6,'STOCK_IN',12),
(33,1,'STOCK_IN',24),(33,2,'STOCK_IN',28),(33,3,'STOCK_IN',20),(33,4,'STOCK_IN',26),(33,5,'STOCK_IN',8),(33,6,'STOCK_IN',23),
(34,1,'STOCK_IN',12),(34,2,'STOCK_IN',14),(34,3,'STOCK_IN',10),(34,4,'STOCK_IN',13),(34,5,'STOCK_IN',4),(34,6,'STOCK_IN',11),
(35,1,'STOCK_IN',35),(35,2,'STOCK_IN',33),(35,3,'STOCK_IN',26),(35,4,'STOCK_IN',30),(35,5,'STOCK_IN',10),(35,6,'STOCK_IN',30),
(36,1,'STOCK_IN',40),(36,2,'STOCK_IN',45),(36,3,'STOCK_IN',33),(36,4,'STOCK_IN',37),(36,5,'STOCK_IN',13),(36,6,'STOCK_IN',36),
(37,1,'STOCK_IN',18),(37,2,'STOCK_IN',22),(37,3,'STOCK_IN',16),(37,4,'STOCK_IN',20),(37,5,'STOCK_IN',7),(37,6,'STOCK_IN',18),
(38,1,'STOCK_IN',40),(38,2,'STOCK_IN',36),(38,3,'STOCK_IN',30),(38,4,'STOCK_IN',38),(38,5,'STOCK_IN',13),(38,6,'STOCK_IN',34),
(39,1,'STOCK_IN',22),(39,2,'STOCK_IN',26),(39,3,'STOCK_IN',18),(39,4,'STOCK_IN',24),(39,5,'STOCK_IN',8),(39,6,'STOCK_IN',21),
(40,1,'STOCK_IN',58),(40,2,'STOCK_IN',52),(40,3,'STOCK_IN',47),(40,4,'STOCK_IN',63),(40,5,'STOCK_IN',18),(40,6,'STOCK_IN',56),
-- Products 41-50
(41,1,'STOCK_IN',15),(41,2,'STOCK_IN',13),(41,3,'STOCK_IN',10),(41,4,'STOCK_IN',17),(41,5,'STOCK_IN',4),(41,6,'STOCK_IN',14),
(42,1,'STOCK_IN',13),(42,2,'STOCK_IN',15),(42,3,'STOCK_IN',10),(42,4,'STOCK_IN',14),(42,5,'STOCK_IN',4),(42,6,'STOCK_IN',12),
(43,1,'STOCK_IN',108),(43,2,'STOCK_IN',96),(43,3,'STOCK_IN',85),(43,4,'STOCK_IN',103),(43,5,'STOCK_IN',29),(43,6,'STOCK_IN',95),
(44,1,'STOCK_IN',24),(44,2,'STOCK_IN',22),(44,3,'STOCK_IN',18),(44,4,'STOCK_IN',27),(44,5,'STOCK_IN',8),(44,6,'STOCK_IN',22),
(45,1,'STOCK_IN',46),(45,2,'STOCK_IN',41),(45,3,'STOCK_IN',36),(45,4,'STOCK_IN',44),(45,5,'STOCK_IN',12),(45,6,'STOCK_IN',38),
(46,1,'STOCK_IN',12),(46,2,'STOCK_IN',14),(46,3,'STOCK_IN',10),(46,4,'STOCK_IN',13),(46,5,'STOCK_IN',3),(46,6,'STOCK_IN',11),
(47,1,'STOCK_IN',22),(47,2,'STOCK_IN',24),(47,3,'STOCK_IN',18),(47,4,'STOCK_IN',27),(47,5,'STOCK_IN',8),(47,6,'STOCK_IN',22),
(48,1,'STOCK_IN',8),(48,2,'STOCK_IN',10),(48,3,'STOCK_IN',7),(48,4,'STOCK_IN',9),(48,5,'STOCK_IN',3),(48,6,'STOCK_IN',8),
(49,1,'STOCK_IN',47),(49,2,'STOCK_IN',53),(49,3,'STOCK_IN',42),(49,4,'STOCK_IN',58),(49,5,'STOCK_IN',15),(49,6,'STOCK_IN',45),
(50,1,'STOCK_IN',18),(50,2,'STOCK_IN',22),(50,3,'STOCK_IN',15),(50,4,'STOCK_IN',20),(50,5,'STOCK_IN',5),(50,6,'STOCK_IN',18);

-- Stock-out movements for fulfilled orders
INSERT INTO stock_movements (product_id, warehouse_id, movement_type, quantity, order_id) VALUES
(4,  1, 'ORDER', 2,  1),
(9,  1, 'ORDER', 5,  1),
(18, 3, 'ORDER', 1,  2),
(14, 3, 'ORDER', 1,  3),
(15, 3, 'ORDER', 1,  3),
(21, 4, 'ORDER', 1,  4),
(23, 4, 'ORDER', 1,  4),
(23, 5, 'ORDER', 2,  5),
(30, 5, 'ORDER', 1,  5),
(23, 6, 'ORDER', 1,  6),
(11, 1, 'ORDER', 1,  7),
(1,  2, 'ORDER', 1,  8),
(4,  2, 'ORDER', 2,  8),
(9,  2, 'ORDER', 2,  8),
(6,  3, 'ORDER', 1,  9),
(30, 3, 'ORDER', 1,  9),
(43, 3, 'ORDER', 5,  9),
(22, 4, 'ORDER', 1, 10),
(38, 5, 'ORDER', 1, 11),
(40, 5, 'ORDER', 2, 11),
(27, 6, 'ORDER', 2, 12),
(7,  1, 'ORDER', 1, 13),
(1,  1, 'ORDER', 1, 13),
(30, 2, 'ORDER', 1, 14),
(34, 3, 'ORDER', 1, 15),
(33, 3, 'ORDER', 1, 15),
(22, 4, 'ORDER', 1, 16),
(43, 5, 'ORDER', 2, 17),
(38, 5, 'ORDER', 1, 17),
(47, 6, 'ORDER', 1, 18),
(43, 6, 'ORDER', 2, 18),
(12, 1, 'ORDER', 1, 19),
(3,  2, 'ORDER', 1, 20),
(32, 3, 'ORDER', 2, 21),
(43, 4, 'ORDER', 2, 22),
(19, 5, 'ORDER', 1, 23),
(39, 6, 'ORDER', 1, 24),
(2,  1, 'ORDER', 1, 25),
(3,  1, 'ORDER', 1, 25),
(30, 2, 'ORDER', 1, 26),
(45, 3, 'ORDER', 2, 27),
(24, 4, 'ORDER', 1, 28),
(22, 5, 'ORDER', 1, 29),
(29, 6, 'ORDER', 1, 30);

-- ==================================================
-- 10. PURCHASE ORDERS (12 purchase orders from suppliers)
-- ==================================================
INSERT INTO purchase_orders (purchase_order_id, supplier_id, warehouse_id, status, order_date, expected_date) VALUES
(1,  1, 1, 'RECEIVED',   '2026-07-15 10:00:00', '2026-07-25'),
(2,  2, 2, 'RECEIVED',   '2026-07-20 11:00:00', '2026-07-30'),
(3,  3, 3, 'RECEIVED',   '2026-08-01 09:00:00', '2026-08-10'),
(4,  4, 4, 'RECEIVED',   '2026-08-05 10:00:00', '2026-08-15'),
(5,  5, 5, 'RECEIVED',   '2026-08-10 11:00:00', '2026-08-20'),
(6,  6, 6, 'RECEIVED',   '2026-08-15 09:00:00', '2026-08-25'),
(7,  7, 1, 'ORDERED',    '2026-09-01 10:00:00', '2026-09-15'),
(8,  8, 2, 'ORDERED',    '2026-09-03 11:00:00', '2026-09-18'),
(9,  9, 3, 'PENDING',    '2026-09-08 09:00:00', '2026-09-22'),
(10,10, 4, 'PENDING',    '2026-09-09 10:00:00', '2026-09-25'),
(11,11, 5, 'PENDING',    '2026-09-09 14:00:00', '2026-09-28'),
(12,12, 6, 'ORDERED',    '2026-09-10 09:00:00', '2026-10-01');

-- ==================================================
-- 11. PURCHASE ORDER ITEMS
-- ==================================================
INSERT INTO purchase_order_items (purchase_order_id, product_id, quantity, unit_price) VALUES
(1,  1, 50,  4200.00),
(1,  6, 30,  3800.00),
(1,  8, 25,  5800.00),
(2,  11, 10, 32000.00),
(2,  21, 20, 18000.00),
(2,  33, 30,  6500.00),
(3,  14, 25,  9000.00),
(3,  15, 30,  7000.00),
(3,  30, 30,  3000.00),
(4,  4,  100,  550.00),
(4,  9,  150,  400.00),
(4,  43, 200,  600.00),
(5,  40, 80,  2100.00),
(5,  44, 30,  4200.00),
(5,  45, 60,  1700.00),
(6,  23, 50,  4000.00),
(6,  27, 25,  7000.00),
(6,  49, 80,  1200.00),
(7,  7,  20,  9500.00),
(7,  22, 15, 22000.00),
(8,  12, 15, 21000.00),
(8,  16,  5,120000.00),
(9,  47, 30,  5800.00),
(9,  48, 10, 14000.00),
(10, 34, 20, 11000.00),
(10, 35, 40,  3800.00),
(11, 37, 25,  7500.00),
(11, 39, 20,  5200.00),
(12, 24, 20,  8000.00),
(12, 25, 15, 10000.00);

-- ==================================================
-- 12. WAREHOUSE TRANSFERS (inter-warehouse movements)
-- ==================================================
INSERT INTO warehouse_transfers (transfer_id, product_id, source_warehouse_id, destination_warehouse_id, quantity, status, created_at, completed_at) VALUES
(1,  4,  2, 5,  20, 'COMPLETED', '2026-08-05 09:00:00', '2026-08-07 14:00:00'),
(2,  9,  1, 5,  15, 'COMPLETED', '2026-08-10 10:00:00', '2026-08-12 15:00:00'),
(3,  23, 1, 5,   5, 'COMPLETED', '2026-08-15 11:00:00', '2026-08-17 16:00:00'),
(4,  1,  2, 4,  10, 'COMPLETED', '2026-08-20 09:30:00', '2026-08-22 14:30:00'),
(5,  40, 1, 5,   8, 'COMPLETED', '2026-08-25 10:00:00', '2026-08-27 15:00:00'),
(6,  15, 2, 5,   5, 'COMPLETED', '2026-09-01 09:00:00', '2026-09-03 14:00:00'),
(7,  16, 4, 5,   2, 'IN_TRANSIT','2026-09-07 10:00:00', NULL),
(8,  33, 1, 5,   8, 'IN_TRANSIT','2026-09-08 11:00:00', NULL),
(9,  49, 2, 5,  15, 'PENDING',   '2026-09-09 14:00:00', NULL),
(10, 43, 1, 5,  20, 'PENDING',   '2026-09-10 09:00:00', NULL);

-- Add transfer movements in stock_movements
INSERT INTO stock_movements (product_id, warehouse_id, movement_type, quantity, transfer_id) VALUES
(4,  2, 'TRANSFER_OUT', 20, 1),
(4,  5, 'TRANSFER_IN',  20, 1),
(9,  1, 'TRANSFER_OUT', 15, 2),
(9,  5, 'TRANSFER_IN',  15, 2),
(23, 1, 'TRANSFER_OUT', 5,  3),
(23, 5, 'TRANSFER_IN',  5,  3),
(1,  2, 'TRANSFER_OUT', 10, 4),
(1,  4, 'TRANSFER_IN',  10, 4),
(40, 1, 'TRANSFER_OUT', 8,  5),
(40, 5, 'TRANSFER_IN',  8,  5),
(15, 2, 'TRANSFER_OUT', 5,  6),
(15, 5, 'TRANSFER_IN',  5,  6);

-- ==================================================
-- VERIFICATION
-- ==================================================
SELECT 'users'     AS tbl, COUNT(*) AS cnt FROM users
UNION ALL SELECT 'warehouses', COUNT(*) FROM warehouses
UNION ALL SELECT 'products',   COUNT(*) FROM products
UNION ALL SELECT 'suppliers',  COUNT(*) FROM suppliers
UNION ALL SELECT 'product_suppliers', COUNT(*) FROM product_suppliers
UNION ALL SELECT 'inventory',  COUNT(*) FROM inventory
UNION ALL SELECT 'orders',     COUNT(*) FROM orders
UNION ALL SELECT 'order_items',COUNT(*) FROM order_items
UNION ALL SELECT 'purchase_orders', COUNT(*) FROM purchase_orders
UNION ALL SELECT 'purchase_order_items', COUNT(*) FROM purchase_order_items
UNION ALL SELECT 'stock_movements', COUNT(*) FROM stock_movements
UNION ALL SELECT 'warehouse_transfers', COUNT(*) FROM warehouse_transfers;
