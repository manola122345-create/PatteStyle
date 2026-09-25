import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShoppingBag, 
  Search, 
  PawPrint, 
  ShieldCheck, 
  Lock, 
  Menu, 
  X,
  ChevronDown
} from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAdmin } from '../contexts/AdminContext';
import SearchModal from './SearchModal';

const Header: React.FC = () => {
  const { totalCount, setIsOpen: setIsCartOpen } = useCart();
  const { isAdmin } = useAdmin();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md shadow-xs border-b border-amber-900/10">
      {/* Main Header Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Left: Mobile Menu Trigger & Main Links */}
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-stone-700 hover:text-amber-700 p-1"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-stone-700">
              <Link to="/catalog" className="hover:text-amber-700 transition flex items-center gap-1">
                Touts nos Accessoires
              </Link>
              <Link to="/catalog?pet=Chien" className="hover:text-amber-700 transition flex items-center gap-1">
                🐶 Chiens
              </Link>
              <Link to="/catalog?pet=Chat" className="hover:text-amber-700 transition flex items-center gap-1">
                🐱 Chats
              </Link>
            </nav>
          </div>

          {/* Center Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-2xl bg-amber-700 text-white flex items-center justify-center shadow-md shadow-amber-700/20 group-hover:scale-105 transition">
              <PawPrint className="w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-2xl font-bold tracking-tight text-stone-900 group-hover:text-amber-800 transition leading-none">
                PatteStyle
              </span>
              <span className="text-[10px] uppercase font-semibold text-amber-700 tracking-widest mt-0.5">
                Europe • Pet Boutique
              </span>
            </div>
          </Link>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-2.5 text-stone-700 hover:text-amber-700 hover:bg-amber-50 rounded-full transition"
              title="Rechercher"
            >
              <Search className="w-5 h-5" />
            </button>

            {isAdmin && (
              <Link
                to="/admin"
                className="hidden lg:flex items-center gap-1.5 bg-amber-100 text-amber-900 hover:bg-amber-200 px-3 py-1.5 rounded-lg text-xs font-semibold transition"
              >
                <Lock className="w-3.5 h-3.5" /> Back-Office
              </Link>
            )}

            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 text-stone-800 hover:text-amber-700 hover:bg-amber-50 rounded-full transition flex items-center gap-2"
              title="Panier"
            >
              <div className="relative">
                <ShoppingBag className="w-6 h-6" />
                {totalCount > 0 && (
                  <span className="absolute -top-1 -right-1.5 bg-amber-700 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-sm">
                    {totalCount}
                  </span>
                )}
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-amber-900/10 bg-amber-50/50 p-4 space-y-3">
          <Link 
            to="/catalog" 
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-stone-800 font-semibold"
          >
            Tous les Produits
          </Link>
          <Link 
            to="/catalog?pet=Chien" 
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-stone-700"
          >
            🐶 Accessoires pour Chiens
          </Link>
          <Link 
            to="/catalog?pet=Chat" 
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-stone-700"
          >
            🐱 Accessoires pour Chats
          </Link>
          <Link 
            to="/about" 
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-stone-700"
          >
            À propos de PatteStyle
          </Link>
          <Link 
            to="/shipping-returns" 
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-stone-700"
          >
            Livraison & Retours Europe
          </Link>
          <Link 
            to="/contact" 
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-stone-700"
          >
            Contact & Support
          </Link>
          {isAdmin && (
            <div className="pt-3 border-t border-stone-200">
              <Link 
                to="/admin" 
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2.5 bg-emerald-700 text-white rounded-xl font-medium text-center block text-sm"
              >
                Tableau de Bord Admin
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Search Modal */}
      {isSearchOpen && <SearchModal onClose={() => setIsSearchOpen(false)} />}
    </header>
  );
};

export default Header;
