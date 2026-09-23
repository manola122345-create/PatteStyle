import React from 'react';
import { Truck, ShieldCheck } from 'lucide-react';

const ShippingReturns: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="border-b border-stone-200 pb-4">
        <h1 className="font-serif text-3xl font-bold text-stone-900">
          Politique de Livraison
        </h1>
        <p className="text-stone-500 text-xs sm:text-sm mt-1">
          Conditions d'expédition en Europe.
        </p>
      </div>

      <div className="space-y-6 text-xs sm:text-sm text-stone-700 leading-relaxed">
        <section className="space-y-3 bg-stone-50 p-6 rounded-2xl border border-stone-200">
          <h3 className="font-bold text-stone-900 text-base flex items-center gap-2">
            <Truck className="w-5 h-5 text-amber-700" /> Zones & Tarifs de Livraison Europe
          </h3>
          <p>
            Toutes nos commandes sont préparées et expédiées sous 24h à 48h ouvrées. Quel que soit le pays de livraison en Europe, le délai de livraison est de <strong>1 à 7 jours ouvrables</strong>. La livraison est <strong>GRATUITE</strong> pour toute commande supérieure à 49,00 €.
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>France métropolitaine :</strong> 4,90 € (Gratuit dès 49€)</li>
            <li><strong>Belgique & Luxembourg :</strong> 4,90 € (Gratuit dès 49€)</li>
            <li><strong>Suisse :</strong> 6,90 €</li>
            <li><strong>Espagne, Allemagne, Italie, Pays-Bas :</strong> 5,90 €</li>
          </ul>
        </section>

        <section className="space-y-3 bg-stone-50 p-6 rounded-2xl border border-stone-200">
          <h3 className="font-bold text-stone-900 text-base flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-700" /> Suivi de commande
          </h3>
          <p>
            Un numéro de suivi vous est communiqué par email dès l'expédition de votre commande, pour suivre votre colis jusqu'à la livraison.
          </p>
        </section>
      </div>
    </div>
  );
};

export default ShippingReturns;
