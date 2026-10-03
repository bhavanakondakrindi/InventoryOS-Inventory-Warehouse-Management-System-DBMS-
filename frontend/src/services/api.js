import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' }
});

// ── PRODUCTS ──────────────────────────────────────────────────────────────────
export const getProducts           = (params = {}) => API.get('/products', { params });
export const getProductById        = (id)           => API.get(`/products/${id}`);
export const createProduct         = (data)         => API.post('/products', data);
export const updateProduct         = (id, data)     => API.patch(`/products/${id}`, data);

// ── INVENTORY ─────────────────────────────────────────────────────────────────
export const getInventory          = (params = {}) => API.get('/inventory', { params });
export const stockIn               = (data)         => API.post('/inventory/stock-in', data);
export const stockOut              = (data)         => API.post('/inventory/stock-out', data);
export const getLowStock           = (params = {}) => API.get('/inventory/low-stock', { params });

// ── ORDERS ────────────────────────────────────────────────────────────────────
export const placeOrder            = (data)         => API.post('/orders', data);
export const getOrders             = ()             => API.get('/orders');
export const getOrderById          = (id)           => API.get(`/orders/${id}`);
export const getCustomerOrders     = (customerId)   => API.get(`/orders/customer/${customerId}`);
export const updateOrderStatus     = (id, status = 'DELIVERED') => API.patch(`/orders/${id}/status`, { status });

// ── WAREHOUSES ────────────────────────────────────────────────────────────────
export const getWarehouses         = ()             => API.get('/warehouses');
export const getWarehouseById      = (id)           => API.get(`/warehouses/${id}`);

// ── STOCK MOVEMENTS ───────────────────────────────────────────────────────────
export const getMovements          = (params = {}) => API.get('/movements', { params });
export const getProductMovements   = (productId)   => API.get(`/movements/product/${productId}`);

// ── TRANSFERS ─────────────────────────────────────────────────────────────────
export const createTransfer        = (data)         => API.post('/transfers', data);
export const getTransfers          = ()             => API.get('/transfers');

// ── SUPPLIERS ─────────────────────────────────────────────────────────────────
export const getSuppliers          = ()             => API.get('/suppliers');
export const getSupplierById       = (id)           => API.get(`/suppliers/${id}`);
export const createSupplier        = (data)         => API.post('/suppliers', data);

// ── PURCHASE ORDERS ───────────────────────────────────────────────────────────
export const getPurchaseOrders     = (params = {}) => API.get('/purchase-orders', { params });
export const getPurchaseOrderById  = (id)           => API.get(`/purchase-orders/${id}`);
export const createPurchaseOrder   = (data)         => API.post('/purchase-orders', data);
export const updatePOStatus        = (id, status)   => API.patch(`/purchase-orders/${id}/status`, { status });

// ── DASHBOARD ─────────────────────────────────────────────────────────────────
export const getDashboardSummary   = ()             => API.get('/dashboard/summary');

export default API;
