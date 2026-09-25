import React from 'react';
import Seo from '../components/Seo';

const Terms: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6 text-xs sm:text-sm text-stone-700">
      <Seo
        title="Conditions Générales de Vente"
        description="Conditions générales de vente PatteStyle — livraison, paiement, droit de rétractation."
        path="/terms"
      />
      <h1 className="font-serif text-3xl font-bold text-stone-900 border-b border-stone-200 pb-4">
        Conditions Générales de Vente (CGV)
      </h1>

      <p className="font-semibold text-stone-800">
        En vigueur au 21 Septembre 2026.
      </p>

      <div className="space-y-4 leading-relaxed">
        <h3 className="font-bold text-stone-900 text-base">Article 1 - Objet</h3>
        <p>
          Les présentes Conditions Générales de Vente régissent l'ensemble des ventes conclues entre le site PatteStyle et ses clients acheteurs d'accessoires pour animaux de compagnie sur le territoire Européen.
        </p>

        <h3 className="font-bold text-stone-900 text-base">Article 2 - Prix & Paiement</h3>
        <p>
          Les prix de nos produits sont indiqués en Euros TTC. Le paiement s'effectue par Carte Bancaire sécurisée Stripe.
        </p>

        <h3 className="font-bold text-stone-900 text-base">Article 3 - Droit de Rétractation</h3>
        <p>
          Conformément aux directives européennes, vous bénéficiez d'un droit de rétractation de 30 jours à compter de la livraison.
        </p>
      </div>
    </div>
  );
};

export default Terms;
