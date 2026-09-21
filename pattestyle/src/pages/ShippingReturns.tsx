import React from 'react';
import { Truck, RotateCcw, ShieldCheck } from 'lucide-react';

const ShippingReturns: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="border-b border-stone-200 pb-4">
        <h1 className="font-serif text-3xl font-bold text-stone-900">
          Politique de Livraison & Retours
        </h1>
        <p className="text-stone-500 text-xs sm:text-sm mt-1">
          Conditions d'expédition en Europe et procédure de retour sous 30 jours.
        </p>
      </div>

      <div className="space-y-6 text-xs sm:text-sm text-stone-700 leading-relaxed">
        <section className="space-y-3 bg-stone-50 p-6 rounded-2xl border border-stone-200">
          <h3 className="font-bold text-stone-900 text-base flex items-center gap-2">
            <Truck className="w-5 h-5 text-amber-700" /> Zones & Tarifs de Livraison Europe
          </h3>
          <p>
            Toutes nos commandes sont préparées et expédiées sous 24h à 48h ouvrées. La livraison est <strong>GRATUITE</strong> pour toute commande supérieure à 49,00 €.
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>France métropolitaine :</strong> 4,90 € (Gratuit dès 49€) • Délais 48-72h</li>
            <li><strong>Belgique & Luxembourg :</strong> 4,90 € (Gratuit dès 49€) • Délais 3-4 jours</li>
            <li><strong>Suisse :</strong> 6,90 € • Délais 3-5 jours</li>
            <li><strong>Espagne, Allemagne, Italie, Pays-Bas :</strong> 5,90 € • Délais 3-5 jours</li>
          </ul>
        </section>

        <section className="space-y-3 bg-stone-50 p-6 rounded-2xl border border-stone-200">
          <h3 className="font-bold text-stone-900 text-base flex items-center gap-2">
            <RotateCcw className="w-5 h-5 text-amber-700" /> Retours & Remboursements (30 Jours)
          </h3>
          <p>
            Vous disposez de 30 jours à compter de la réception de votre colis pour nous retourner tout article qui ne conviendrait pas à votre compagnon.
          </p>
          <p>
            L'article doit être inutilisé, propre et dans son emballage d'origine. Dès réception dans nos entrepôts, le remboursement est effectué sous 3 à 5 jours ouvrés sur votre carte bancaire.
          </p>
        </section>
      </div>
    </div>
  );
};

export default ShippingReturns;
