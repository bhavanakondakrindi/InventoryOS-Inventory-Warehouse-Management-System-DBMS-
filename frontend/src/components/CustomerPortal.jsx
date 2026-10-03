import React, { useState, useEffect } from 'react';
import { getProducts, getCustomerOrders } from '../services/api';
import { Search, ShoppingCart, CheckCircle, Package, Monitor, HardDrive, Headphones, Keyboard, MousePointer } from 'lucide-react';

export default function CustomerPortal({ addToCart, cartItems, onOpenCart }) {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('PRODUCTS');
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    fetchProducts();
    fetchOrders();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await getProducts();
      if (res.data.success) {
        setProducts(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await getCustomerOrders(1); // Default customer Rahul Sharma
      if (res.data.success) {
        setOrders(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load customer orders:', err);
    }
  };

  const categories = ['ALL', ...new Set(products.map(p => p.category))];

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                          p.category.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'ALL' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddToCart = (product) => {
    if (product.available_stock <= 0) return;
    addToCart(product);
    setNotification(`Added "${product.name}" to cart.`);
    setTimeout(() => setNotification(null), 3000);
  };

  const getProductImage = (product) => {
    const name = product.name.toLowerCase();
    if (name.includes('mouse')) return '/images/mouse.jpg';
    if (name.includes('keyboard')) return '/images/keyboard.jpg';
    if (name.includes('monitor') || name.includes('webcam')) return '/images/monitor.jpg';
    return null;
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Monitors': return <Monitor size={36} />;
      case 'Headphones': return <Headphones size={36} />;
      case 'Accessories': return <HardDrive size={36} />;
      case 'Laptops': return <Package size={36} />;
      default: return <Package size={36} />;
    }
  };

  return (
    <div className="customer-layout">
      {/* Hero Banner */}
      <div className="customer-hero">
        <div className="customer-hero-content">
          <div>
            <h1 className="hero-title">Official Hardware Storefront</h1>
            <p className="hero-subtitle">
              Browse products with real-time stock levels synchronized live across regional warehouses.
            </p>
          </div>
          <div className="hero-badge">
            <CheckCircle size={14} />
            <span>Centralized MySQL Backend Online</span>
          </div>
        </div>
      </div>

      <div className="customer-container">
        {/* Navigation / Tabs */}
        <div className="store-toolbar">
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              className={`pill-btn ${activeTab === 'PRODUCTS' ? 'active' : ''}`}
              onClick={() => setActiveTab('PRODUCTS')}
            >
              All Products ({products.length})
            </button>
            <button
              className={`pill-btn ${activeTab === 'ORDERS' ? 'active' : ''}`}
              onClick={() => { setActiveTab('ORDERS'); fetchOrders(); }}
            >
              Order History ({orders.length})
            </button>
          </div>

          {activeTab === 'PRODUCTS' && (
            <div className="search-box">
              <Search size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search catalog by name or category..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="search-input"
              />
            </div>
          )}
        </div>

        {notification && (
          <div className="alert alert-success">
            <CheckCircle size={18} />
            <span>{notification}</span>
          </div>
        )}

        {activeTab === 'PRODUCTS' && (
          <>
            <div className="category-pills" style={{ marginBottom: '1.5rem' }}>
              {categories.map(cat => (
                <button
                  key={cat}
                  className={`pill-btn ${selectedCategory === cat ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
                Syncing product catalogue from MySQL database...
              </div>
            ) : filteredProducts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
                No products found matching your filter.
              </div>
            ) : (
              <div className="store-products-grid">
                {filteredProducts.map(product => {
                  const available = Number(product.available_stock);
                  const isLow = available > 0 && available <= product.reorder_level;
                  const isOutOfStock = available <= 0;
                  const imageSrc = getProductImage(product);

                  return (
                    <div key={product.product_id} className="store-card">
                      <div className="card-img-wrapper">
                        {imageSrc ? (
                          <img src={imageSrc} alt={product.name} className="card-img" />
                        ) : (
                          <div className="card-img-placeholder">
                            {getCategoryIcon(product.category)}
                            <span>{product.category}</span>
                          </div>
                        )}
                      </div>

                      <div className="card-body">
                        <div>
                          <div className="card-category">{product.category}</div>
                          <h3 className="card-title">{product.name}</h3>
                          <div className="card-barcode">BARCODE: {product.barcode}</div>
                        </div>

                        <div>
                          <div className="card-price-row">
                            <div className="card-price">₹{Number(product.price).toLocaleString('en-IN')}</div>
                            {isOutOfStock ? (
                              <span className="status-pill status-pill-red">Out of Stock</span>
                            ) : isLow ? (
                              <span className="status-pill status-pill-yellow">Low: {available} left</span>
                            ) : (
                              <span className="status-pill status-pill-green">Stock: {available}</span>
                            )}
                          </div>

                          <button
                            className="btn btn-primary"
                            style={{ width: '100%', justifyContent: 'center' }}
                            disabled={isOutOfStock}
                            onClick={() => handleAddToCart(product)}
                          >
                            <ShoppingCart size={16} />
                            {isOutOfStock ? 'Sold Out' : 'Add to Cart'}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {activeTab === 'ORDERS' && (
          <div className="erp-card">
            <div className="erp-card-header">
              <h3 className="erp-card-title">Customer Order History (Rahul Sharma)</h3>
            </div>
            <table className="erp-table">
              <thead>
                <tr>
                  <th>Order Reference</th>
                  <th>Placed Date & Time</th>
                  <th>Fulfilling Warehouse</th>
                  <th>Status</th>
                  <th>Total Amount</th>
                  <th>Items Included</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                      No orders placed yet. Place an order from the product catalogue above!
                    </td>
                  </tr>
                ) : (
                  orders.map(order => (
                    <tr key={order.order_id}>
                      <td><code style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--text-main)' }}>#ORD-{order.order_id}</code></td>
                      <td>{new Date(order.created_at).toLocaleString()}</td>
                      <td><strong style={{ color: 'var(--text-main)' }}>{order.warehouse_name}</strong></td>
                      <td><span className="status-pill status-pill-green">{order.status}</span></td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--accent-primary)' }}>
                        ₹{Number(order.total_amount).toLocaleString('en-IN')}
                      </td>
                      <td>
                        {order.items && order.items.map(item => (
                          <div key={item.product_id} style={{ fontSize: '0.825rem' }}>
                            • {item.product_name} × {item.quantity} (₹{item.unit_price})
                          </div>
                        ))}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
