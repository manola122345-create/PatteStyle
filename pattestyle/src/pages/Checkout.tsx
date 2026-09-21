import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Lock, 
  CreditCard, 
  Truck, 
  CheckCircle2, 
  ShieldCheck, 
  ArrowLeft,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { trackEvent } from '../lib/tracking';

const EuropeanCountries = [
  { code: 'FR', name: 'France', flag: '🇫🇷', fee: 0.00 },
  { code: 'BE', name: 'Belgique', flag: '🇧🇪', fee: 4.90 },
  { code: 'CH', name: 'Suisse', flag: '🇨🇭', fee: 6.90 },
  { code: 'LU', name: 'Luxembourg', flag: '🇱🇺', fee: 4.90 },
  { code: 'ES', name: 'Espagne', flag: '🇪🇸', fee: 5.90 },
  { code: 'DE', name: 'Allemagne', flag: '🇩🇪', fee: 5.90 },
  { code: 'IT', name: 'Italie', flag: '🇮🇹', fee: 5.90 },
  { code: 'NL', name: 'Pays-Bas', flag: '🇳🇱', fee: 5.90 },
  { code: 'PT', name: 'Portugal', flag: '🇵🇹', fee: 6.90 },
  { code: 'EU', name: 'Reste de l\'Europe', flag: '🇪🇺', fee: 8.90 },
];

const Checkout: React.FC = () => {
  const { cart, subtotal, clearCart, freeShippingThreshold } = useCart();
  const navigate = useNavigate();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [zip, setZip] = useState('');
  const [country, setCountry] = useState('France');

  const [paymentMethod, setPaymentMethod] = useState('Stripe CB');
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExp, setCardExp] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('123');

  useEffect(() => {
    trackEvent('InitiateCheckout', {
      item_count: cart.length,
      subtotal
    });
  }, []);

  const selectedCountryObj = EuropeanCountries.find(c => c.name === country) || EuropeanCountries[0];
  const shippingFee = subtotal >= freeShippingThreshold ? 0.00 : selectedCountryObj.fee;
  const grandTotal = subtotal + shippingFee;

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerEmail || !customerName || !street || !city) return;

    setSubmitting(true);

    const orderPayload = {
      customer_name: customerName,
      customer_email: customerEmail,
      customer_phone: customerPhone,
      shipping_address: {
        street,
        city,
        zip,
        country
      },
      shipping_zone: selectedCountryObj.name,
      shipping_fee: shippingFee,
      items: cart,
      subtotal,
      total: grandTotal,
      payment_method: paymentMethod
    };

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });

      if (res.ok) {
        const createdOrder = await res.json();
        
        trackEvent('Purchase', {
          order_number: createdOrder.order_number,
          total: grandTotal,
          currency: 'EUR'
        });

        clearCart();
        navigate(`/order-confirmation?order_number=${createdOrder.order_number}`);
      } else {
        alert('Erreur lors de la création de la commande. Veuillez réessayer.');
      }
    } catch (err) {
      console.error(err);
      alert('Erreur réseau');
    } finally {
      setSubmitting(false);
    }
  };

  if (cart.length === 0 && !submitting) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="font-serif text-2xl font-bold text-stone-800">Votre panier est vide</h2>
        <p className="text-xs text-stone-500">Ajoutez des accessoires avant de procéder à la commande.</p>
        <button
          onClick={() => navigate('/catalog')}
          className="bg-amber-700 text-white font-bold text-xs px-6 py-3 rounded-xl"
        >
          Voir le Catalogue
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Step Indicator */}
      <div className="flex items-center justify-between max-w-2xl mx-auto border-b border-stone-200 pb-4">
        <div className={`flex items-center gap-2 text-xs font-bold ${step >= 1 ? 'text-amber-800' : 'text-stone-400'}`}>
          <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-900 flex items-center justify-center font-mono">1</span>
          <span>Livraison Europe</span>
        </div>
        <div className="h-0.5 flex-1 bg-stone-200 mx-4" />
        <div className={`flex items-center gap-2 text-xs font-bold ${step >= 2 ? 'text-amber-800' : 'text-stone-400'}`}>
          <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-900 flex items-center justify-center font-mono">2</span>
          <span>Paiement Sécurisé</span>
        </div>
      </div>

      <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* Left Form Steps (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {step === 1 && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/80 shadow-xs space-y-6">
              <h2 className="font-serif text-2xl font-bold text-stone-900 flex items-center gap-2">
                <Truck className="w-5 h-5 text-amber-700" />
                Adresse de Livraison Europe
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Nom Complet *</label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="ex: Jean Dupont"
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-4 py-2.5 text-xs text-stone-900 focus:outline-hidden"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Email *</label>
                    <input
                      type="email"
                      required
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="jean.dupont@email.com"
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl px-4 py-2.5 text-xs text-stone-900 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Téléphone (pour le livreur)</label>
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="+33 6 12 34 56 78"
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl px-4 py-2.5 text-xs text-stone-900 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Pays de Livraison (Europe) *</label>
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-4 py-2.5 text-xs font-medium text-stone-900 focus:outline-hidden"
                  >
                    {EuropeanCountries.map((c) => (
                      <option key={c.code} value={c.name}>
                        {c.flag} {c.name} {subtotal >= freeShippingThreshold ? '(Livraison Gratuite)' : `(+${c.fee.toFixed(2)}€)`}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Adresse (Rue, Numéro, Bâtiment) *</label>
                  <input
                    type="text"
                    required
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    placeholder="12 Avenue des Champs-Élysées"
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-4 py-2.5 text-xs text-stone-900 focus:outline-hidden"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Code Postal *</label>
                    <input
                      type="text"
                      required
                      value={zip}
                      onChange={(e) => setZip(e.target.value)}
                      placeholder="75008"
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl px-4 py-2.5 text-xs text-stone-900 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Ville *</label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Paris"
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl px-4 py-2.5 text-xs text-stone-900 focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (customerEmail && customerName && street && city) setStep(2);
                  else alert('Veuillez remplir tous les champs obligatoires.');
                }}
                className="w-full bg-amber-700 hover:bg-amber-800 text-white font-bold py-3.5 px-6 rounded-xl transition flex items-center justify-center gap-2"
              >
                <span>Continuer vers le Paiement</span>
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/80 shadow-xs space-y-6">
              <div className="flex items-center justify-between border-b border-stone-100 pb-4">
                <h2 className="font-serif text-2xl font-bold text-stone-900 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-amber-700" />
                  Paiement Sécurisé Stripe
                </h2>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs text-stone-500 hover:text-stone-800 flex items-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Modifier l'adresse
                </button>
              </div>

              {/* Stripe Payment Preview Box */}
              <div className="space-y-4">
                <div className="bg-stone-50 border border-stone-200 p-4 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-stone-800">
                    <span>Carte Bancaire (Visa, Mastercard, Amex)</span>
                    <Lock className="w-4 h-4 text-emerald-600" />
                  </div>

                  <div>
                    <label className="block text-[11px] text-stone-500 mb-1">Numéro de carte</label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs font-mono"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] text-stone-500 mb-1">Expire le</label>
                      <input
                        type="text"
                        value={cardExp}
                        onChange={(e) => setCardExp(e.target.value)}
                        className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs font-mono text-center"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-stone-500 mb-1">CVC / CVV</label>
                      <input
                        type="text"
                        value={cardCvc}
                        onChange={(e) => setCardCvc(e.target.value)}
                        className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs font-mono text-center"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-[11px] text-stone-500 bg-amber-50 p-3 rounded-xl border border-amber-100">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Vos données sont cryptées en SSL 256 bits via l'infrastructure sécurisée Stripe.</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-amber-700 hover:bg-amber-800 text-white font-bold py-4 px-6 rounded-2xl shadow-xl shadow-amber-700/20 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {submitting ? (
                  <span>Traitement de la commande...</span>
                ) : (
                  <span>Valider & Payer ({grandTotal.toFixed(2)} €)</span>
                )}
              </button>
            </div>
          )}

        </div>

        {/* Right Summary (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-stone-50 p-6 rounded-3xl border border-stone-200/80 space-y-4 sticky top-28">
            <h3 className="font-serif text-lg font-bold text-stone-900 pb-3 border-b border-stone-200">
              Récapitulatif de Commande
            </h3>

            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-12 h-12 object-cover rounded-lg bg-white border border-stone-200 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h5 className="font-medium text-stone-900 text-xs truncate">{item.title}</h5>
                    <span className="text-[10px] text-stone-500">
                      Qté: {item.quantity} {item.selectedSize ? `• T: ${item.selectedSize}` : ''}
                    </span>
                  </div>
                  <span className="font-bold text-stone-900 text-xs shrink-0">
                    {(item.price * item.quantity).toFixed(2)} €
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-stone-200 space-y-2 text-xs">
              <div className="flex justify-between text-stone-600">
                <span>Sous-total HT</span>
                <span>{(subtotal * 0.8).toFixed(2)} €</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>TVA (20%)</span>
                <span>{(subtotal * 0.2).toFixed(2)} €</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Livraison ({selectedCountryObj.flag} {selectedCountryObj.name})</span>
                <span>{shippingFee === 0 ? <strong className="text-emerald-700">GRATUITE</strong> : `${shippingFee.toFixed(2)} €`}</span>
              </div>
              <div className="flex justify-between font-bold text-stone-900 text-base pt-2 border-t border-stone-300">
                <span>Total TTC</span>
                <span className="text-amber-800">{grandTotal.toFixed(2)} €</span>
              </div>
            </div>

            <div className="p-3 bg-white rounded-xl border border-stone-200 text-[11px] text-stone-600 space-y-1">
              <span className="font-bold text-stone-900 block">🚚 Informations d'expédition :</span>
              <p>Livré par Colissimo / Chronopost Europe sous 3 à 5 jours ouvrés.</p>
            </div>
          </div>
        </div>

      </form>
    </div>
  );
};

export default Checkout;
