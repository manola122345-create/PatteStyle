import React, { createContext, useContext, useState, useEffect } from 'react';
import { trackEvent } from '../lib/tracking';

export interface CartItem {
  id: number;
  product_id: number;
  title: string;
  price: number;
  compare_at_price?: number;
  image: string;
  selectedColor?: string;
  selectedSize?: string;
  quantity: number;
}

interface CartContextType {
  cart: CartItem[];
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  addToCart: (product: any, selectedColor?: string, selectedSize?: string, quantity?: number) => void;
  removeFromCart: (index: number) => void;
  updateQuantity: (index: number, newQty: number) => void;
  clearCart: () => void;
  subtotal: number;
  totalCount: number;
  freeShippingThreshold: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('pattestyle_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isOpen, setIsOpen] = useState(false);
  const freeShippingThreshold = 49.00;

  useEffect(() => {
    localStorage.setItem('pattestyle_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product: any, selectedColor?: string, selectedSize?: string, quantity: number = 1) => {
    const image = Array.isArray(product.images) && product.images.length > 0 
      ? product.images[0] 
      : product.image || '/images/dog-bed-1.jpg';

    setCart(prev => {
      const existingIndex = prev.findIndex(item => 
        item.product_id === product.id && 
        item.selectedColor === selectedColor && 
        item.selectedSize === selectedSize
      );

      if (existingIndex > -1) {
        const next = [...prev];
        next[existingIndex].quantity += quantity;
        return next;
      }

      return [...prev, {
        id: Date.now() + Math.random(),
        product_id: product.id,
        title: product.title,
        price: product.price,
        compare_at_price: product.compare_at_price,
        image,
        selectedColor,
        selectedSize,
        quantity
      }];
    });

    setIsOpen(true);
    trackEvent('AddToCart', {
      product_id: product.id,
      title: product.title,
      price: product.price,
      color: selectedColor,
      size: selectedSize,
      quantity
    });
  };

  const removeFromCart = (index: number) => {
    setCart(prev => prev.filter((_, i) => i !== index));
  };

  const updateQuantity = (index: number, newQty: number) => {
    if (newQty <= 0) {
      removeFromCart(index);
      return;
    }
    setCart(prev => {
      const next = [...prev];
      next[index].quantity = newQty;
      return next;
    });
  };

  const clearCart = () => setCart([]);

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{
      cart,
      isOpen,
      setIsOpen,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      subtotal,
      totalCount,
      freeShippingThreshold
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
