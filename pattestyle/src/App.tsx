import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './contexts/CartContext';
import { AdminProvider } from './contexts/AdminContext';

import Header from './components/Header';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import AdminPinModal from './components/AdminPinModal';
import PixelTrackerOverlay from './components/PixelTrackerOverlay';

import Home from './pages/Home';
import Catalog from './pages/Catalog';
import ProductDetail from './pages/ProductDetail';
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';
import About from './pages/About';
import ShippingReturns from './pages/ShippingReturns';
import Terms from './pages/Terms';
import Contact from './pages/Contact';
import Admin from './pages/Admin';

const App: React.FC = () => {
  return (
    <AdminProvider>
      <CartProvider>
        <Router>
          <div className="min-h-screen bg-[#FFFDF9] text-stone-800 flex flex-col font-sans selection:bg-amber-200 selection:text-amber-900">
            <Header />
            <CartDrawer />
            <AdminPinModal />
            <PixelTrackerOverlay />

            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/catalog" element={<Catalog />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/order-confirmation" element={<OrderConfirmation />} />
                <Route path="/about" element={<About />} />
                <Route path="/shipping-returns" element={<ShippingReturns />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/admin" element={<Admin />} />
              </Routes>
            </main>

            <Footer />
          </div>
        </Router>
      </CartProvider>
    </AdminProvider>
  );
};

export default App;
