import React, { useState } from 'react';
import { placeOrder } from '../services/api';
import { ShoppingBag, Trash2, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';

export default function OrderModal({ cartItems, removeFromCart, updateQuantity, clearCart, onClose, onOrderPlaced }) {
  const [submitting, setSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const cartTotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  const handleCheckout = async () => {
    if (cartItems.length === 0) return;

    setSubmitting(true);
    setErrorMessage(null);

    const payload = {
      customer_id: 1, // Rahul Sharma
      items: cartItems.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity
      }))
    };

    try {
      const res = await placeOrder(payload);
      if (res.data.success) {
        setOrderSuccess(res.data.data);
        clearCart();
        onOrderPlaced();
      }
    } catch (err) {
      console.error('Checkout error:', err);
      const msg = err.response?.data?.message || 'Failed to place order';
      setErrorMessage(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '580px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShoppingBag size={20} color="var(--accent-primary)" />
            <h3 className="modal-title">Shopping Cart Checkout</h3>
          </div>
          <button style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }} onClick={onClose}>×</button>
        </div>

        {orderSuccess ? (
          <div style={{ textAlign: 'center', padding: '1.25rem 0' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'var(--status-green-bg)',
              color: 'var(--status-green-text)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem auto'
            }}>
              <CheckCircle size={32} />
            </div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.35rem' }}>
              Order Placed Successfully!
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
              Transaction committed to MySQL database. Stock levels and audit movements updated in real-time.
            </p>

            <div style={{
              background: '#f8fafc',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              padding: '1.1rem',
              textAlign: 'left',
              marginBottom: '1.25rem',
              fontSize: '0.875rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Order ID:</span>
                <strong style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-main)' }}>#ORD-{orderSuccess.order_id}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Allocated Warehouse:</span>
                <strong style={{ color: 'var(--accent-primary)' }}>{orderSuccess.warehouse_name}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Total Paid:</span>
                <strong style={{ color: 'var(--status-green-text)', fontFamily: 'var(--font-mono)', fontSize: '1.05rem' }}>
                  ₹{Number(orderSuccess.total_amount).toLocaleString('en-IN')}
                </strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>SQL Transaction Status:</span>
                <span className="status-pill status-pill-green">COMMITTED</span>
              </div>
            </div>

            <button className="btn btn-primary" onClick={onClose} style={{ width: '100%', justifyContent: 'center' }}>
              Continue Shopping
            </button>
          </div>
        ) : (
          <>
            {errorMessage && (
              <div className="alert alert-error">
                <AlertCircle size={18} />
                <span>{errorMessage}</span>
              </div>
            )}

            {cartItems.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2.5rem 0', color: 'var(--text-muted)' }}>
                Your cart is currently empty. Select items from the product catalogue!
              </div>
            ) : (
              <>
                <div style={{ maxHeight: '280px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {cartItems.map(item => (
                    <div key={item.product_id} style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: '#f8fafc',
                      padding: '0.85rem 1rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-color)'
                    }}>
                      <div>
                        <strong style={{ color: 'var(--text-main)', fontSize: '0.9rem' }}>{item.name}</strong>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                          ₹{Number(item.price).toLocaleString('en-IN')} each
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: '#ffffff', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '2px 6px' }}>
                          <button
                            style={{ background: 'none', border: 'none', color: 'var(--text-main)', cursor: 'pointer', padding: '2px 6px', fontWeight: 700 }}
                            onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                          >
                            -
                          </button>
                          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.875rem' }}>{item.quantity}</span>
                          <button
                            style={{ background: 'none', border: 'none', color: 'var(--text-main)', cursor: 'pointer', padding: '2px 6px', fontWeight: 700 }}
                            onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                          >
                            +
                          </button>
                        </div>

                        <button
                          style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                          onClick={() => removeFromCart(item.product_id)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', marginTop: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.15rem', fontWeight: 800, marginBottom: '1.25rem' }}>
                    <span>Total Amount:</span>
                    <span style={{ color: 'var(--text-main)', fontFamily: 'var(--font-mono)' }}>
                      ₹{cartTotal.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <button
                    className="btn btn-primary"
                    style={{ width: '100%', justifyContent: 'center', padding: '0.85rem' }}
                    onClick={handleCheckout}
                    disabled={submitting}
                  >
                    {submitting ? 'Executing MySQL Transaction...' : (
                      <>
                        <span>Confirm & Place Order</span>
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
