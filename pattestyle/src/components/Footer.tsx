import React from 'react';
import { Link } from 'react-router-dom';
import { PawPrint, ShieldCheck, Truck, Lock, Heart } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-stone-900 text-stone-300 pt-16 pb-12 border-t border-amber-900/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Reassurance Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-12 border-b border-stone-800 text-center md:text-left">
          <div className="flex flex-col items-center md:items-start space-y-2">
            <div className="w-12 h-12 rounded-xl bg-amber-900/40 text-amber-400 flex items-center justify-center mb-2">
              <Truck className="w-6 h-6" />
            </div>
            <h4 className="font-semibold text-white">Livraison Europe</h4>
            <p className="text-xs text-stone-400 leading-relaxed">
              Livraison sous 1 à 7 jours ouvrables avec numéro de suivi, partout en Europe (France, Belgique, Suisse, etc.).
            </p>
          </div>

          <div className="flex flex-col items-center md:items-start space-y-2">
            <div className="w-12 h-12 rounded-xl bg-amber-900/40 text-amber-400 flex items-center justify-center mb-2">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h4 className="font-semibold text-white">Qualité Testée & Approuvée</h4>
            <p className="text-xs text-stone-400 leading-relaxed">
              Matériaux durables, non toxiques et ergonomiques sélectionnés pour la santé et le bien-être animal.
            </p>
          </div>

          <div className="flex flex-col items-center md:items-start space-y-2">
            <div className="w-12 h-12 rounded-xl bg-amber-900/40 text-amber-400 flex items-center justify-center mb-2">
              <Lock className="w-6 h-6" />
            </div>
            <h4 className="font-semibold text-white">Paiement 100% Sécurisé</h4>
            <p className="text-xs text-stone-400 leading-relaxed">
              Paiement par carte bancaire crypté et traité directement par Stripe.
            </p>
          </div>

          <div className="flex flex-col items-center md:items-start space-y-2">
            <div className="w-12 h-12 rounded-xl bg-amber-900/40 text-amber-400 flex items-center justify-center mb-2">
              <Heart className="w-6 h-6" />
            </div>
            <h4 className="font-semibold text-white">Support Client 7j/7</h4>
            <p className="text-xs text-stone-400 leading-relaxed">
              Une équipe de passionnés à votre écoute en français pour vous conseiller le meilleur équipement.
            </p>
          </div>
        </div>

        {/* Footer Navigation Columns */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 py-12">
          
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-amber-700 text-white flex items-center justify-center">
                <PawPrint className="w-5 h-5" />
              </div>
              <span className="font-serif text-2xl font-bold text-white tracking-tight">
                PatteStyle
              </span>
            </Link>
            <p className="text-xs text-stone-400 max-w-sm leading-relaxed">
              PatteStyle est la boutique de référence pour l'équipement et le bien-être des chiens et chats en Europe. Des accessoires élégants, ergonomiques et durables pensés pour le bonheur quotidien de nos boules de poils.
            </p>
            <div className="flex items-center gap-3 pt-2 text-stone-400">
              <span className="text-xs font-medium text-amber-300">Zones couvertes :</span>
              <span className="text-xs">🇫🇷 France • 🇧🇪 Belgique • 🇨🇭 Suisse • 🇱🇺 Luxembourg • 🇪🇸 Espagne • 🇩🇪 Allemagne</span>
            </div>
          </div>

          {/* Column 1 */}
          <div className="space-y-3">
            <h5 className="text-sm font-semibold text-white tracking-wider uppercase">Boutique</h5>
            <ul className="space-y-2 text-xs text-stone-400">
              <li><Link to="/catalog?pet=Chien" className="hover:text-amber-400 transition">Accessoires Chiens</Link></li>
              <li><Link to="/catalog?pet=Chat" className="hover:text-amber-400 transition">Accessoires Chats</Link></li>
              <li><Link to="/catalog?category=Couchage & Repos" className="hover:text-amber-400 transition">Couchage & Lit Orthopédique</Link></li>
              <li><Link to="/catalog?category=Harnais & Laisses" className="hover:text-amber-400 transition">Harnais & Laisses</Link></li>
              <li><Link to="/catalog?category=Jouets & Éveil" className="hover:text-amber-400 transition">Jouets Interactifs</Link></li>
            </ul>
          </div>

          {/* Column 2 */}
          <div className="space-y-3">
            <h5 className="text-sm font-semibold text-white tracking-wider uppercase">Informations</h5>
            <ul className="space-y-2 text-xs text-stone-400">
              <li><Link to="/about" className="hover:text-amber-400 transition">À propos de PatteStyle</Link></li>
              <li><Link to="/shipping-returns" className="hover:text-amber-400 transition">Politique de Livraison Europe</Link></li>
              <li><Link to="/terms" className="hover:text-amber-400 transition">CGV & Mentions Légales</Link></li>
              <li><Link to="/contact" className="hover:text-amber-400 transition">Contact & Assistance</Link></li>
            </ul>
          </div>

          {/* Column 3: Newsletter */}
          <div className="space-y-3">
            <h5 className="text-sm font-semibold text-white tracking-wider uppercase">Club PatteStyle</h5>
            <p className="text-xs text-stone-400 leading-relaxed">
              Rejoignez plus de 15 000 maîtres passionnés et recevez nos ventes privées + 10% de réduction immédiate.
            </p>
            <form onSubmit={(e) => { e.preventDefault(); alert('Merci pour votre inscription ! Code promo : PATTE10'); }} className="flex flex-col gap-2 pt-1">
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="Votre adresse email..."
                  className="w-full bg-stone-800 border border-stone-700 text-white text-xs rounded-xl px-3 py-2.5 focus:outline-hidden focus:border-amber-500"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-amber-700 hover:bg-amber-600 text-white font-medium text-xs py-2.5 rounded-xl transition shadow-xs"
              >
                S'inscrire (-10%)
              </button>
            </form>
          </div>

        </div>

        {/* Bottom copyright */}
        <div className="pt-8 border-t border-stone-800 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <p>© 2026 PatteStyle Europe. Tous droits réservés.</p>
          <div className="flex items-center gap-4 text-stone-400">
            <span>Paiements sécurisés :</span>
            <span className="bg-stone-800 px-2 py-1 rounded text-[11px] font-mono text-stone-300">Stripe CB</span>
            <span className="bg-stone-800 px-2 py-1 rounded text-[11px] font-mono text-stone-300">Visa</span>
            <span className="bg-stone-800 px-2 py-1 rounded text-[11px] font-mono text-stone-300">Mastercard</span>
            <span className="bg-stone-800 px-2 py-1 rounded text-[11px] font-mono text-stone-300">Apple Pay</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
