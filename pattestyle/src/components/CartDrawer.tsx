import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ShoppingBag, Trash2, ArrowRight, Truck, ShieldCheck, Sparkles } from 'lucide-react';
import { useCart } from '../contexts/CartContext';

const CartDrawer: React.FC = () => {
  const { cart, isOpen, setIsOpen, removeFromCart, updateQuantity, subtotal, freeShippingThreshold } = useCart();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const missingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const progressPercent = Math.min(100, (subtotal / freeShippingThreshold) * 100);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-stone-900/50 backdrop-blur-xs transition-opacity"
        onClick={() => setIsOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          
          {/* Header */}
          <div className="p-4 sm:p-6 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-amber-700" />
              <h3 className="font-serif text-lg font-bold text-stone-900">Votre Panier PatteStyle</h3>
              <span className="bg-amber-100 text-amber-900 text-xs font-bold px-2 py-0.5 rounded-full">
                {cart.reduce((sum, item) => sum + item.quantity, 0)}
              </span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 text-stone-400 hover:text-stone-700 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free shipping progress bar */}
          <div className="bg-amber-50 p-4 border-b border-amber-100">
            {missingForFreeShipping > 0 ? (
              <div className="space-y-2">
                <p className="text-xs font-medium text-amber-900 text-center">
                  Ajoutez encore <strong className="text-amber-800">{missingForFreeShipping.toFixed(2)} €</strong> pour la 🚚 <strong>LIVRAISON GRATUITE en Europe</strong> !
                </p>
                <div className="w-full h-2 bg-amber-200/70 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-600 transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2 text-xs font-bold text-emerald-800 bg-emerald-50 py-1.5 px-3 rounded-lg border border-emerald-200">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                Félicitations ! Vous bénéficiez de la LIVRAISON GRATUITE !
              </div>
            )}
          </div>

          {/* Items list */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {cart.length === 0 ? (
              <div className="py-16 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-700 mx-auto flex items-center justify-center">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h4 className="font-medium text-stone-800">Votre panier est encore vide</h4>
                <p className="text-xs text-stone-400 max-w-xs mx-auto">
                  Découvrez nos accessoires phares pour gâter votre compagnon dès aujourd'hui !
                </p>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    navigate('/catalog');
                  }}
                  className="bg-amber-700 text-white text-xs font-bold px-6 py-3 rounded-xl hover:bg-amber-800 transition"
                >
                  Explorer le Catalogue
                </button>
              </div>
            ) : (
              cart.map((item, index) => (
                <div key={item.id} className="flex gap-4 p-3 bg-stone-50/80 rounded-xl border border-stone-200/60">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-16 h-16 object-cover rounded-lg bg-white shrink-0 border border-stone-200"
                  />
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <h5 className="font-medium text-stone-900 text-xs sm:text-sm truncate pr-2">
                          {item.title}
                        </h5>
                        <button
                          onClick={() => removeFromCart(index)}
                          className="text-stone-400 hover:text-red-600 p-0.5"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      
                      {(item.selectedColor || item.selectedSize) && (
                        <p className="text-[11px] text-stone-500 mt-0.5">
                          {item.selectedColor && <span>Couleur: {item.selectedColor}</span>}
                          {item.selectedColor && item.selectedSize && <span> • </span>}
                          {item.selectedSize && <span>Taille: {item.selectedSize}</span>}
                        </p>
                      )}
                    </div>

                    <div className="flex justify-between items-center mt-2">
                      <div className="flex items-center border border-stone-300 rounded-lg bg-white">
                        <button
                          onClick={() => updateQuantity(index, item.quantity - 1)}
                          className="px-2 py-0.5 text-xs text-stone-600 hover:bg-stone-100 rounded-l-lg"
                        >
                          -
                        </button>
                        <span className="px-2 py-0.5 text-xs font-semibold text-stone-800">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(index, item.quantity + 1)}
                          className="px-2 py-0.5 text-xs text-stone-600 hover:bg-stone-100 rounded-r-lg"
                        >
                          +
                        </button>
                      </div>

                      <span className="font-bold text-amber-800 text-sm">
                        {(item.price * item.quantity).toFixed(2)} €
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Checkout CTA */}
          {cart.length > 0 && (
            <div className="p-4 sm:p-6 border-t border-stone-200 bg-stone-50 space-y-4">
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between text-stone-600">
                  <span>Sous-total HT</span>
                  <span>{(subtotal * 0.8).toFixed(2)} €</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>TVA (20%)</span>
                  <span>{(subtotal * 0.2).toFixed(2)} €</span>
                </div>
                <div className="flex justify-between font-bold text-stone-900 text-base pt-2 border-t border-stone-200">
                  <span>Total TTC</span>
                  <span className="text-amber-800">
                    {subtotal.toFixed(2)} €
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  setIsOpen(false);
                  navigate('/checkout');
                }}
                className="w-full bg-amber-700 hover:bg-amber-800 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-amber-700/20 flex items-center justify-center gap-2 transition"
              >
                <span>Commander Maintenance ({subtotal.toFixed(2)} €)</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center gap-4 text-[10px] text-stone-500 pt-1">
                <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Paiement 100% Sécurisé</span>
                <span className="flex items-center gap-1"><Truck className="w-3.5 h-3.5 text-amber-600" /> Suivi Colis Inclus</span>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default CartDrawer;
