import React, { useState, useEffect } from 'react';
import {
  getDashboardSummary,
  getInventory,
  getMovements,
  getLowStock,
  getWarehouses,
  getOrders,
  getSuppliers,
  getPurchaseOrders,
  stockIn,
  stockOut,
  createTransfer,
  updateOrderStatus,
  updatePOStatus
} from '../services/api';
import { 
  LayoutDashboard, 
  Boxes, 
  ArrowUpRight, 
  ArrowDownLeft, 
  AlertTriangle, 
  Building2, 
  ShoppingBag, 
  PlusCircle, 
  MinusCircle, 
  ArrowRightLeft, 
  RefreshCw,
  CheckCircle,
  Package,
  Clock,
  ShieldCheck,
  TrendingUp,
  FileText,
  Truck,
  PackageCheck,
  Send
} from 'lucide-react';


export default function WarehousePortal({ refreshSignal }) {
  const [summary, setSummary] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [movements, setMovements] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [orders, setOrders] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [activeNav, setActiveNav] = useState('DASHBOARD');
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);

  // Modals
  const [showStockInModal, setShowStockInModal] = useState(false);
  const [showStockOutModal, setShowStockOutModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);

  // Forms
  const [stockInForm, setStockInForm] = useState({ product_id: '', warehouse_id: '1', quantity: 10 });
  const [stockOutForm, setStockOutForm] = useState({ product_id: '', warehouse_id: '1', quantity: 1 });
  const [transferForm, setTransferForm] = useState({ product_id: '', source_warehouse_id: '1', destination_warehouse_id: '2', quantity: 5 });

  useEffect(() => {
    fetchAllData();
  }, [refreshSignal]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [sumRes, invRes, movRes, lowRes, warRes, ordRes, supRes, poRes] = await Promise.all([
        getDashboardSummary(),
        getInventory(),
        getMovements(),
        getLowStock(),
        getWarehouses(),
        getOrders(),
        getSuppliers(),
        getPurchaseOrders()
      ]);

      if (sumRes.data.success) setSummary(sumRes.data.data);
      if (invRes.data.success) setInventory(invRes.data.data);
      if (movRes.data.success) setMovements(movRes.data.data);
      if (lowRes.data.success) setLowStockItems(lowRes.data.data);
      if (warRes.data.success) setWarehouses(warRes.data.data);
      if (ordRes.data.success) setOrders(ordRes.data.data);
      if (supRes.data.success) setSuppliers(supRes.data.data);
      if (poRes.data.success) setPurchaseOrders(poRes.data.data);

      if (invRes.data.data.length > 0) {
        setStockInForm(f => ({ ...f, product_id: invRes.data.data[0].product_id }));
        setStockOutForm(f => ({ ...f, product_id: invRes.data.data[0].product_id }));
        setTransferForm(f => ({ ...f, product_id: invRes.data.data[0].product_id }));
      }
    } catch (err) {
      console.error('Error loading warehouse data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStockInSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await stockIn(stockInForm);
      if (res.data.success) {
        setNotification(`Stock IN operation completed: +${stockInForm.quantity} units added.`);
        setShowStockInModal(false);
        fetchAllData();
        setTimeout(() => setNotification(null), 4000);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Stock IN failed');
    }
  };

  const handleStockOutSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await stockOut(stockOutForm);
      if (res.data.success) {
        setNotification(`Stock OUT operation completed: -${stockOutForm.quantity} units deducted.`);
        setShowStockOutModal(false);
        fetchAllData();
        setTimeout(() => setNotification(null), 4000);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Stock OUT failed');
    }
  };

  const handleTransferSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await createTransfer(transferForm);
      if (res.data.success) {
        setNotification(`Inter-warehouse stock transfer of ${transferForm.quantity} units completed.`);
        setShowTransferModal(false);
        fetchAllData();
        setTimeout(() => setNotification(null), 4000);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Transfer failed');
    }
  };

  const handleSendOrder = async (orderId) => {
    try {
      const res = await updateOrderStatus(orderId, 'DELIVERED');
      if (res.data.success) {
        setNotification(`Order #${orderId} marked as DELIVERED in MySQL.`);
        // Refresh order data from backend to update state immediately
        fetchAllData();
        setTimeout(() => setNotification(null), 4000);
      }
    } catch (err) {
      console.error('Error delivering order:', err);
      alert(err.response?.data?.message || 'Failed to update order status');
    }
  };

  const handleReceivePO = async (poId) => {
    try {
      const res = await updatePOStatus(poId, 'RECEIVED');
      if (res.data.success) {
        setNotification(`Purchase Order #${poId} received — stock-in executed as a MySQL transaction.`);
        fetchAllData();
        setTimeout(() => setNotification(null), 4000);
      }
    } catch (err) {
      console.error('Error receiving purchase order:', err);
      alert(err.response?.data?.message || 'Failed to update purchase order status');
    }
  };


  return (
    <div className="warehouse-layout">
      {/* Sidebar Navigation */}
      <aside className="warehouse-sidebar">
        <div className="sidebar-header">
          <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
            <Boxes size={18} />
          </div>
          <div>
            <div className="sidebar-brand-name">WMS Enterprise</div>
            <div className="sidebar-subtext">Centralized Hub Console</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button
            className={`nav-item ${activeNav === 'DASHBOARD' ? 'active' : ''}`}
            onClick={() => setActiveNav('DASHBOARD')}
          >
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </button>

          <button
            className={`nav-item ${activeNav === 'INVENTORY' ? 'active' : ''}`}
            onClick={() => setActiveNav('INVENTORY')}
          >
            <Boxes size={18} />
            <span>Inventory Matrix</span>
            <span className="nav-count">{inventory.length}</span>
          </button>

          <button
            className={`nav-item ${activeNav === 'MOVEMENTS' ? 'active' : ''}`}
            onClick={() => setActiveNav('MOVEMENTS')}
          >
            <ArrowUpRight size={18} />
            <span>Stock Movements Log</span>
            <span className="nav-count">{movements.length}</span>
          </button>

          <button
            className={`nav-item ${activeNav === 'LOW_STOCK' ? 'active' : ''}`}
            onClick={() => setActiveNav('LOW_STOCK')}
          >
            <AlertTriangle size={18} />
            <span>Low Stock Alerts</span>
            {lowStockItems.length > 0 && (
              <span className="nav-count" style={{ background: '#ef4444' }}>{lowStockItems.length}</span>
            )}
          </button>

          <button
            className={`nav-item ${activeNav === 'WAREHOUSES' ? 'active' : ''}`}
            onClick={() => setActiveNav('WAREHOUSES')}
          >
            <Building2 size={18} />
            <span>Warehouses Hub</span>
            <span className="nav-count">{warehouses.length}</span>
          </button>

          <button
            className={`nav-item ${activeNav === 'ORDERS' ? 'active' : ''}`}
            onClick={() => setActiveNav('ORDERS')}
          >
            <ShoppingBag size={18} />
            <span>Customer Orders</span>
            <span className="nav-count">{orders.length}</span>
          </button>

          <button
            className={`nav-item ${activeNav === 'SUPPLIERS' ? 'active' : ''}`}
            onClick={() => setActiveNav('SUPPLIERS')}
          >
            <Truck size={18} />
            <span>Suppliers</span>
            <span className="nav-count">{suppliers.length}</span>
          </button>

          <button
            className={`nav-item ${activeNav === 'PURCHASE_ORDERS' ? 'active' : ''}`}
            onClick={() => setActiveNav('PURCHASE_ORDERS')}
          >
            <FileText size={18} />
            <span>Purchase Orders</span>
            <span className="nav-count">{purchaseOrders.length}</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#38bdf8' }}>
            <ShieldCheck size={14} />
            <span>MySQL Transaction Engine Active</span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="warehouse-main">
        {/* Top Header Bar */}
        <div className="warehouse-topbar">
          <div className="topbar-title">
            {activeNav === 'DASHBOARD' && 'System Overview & Analytics'}
            {activeNav === 'INVENTORY' && 'Multi-Warehouse Inventory Matrix'}
            {activeNav === 'MOVEMENTS' && 'Stock Movement Traceability Audit Log'}
            {activeNav === 'LOW_STOCK' && 'Low Stock Replenishment Alerts'}
            {activeNav === 'WAREHOUSES' && 'Regional Warehouse Facilities'}
            {activeNav === 'ORDERS' && 'Central Customer Orders Fulfillment'}
            {activeNav === 'SUPPLIERS' && 'Supplier Directory & Sourcing Network'}
            {activeNav === 'PURCHASE_ORDERS' && 'Procurement — Purchase Orders'}
          </div>

          <div className="topbar-actions">
            <button className="btn btn-secondary btn-sm" onClick={() => fetchAllData()}>
              <RefreshCw size={14} />
              <span>Refresh</span>
            </button>
            <button className="btn btn-primary btn-sm" onClick={() => setShowStockInModal(true)}>
              <PlusCircle size={14} />
              <span>Stock In</span>
            </button>
            <button className="btn btn-secondary btn-sm" onClick={() => setShowStockOutModal(true)}>
              <MinusCircle size={14} />
              <span>Stock Out</span>
            </button>
            <button className="btn btn-secondary btn-sm" onClick={() => setShowTransferModal(true)}>
              <ArrowRightLeft size={14} />
              <span>Transfer</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="warehouse-content">
          {notification && (
            <div className="alert alert-success">
              <CheckCircle size={18} />
              <span>{notification}</span>
            </div>
          )}

          {/* Dashboard KPI Cards */}
          {summary && (
            <div className="kpi-grid">
              <div className="kpi-card">
                <div className="kpi-icon-box">
                  <Package size={22} color="var(--accent-primary)" />
                </div>
                <div>
                  <div className="kpi-value">{summary.totalProducts}</div>
                  <div className="kpi-label">Active SKUs</div>
                </div>
              </div>

              <div className="kpi-card">
                <div className="kpi-icon-box">
                  <Boxes size={22} color="#0284c7" />
                </div>
                <div>
                  <div className="kpi-value">{summary.totalUnits}</div>
                  <div className="kpi-label">Total Inventory Units</div>
                </div>
              </div>

              <div className="kpi-card" style={{ borderColor: summary.lowStockProducts > 0 ? '#fecaca' : 'var(--border-color)' }}>
                <div className="kpi-icon-box" style={{ background: '#fef2f2', color: '#dc2626' }}>
                  <AlertTriangle size={22} />
                </div>
                <div>
                  <div className="kpi-value" style={{ color: summary.lowStockProducts > 0 ? '#dc2626' : 'inherit' }}>
                    {summary.lowStockProducts}
                  </div>
                  <div className="kpi-label">Reorder Level Alerts</div>
                </div>
              </div>

              <div className="kpi-card">
                <div className="kpi-icon-box">
                  <Clock size={22} color="#16a34a" />
                </div>
                <div>
                  <div className="kpi-value">{summary.pendingOrders}</div>
                  <div className="kpi-label">Customer Orders</div>
                </div>
              </div>

              <div className="kpi-card">
                <div className="kpi-icon-box">
                  <Building2 size={22} color="#475569" />
                </div>
                <div>
                  <div className="kpi-value">{summary.totalWarehouses}</div>
                  <div className="kpi-label">Operational Hubs</div>
                </div>
              </div>
            </div>
          )}

          {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
              Retrieving live MySQL database state...
            </div>
          ) : (
            <>
              {/* DASHBOARD TAB */}
              {activeNav === 'DASHBOARD' && (
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
                  <div className="erp-card">
                    <div className="erp-card-header">
                      <h3 className="erp-card-title">Recent Stock Audit Movements</h3>
                      <button className="btn btn-secondary btn-sm" onClick={() => setActiveNav('MOVEMENTS')}>View All</button>
                    </div>
                    <table className="erp-table">
                      <thead>
                        <tr>
                          <th>Timestamp</th>
                          <th>Product</th>
                          <th>Warehouse</th>
                          <th>Type</th>
                          <th>Qty</th>
                        </tr>
                      </thead>
                      <tbody>
                        {movements.slice(0, 6).map(m => (
                          <tr key={m.movement_id}>
                            <td style={{ fontSize: '0.8rem' }}>{new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                            <td><strong style={{ color: 'var(--text-main)' }}>{m.product_name}</strong></td>
                            <td>{m.warehouse_name}</td>
                            <td>
                              {m.movement_type === 'STOCK_IN' && <span className="status-pill status-pill-green">+ STOCK IN</span>}
                              {m.movement_type === 'STOCK_OUT' && <span className="status-pill status-pill-red">- STOCK OUT</span>}
                              {m.movement_type === 'ORDER' && <span className="status-pill status-pill-yellow">ORDER</span>}
                              {m.movement_type.includes('TRANSFER') && <span className="status-pill status-pill-green">TRANSFER</span>}
                            </td>
                            <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{m.quantity}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="erp-card">
                    <div className="erp-card-header">
                      <h3 className="erp-card-title">Warehouse Hub Distribution</h3>
                    </div>
                    <div style={{ padding: '1.25rem' }}>
                      {summary?.warehouseDistribution.map(w => (
                        <div key={w.warehouse_id} style={{ marginBottom: '1.25rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                            <span>{w.warehouse_name}</span>
                            <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-primary)' }}>{w.total_quantity} units</span>
                          </div>
                          <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{
                              width: `${Math.min(100, (w.total_quantity / (summary.totalUnits || 1)) * 100)}%`,
                              height: '100%',
                              background: 'var(--accent-primary)',
                              borderRadius: '4px'
                            }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* INVENTORY TAB */}
              {activeNav === 'INVENTORY' && (
                <div className="erp-card">
                  <div className="erp-card-header">
                    <h3 className="erp-card-title">Product Stock Level Matrix</h3>
                  </div>
                  <table className="erp-table">
                    <thead>
                      <tr>
                        <th>Product SKU</th>
                        <th>Category</th>
                        <th>Warehouse Location</th>
                        <th>Current Quantity</th>
                        <th>Reorder Level</th>
                        <th>Health Status</th>
                        <th>Quick Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {inventory.map(item => (
                        <tr key={item.inventory_id}>
                          <td><strong style={{ color: 'var(--text-main)' }}>{item.product_name}</strong></td>
                          <td><span style={{ fontSize: '0.8rem', background: '#f1f5f9', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>{item.category}</span></td>
                          <td>{item.warehouse_name} ({item.warehouse_location})</td>
                          <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '0.95rem', color: item.health_status === 'RED' ? '#dc2626' : 'var(--text-main)' }}>
                            {item.quantity} units
                          </td>
                          <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>{item.reorder_level}</td>
                          <td>
                            {item.health_status === 'RED' && <span className="status-pill status-pill-red">CRITICAL LOW</span>}
                            {item.health_status === 'YELLOW' && <span className="status-pill status-pill-yellow">WARNING</span>}
                            {item.health_status === 'GREEN' && <span className="status-pill status-pill-green">HEALTHY</span>}
                          </td>
                          <td>
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => {
                                setStockInForm({ product_id: item.product_id, warehouse_id: item.warehouse_id, quantity: 10 });
                                setShowStockInModal(true);
                              }}
                            >
                              + Stock In
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* MOVEMENTS TAB */}
              {activeNav === 'MOVEMENTS' && (
                <div className="erp-card">
                  <div className="erp-card-header">
                    <h3 className="erp-card-title">Full Audit Traceability Log</h3>
                  </div>
                  <table className="erp-table">
                    <thead>
                      <tr>
                        <th>Movement ID</th>
                        <th>Timestamp</th>
                        <th>Product</th>
                        <th>Warehouse</th>
                        <th>Movement Type</th>
                        <th>Quantity Change</th>
                        <th>Reference</th>
                      </tr>
                    </thead>
                    <tbody>
                      {movements.map(m => (
                        <tr key={m.movement_id}>
                          <td><code style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>#MOV-{m.movement_id}</code></td>
                          <td style={{ fontSize: '0.825rem' }}>{new Date(m.created_at).toLocaleString()}</td>
                          <td><strong style={{ color: 'var(--text-main)' }}>{m.product_name}</strong></td>
                          <td>{m.warehouse_name}</td>
                          <td>
                            {m.movement_type === 'STOCK_IN' && <span className="status-pill status-pill-green"><ArrowUpRight size={12}/> STOCK IN</span>}
                            {m.movement_type === 'STOCK_OUT' && <span className="status-pill status-pill-red"><ArrowDownLeft size={12}/> STOCK OUT</span>}
                            {m.movement_type === 'ORDER' && <span className="status-pill status-pill-yellow">ORDER</span>}
                            {m.movement_type === 'TRANSFER_IN' && <span className="status-pill status-pill-green">TRANSFER IN</span>}
                            {m.movement_type === 'TRANSFER_OUT' && <span className="status-pill status-pill-red">TRANSFER OUT</span>}
                          </td>
                          <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: m.movement_type.includes('IN') ? '#166534' : '#991b1b' }}>
                            {m.movement_type.includes('IN') ? `+${m.quantity}` : `-${m.quantity}`}
                          </td>
                          <td style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                            {m.order_id ? `Order #${m.order_id}` : m.transfer_id ? `Transfer #${m.transfer_id}` : 'Manual Adjustment'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* LOW STOCK TAB */}
              {activeNav === 'LOW_STOCK' && (
                <div className="erp-card">
                  <div className="erp-card-header">
                    <h3 className="erp-card-title">Low Stock Replenishment Alerts</h3>
                  </div>
                  <table className="erp-table">
                    <thead>
                      <tr>
                        <th>Product SKU</th>
                        <th>Barcode</th>
                        <th>Warehouse</th>
                        <th>Current Stock</th>
                        <th>Reorder Level</th>
                        <th>Replenishment Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lowStockItems.length === 0 ? (
                        <tr>
                          <td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: 'var(--status-green-text)' }}>
                            All products are currently above their reorder thresholds!
                          </td>
                        </tr>
                      ) : (
                        lowStockItems.map(item => (
                          <tr key={item.inventory_id}>
                            <td><strong style={{ color: 'var(--text-main)' }}>{item.product_name}</strong></td>
                            <td><code style={{ fontFamily: 'var(--font-mono)' }}>{item.barcode}</code></td>
                            <td>{item.warehouse_name}</td>
                            <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#dc2626' }}>{item.current_stock}</td>
                            <td style={{ fontFamily: 'var(--font-mono)' }}>{item.reorder_level}</td>
                            <td>
                              <button
                                className="btn btn-primary btn-sm"
                                onClick={() => {
                                  setStockInForm({ product_id: item.product_id, warehouse_id: item.warehouse_id, quantity: 20 });
                                  setShowStockInModal(true);
                                }}
                              >
                                Restock +20 Units
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* WAREHOUSES TAB */}
              {activeNav === 'WAREHOUSES' && (
                <div className="store-products-grid">
                  {warehouses.map(w => (
                    <div key={w.warehouse_id} className="erp-card" style={{ padding: '1.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.75rem' }}>
                        <Building2 size={24} color="var(--accent-primary)" />
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)' }}>{w.name}</h3>
                      </div>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1rem' }}>
                        📍 {w.location}
                      </p>
                      <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                        Facility Manager: <strong style={{ color: 'var(--text-main)' }}>{w.manager_name}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '0.85rem' }}>
                        <div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Unique Products</div>
                          <div style={{ fontSize: '1.15rem', fontWeight: 800 }}>{w.total_products}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Stock Units</div>
                          <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--accent-primary)', fontFamily: 'var(--font-mono)' }}>{w.total_units}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* ORDERS TAB */}
              {activeNav === 'ORDERS' && (
                <div className="erp-card">
                  <div className="erp-card-header">
                    <h3 className="erp-card-title">Central Customer Orders Fulfillment</h3>
                  </div>
                  <table className="erp-table">
                    <thead>
                      <tr>
                        <th>Order Ref</th>
                        <th>Date & Time</th>
                        <th>Customer</th>
                        <th>Fulfilling Warehouse</th>
                        <th>Total Amount</th>
                        <th>Current Status</th>
                        <th>Fulfillment Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map(o => (
                        <tr key={o.order_id}>
                          <td><code style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>#ORD-{o.order_id}</code></td>
                          <td>{new Date(o.created_at).toLocaleString()}</td>
                          <td><strong style={{ color: 'var(--text-main)' }}>{o.customer_name}</strong></td>
                          <td><span style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>{o.warehouse_name}</span></td>
                          <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>₹{Number(o.total_amount).toLocaleString('en-IN')}</td>
                          <td>
                            {o.status === 'PENDING' && <span className="status-pill status-pill-yellow">PENDING</span>}
                            {o.status === 'DELIVERED' && <span className="status-pill status-pill-green">DELIVERED</span>}
                            {o.status !== 'PENDING' && o.status !== 'DELIVERED' && <span className="status-pill status-pill-green">{o.status}</span>}
                          </td>
                          <td>
                            {o.status === 'PENDING' ? (
                              <button
                                className="btn btn-primary btn-sm"
                                onClick={() => handleSendOrder(o.order_id)}
                                style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                              >
                                <Send size={12} />
                                <span>SEND</span>
                              </button>
                            ) : (
                              <span style={{ fontSize: '0.775rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                                ✓ Order Fulfilled
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* SUPPLIERS TAB */}
              {activeNav === 'SUPPLIERS' && (
                <div className="erp-card">
                  <div className="erp-card-header">
                    <h3 className="erp-card-title">Supplier Directory & Sourcing Network</h3>
                  </div>
                  <table className="erp-table">
                    <thead>
                      <tr>
                        <th>Supplier</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Address</th>
                        <th>Catalogued Products</th>
                      </tr>
                    </thead>
                    <tbody>
                      {suppliers.length === 0 ? (
                        <tr>
                          <td colSpan="5" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                            No suppliers registered yet.
                          </td>
                        </tr>
                      ) : (
                        suppliers.map(s => (
                          <tr key={s.supplier_id}>
                            <td><strong style={{ color: 'var(--text-main)' }}>{s.name}</strong></td>
                            <td>{s.email || '—'}</td>
                            <td style={{ fontFamily: 'var(--font-mono)' }}>{s.phone || '—'}</td>
                            <td style={{ fontSize: '0.8rem' }}>{s.address || '—'}</td>
                            <td>
                              <span className="status-pill status-pill-green">
                                <Package size={12} /> {s.product_count} products
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* PURCHASE ORDERS TAB */}
              {activeNav === 'PURCHASE_ORDERS' && (
                <div className="erp-card">
                  <div className="erp-card-header">
                    <h3 className="erp-card-title">Procurement — Purchase Orders</h3>
                  </div>
                  <table className="erp-table">
                    <thead>
                      <tr>
                        <th>PO Ref</th>
                        <th>Supplier</th>
                        <th>Destination Warehouse</th>
                        <th>Expected Date</th>
                        <th>Line Items</th>
                        <th>Total Value</th>
                        <th>Status</th>
                        <th>Procurement Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {purchaseOrders.length === 0 ? (
                        <tr>
                          <td colSpan="8" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                            No purchase orders raised yet.
                          </td>
                        </tr>
                      ) : (
                        purchaseOrders.map(po => (
                          <tr key={po.purchase_order_id}>
                            <td><code style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>#PO-{po.purchase_order_id}</code></td>
                            <td><strong style={{ color: 'var(--text-main)' }}>{po.supplier_name}</strong></td>
                            <td><span style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>{po.warehouse_name}</span></td>
                            <td style={{ fontSize: '0.825rem' }}>{po.expected_date ? new Date(po.expected_date).toLocaleDateString() : '—'}</td>
                            <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{po.total_line_items}</td>
                            <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>₹{Number(po.total_value).toLocaleString('en-IN')}</td>
                            <td>
                              {po.status === 'RECEIVED' && <span className="status-pill status-pill-green">RECEIVED</span>}
                              {po.status === 'PENDING' && <span className="status-pill status-pill-yellow">PENDING</span>}
                              {po.status === 'ORDERED' && <span className="status-pill status-pill-yellow">ORDERED</span>}
                              {po.status === 'CANCELLED' && <span className="status-pill status-pill-red">CANCELLED</span>}
                            </td>
                            <td>
                              {po.status !== 'RECEIVED' && po.status !== 'CANCELLED' ? (
                                <button
                                  className="btn btn-primary btn-sm"
                                  onClick={() => handleReceivePO(po.purchase_order_id)}
                                  style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                                >
                                  <PackageCheck size={12} />
                                  <span>RECEIVE</span>
                                </button>
                              ) : (
                                <span style={{ fontSize: '0.775rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                                  {po.status === 'RECEIVED' ? '✓ Stock Received' : '— Closed'}
                                </span>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}

            </>
          )}
        </div>
      </main>

      {/* Stock IN Modal */}
      {showStockInModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Perform Stock IN</h3>
              <button style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }} onClick={() => setShowStockInModal(false)}>×</button>
            </div>
            <form onSubmit={handleStockInSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Target Product:</label>
                <select
                  className="form-select"
                  value={stockInForm.product_id}
                  onChange={(e) => setStockInForm({ ...stockInForm, product_id: e.target.value })}
                  required
                >
                  {inventory.map(i => (
                    <option key={`${i.product_id}-${i.warehouse_id}`} value={i.product_id}>
                      {i.product_name} ({i.warehouse_name} - In-Stock: {i.quantity})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Receiving Warehouse:</label>
                <select
                  className="form-select"
                  value={stockInForm.warehouse_id}
                  onChange={(e) => setStockInForm({ ...stockInForm, warehouse_id: e.target.value })}
                  required
                >
                  {warehouses.map(w => (
                    <option key={w.warehouse_id} value={w.warehouse_id}>{w.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Quantity to Stock-In:</label>
                <input
                  type="number"
                  min="1"
                  className="form-input"
                  value={stockInForm.quantity}
                  onChange={(e) => setStockInForm({ ...stockInForm, quantity: e.target.value })}
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem', justifyContent: 'center' }}>
                Execute Stock IN (MySQL Transaction)
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Stock OUT Modal */}
      {showStockOutModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Perform Stock OUT</h3>
              <button style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }} onClick={() => setShowStockOutModal(false)}>×</button>
            </div>
            <form onSubmit={handleStockOutSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Target Product:</label>
                <select
                  className="form-select"
                  value={stockOutForm.product_id}
                  onChange={(e) => setStockOutForm({ ...stockOutForm, product_id: e.target.value })}
                  required
                >
                  {inventory.map(i => (
                    <option key={`${i.product_id}-${i.warehouse_id}`} value={i.product_id}>
                      {i.product_name} ({i.warehouse_name} - In-Stock: {i.quantity})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Dispatching Warehouse:</label>
                <select
                  className="form-select"
                  value={stockOutForm.warehouse_id}
                  onChange={(e) => setStockOutForm({ ...stockOutForm, warehouse_id: e.target.value })}
                  required
                >
                  {warehouses.map(w => (
                    <option key={w.warehouse_id} value={w.warehouse_id}>{w.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Quantity to Stock-Out:</label>
                <input
                  type="number"
                  min="1"
                  className="form-input"
                  value={stockOutForm.quantity}
                  onChange={(e) => setStockOutForm({ ...stockOutForm, quantity: e.target.value })}
                  required
                />
              </div>

              <button type="submit" className="btn btn-danger" style={{ marginTop: '0.5rem', justifyContent: 'center' }}>
                Execute Stock OUT (MySQL Transaction)
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Transfer Modal */}
      {showTransferModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Inter-Warehouse Stock Transfer</h3>
              <button style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }} onClick={() => setShowTransferModal(false)}>×</button>
            </div>
            <form onSubmit={handleTransferSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Product to Transfer:</label>
                <select
                  className="form-select"
                  value={transferForm.product_id}
                  onChange={(e) => setTransferForm({ ...transferForm, product_id: e.target.value })}
                  required
                >
                  {inventory.map(i => (
                    <option key={`${i.product_id}-${i.warehouse_id}`} value={i.product_id}>
                      {i.product_name} ({i.warehouse_name} - In-Stock: {i.quantity})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Source Warehouse (From):</label>
                <select
                  className="form-select"
                  value={transferForm.source_warehouse_id}
                  onChange={(e) => setTransferForm({ ...transferForm, source_warehouse_id: e.target.value })}
                  required
                >
                  {warehouses.map(w => (
                    <option key={w.warehouse_id} value={w.warehouse_id}>{w.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Destination Warehouse (To):</label>
                <select
                  className="form-select"
                  value={transferForm.destination_warehouse_id}
                  onChange={(e) => setTransferForm({ ...transferForm, destination_warehouse_id: e.target.value })}
                  required
                >
                  {warehouses.map(w => (
                    <option key={w.warehouse_id} value={w.warehouse_id}>{w.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Quantity to Transfer:</label>
                <input
                  type="number"
                  min="1"
                  className="form-input"
                  value={transferForm.quantity}
                  onChange={(e) => setTransferForm({ ...transferForm, quantity: e.target.value })}
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem', justifyContent: 'center' }}>
                Execute Transfer (Atomic MySQL Transaction)
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
