import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle2, Package, Truck, Printer, ArrowRight, PawPrint } from 'lucide-react';

const OrderConfirmation: React.FC = () => {
  const [searchParams] = useSearchParams();
  const orderNumber = searchParams.get('order_number') || 'PS-2026-8942';

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await fetch(`/api/orders?order_number=${orderNumber}`);
        const data = await res.json();
        if (data && !data.error) {
          setOrder(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderNumber]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-8">
      
      <div className="bg-white p-8 sm:p-12 rounded-3xl border border-stone-200 shadow-xl text-center space-y-6">
        
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle2 className="w-12 h-12" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold text-amber-700 uppercase tracking-widest">Confirmation de Commande</span>
          <h1 className="font-serif text-3xl font-bold text-stone-900">
            Merci pour votre confiance !
          </h1>
          <p className="text-stone-600 text-xs sm:text-sm max-w-md mx-auto">
            Votre commande n° <strong className="font-mono text-stone-900 bg-stone-100 px-2 py-0.5 rounded">{orderNumber}</strong> est bien enregistrée et en cours de préparation dans notre entrepôt européen.
          </p>
        </div>

        {/* Order Details Card */}
        {order && (
          <div className="bg-stone-50 p-6 rounded-2xl border border-stone-200/80 text-left space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-stone-200 text-xs">
              <span className="text-stone-500">Statut de la commande :</span>
              <span className="bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full">
                {order.status || 'Payée'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-stone-400 block font-medium mb-0.5">Client :</span>
                <span className="font-bold text-stone-800">{order.customer_name}</span>
                <span className="block text-stone-500">{order.customer_email}</span>
              </div>
              <div>
                <span className="text-stone-400 block font-medium mb-0.5">Numéro de suivi Europe :</span>
                <span className="font-mono font-bold text-amber-800">{order.tracking_number}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-stone-200">
              <span className="text-stone-400 text-xs block font-medium mb-2">Articles commandés :</span>
              <div className="space-y-2">
                {Array.isArray(order.items) && order.items.map((it: any, i: number) => (
                  <div key={i} className="flex justify-between items-center text-xs">
                    <span className="text-stone-800 font-medium truncate">{it.quantity}x {it.title}</span>
                    <span className="font-bold text-stone-900 font-mono">{(it.price * it.quantity).toFixed(2)} €</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-stone-200 flex justify-between font-bold text-sm text-stone-900">
              <span>Total Réglé :</span>
              <span className="text-amber-800">{order.total?.toFixed(2)} €</span>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <button
            onClick={() => window.print()}
            className="w-full sm:w-auto bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold text-xs px-6 py-3 rounded-xl flex items-center justify-center gap-2 transition"
          >
            <Printer className="w-4 h-4" /> Imprimer le justificatif
          </button>

          <Link
            to="/catalog"
            className="w-full sm:w-auto bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs px-8 py-3 rounded-xl transition flex items-center justify-center gap-2"
          >
            <span>Continuer mes achats</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </div>
  );
};

export default OrderConfirmation;
