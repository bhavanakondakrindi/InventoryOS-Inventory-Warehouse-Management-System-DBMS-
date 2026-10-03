import React from 'react';
import { Package, ShoppingBag, LayoutDashboard, ShoppingCart } from 'lucide-react';

export default function Header({ role, setRole, cartCount, onOpenCart }) {
  return (
    <header className="customer-header">
      <div className="customer-header-top">
        <a href="#" className="brand-logo">
          <div className="brand-icon-box">
            <Package size={20} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="brand-name">InventoryOS</span>
              <span className="brand-tag">Centralized MySQL</span>
            </div>
          </div>
        </a>

        <div className="header-actions">
          {role === 'CUSTOMER' && (
            <button className="btn-cart" onClick={onOpenCart}>
              <ShoppingCart size={18} />
              <span>Cart</span>
              {cartCount > 0 && (
                <span className="cart-count-badge">{cartCount}</span>
              )}
            </button>
          )}

          <div className="role-toggle-bar">
            <button
              className={`role-toggle-btn ${role === 'CUSTOMER' ? 'active' : ''}`}
              onClick={() => setRole('CUSTOMER')}
            >
              <ShoppingBag size={15} />
              <span>Customer Portal</span>
            </button>

            <button
              className={`role-toggle-btn ${role === 'WAREHOUSE' ? 'active' : ''}`}
              onClick={() => setRole('WAREHOUSE')}
            >
              <LayoutDashboard size={15} />
              <span>Warehouse WMS</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
