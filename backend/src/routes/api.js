const express = require('express');
const router = express.Router();

const productController       = require('../controllers/productController');
const inventoryController     = require('../controllers/inventoryController');
const orderController         = require('../controllers/orderController');
const warehouseController     = require('../controllers/warehouseController');
const movementController      = require('../controllers/movementController');
const transferController      = require('../controllers/transferController');
const dashboardController     = require('../controllers/dashboardController');
const supplierController      = require('../controllers/supplierController');
const purchaseOrderController = require('../controllers/purchaseOrderController');

// ── 1. PRODUCTS ────────────────────────────────────────────────────────────────
router.get('/products',     productController.getAllProducts);
router.get('/products/:id', productController.getProductById);
router.post('/products',    productController.createProduct);
router.patch('/products/:id', productController.updateProduct);

// ── 2. INVENTORY ───────────────────────────────────────────────────────────────
// NOTE: /inventory/low-stock MUST be declared before /inventory/:id-style routes
router.get('/inventory/low-stock', inventoryController.getLowStock);
router.get('/inventory',           inventoryController.getInventory);
router.post('/inventory/stock-in', inventoryController.stockIn);
router.post('/inventory/stock-out', inventoryController.stockOut);

// ── 3. ORDERS ─────────────────────────────────────────────────────────────────
// NOTE: /orders/customer/:customerId MUST be before /orders/:id
router.get('/orders/customer/:customerId', orderController.getCustomerOrders);
router.post('/orders',          orderController.createOrder);
router.get('/orders',           orderController.getAllOrders);
router.get('/orders/:id',       orderController.getOrderById);
router.patch('/orders/:id/status', orderController.updateOrderStatus);

// ── 4. WAREHOUSES ──────────────────────────────────────────────────────────────
router.get('/warehouses',     warehouseController.getAllWarehouses);
router.get('/warehouses/:id', warehouseController.getWarehouseById);

// ── 5. STOCK MOVEMENTS ────────────────────────────────────────────────────────
router.get('/movements',                     movementController.getAllMovements);
router.get('/movements/product/:productId',  movementController.getProductMovements);

// ── 6. TRANSFERS ──────────────────────────────────────────────────────────────
router.post('/transfers', transferController.createTransfer);
router.get('/transfers',  transferController.getAllTransfers);

// ── 7. DASHBOARD ──────────────────────────────────────────────────────────────
router.get('/dashboard', dashboardController.getSummary);
router.get('/dashboard/summary', dashboardController.getSummary);  // alias

// ── 8. SUPPLIERS ──────────────────────────────────────────────────────────────
router.get('/suppliers',     supplierController.getAllSuppliers);
router.get('/suppliers/:id', supplierController.getSupplierById);
router.post('/suppliers',    supplierController.createSupplier);

// ── 9. PURCHASE ORDERS ────────────────────────────────────────────────────────
router.get('/purchase-orders',                    purchaseOrderController.getAllPurchaseOrders);
router.post('/purchase-orders',                   purchaseOrderController.createPurchaseOrder);
router.get('/purchase-orders/:id',                purchaseOrderController.getPurchaseOrderById);
router.patch('/purchase-orders/:id/status',       purchaseOrderController.updatePurchaseOrderStatus);

module.exports = router;
