import React, { useState } from 'react';
import Header from './components/Header';
import CustomerPortal from './components/CustomerPortal';
import WarehousePortal from './components/WarehousePortal';
import OrderModal from './components/OrderModal';

export default function App() {
  const [role, setRole] = useState('CUSTOMER'); // 'CUSTOMER' or 'WAREHOUSE'
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [refreshSignal, setRefreshSignal] = useState(0);

  const addToCart = (product) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.product_id === product.product_id);
      if (existing) {
        return prev.map(item =>
          item.product_id === product.product_id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId) => {
    setCartItems(prev => prev.filter(item => item.product_id !== productId));
  };

  const updateQuantity = (productId, newQty) => {
    if (newQty <= 0) {
      removeFromCart(productId);
      return;
    }
    setCartItems(prev => prev.map(item =>
      item.product_id === productId ? { ...item, quantity: newQty } : item
    ));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const triggerRefresh = () => {
    setRefreshSignal(prev => prev + 1);
  };

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="app-container">
      <Header
        role={role}
        setRole={setRole}
        cartCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
      />

      <main className="main-content">
        {role === 'CUSTOMER' ? (
          <CustomerPortal
            addToCart={addToCart}
            cartItems={cartItems}
            onOpenCart={() => setIsCartOpen(true)}
          />
        ) : (
          <WarehousePortal refreshSignal={refreshSignal} />
        )}
      </main>

      {isCartOpen && (
        <OrderModal
          cartItems={cartItems}
          removeFromCart={removeFromCart}
          updateQuantity={updateQuantity}
          clearCart={clearCart}
          onClose={() => setIsCartOpen(false)}
          onOrderPlaced={triggerRefresh}
        />
      )}
    </div>
  );
}
