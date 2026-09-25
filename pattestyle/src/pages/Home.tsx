import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Seo from '../components/Seo';
import { 
  PawPrint, 
  ArrowRight, 
  Truck, 
  ShieldCheck, 
  Star, 
  Clock, 
  ChevronRight,
  Heart,
  TrendingUp,
  CheckCircle2
} from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { trackEvent } from '../lib/tracking';

const Home: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [bestSellers, setBestSellers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    trackEvent('ViewContent', { page: 'Homepage' });

    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/products');
        const data = await res.json();
        if (Array.isArray(data)) {
          setFeaturedProducts(data.filter(p => p.is_featured).slice(0, 4));
          setBestSellers(data.filter(p => p.is_best_seller || p.is_featured).slice(0, 8));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="space-y-16 pb-16">
      <Seo
        title="Accessoires Premium pour Chiens & Chats"
        description="PatteStyle — accessoires premium pour chiens et chats en Europe : couchages orthopédiques, harnais, gamelles, jouets. Livraison 1 à 7 jours ouvrables."
        path="/"
      />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-amber-100/60 via-amber-50/30 to-white pt-10 pb-16 md:pt-16 md:pb-24 border-b border-amber-900/5 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column Text */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-extrabold text-stone-900 tracking-tight leading-[1.15]">
                Le confort & l'élégance que votre <span className="text-amber-700 underline decoration-amber-300 decoration-wavy underline-offset-8">compagnon</span> mérite.
              </h1>

              <p className="text-base sm:text-lg text-stone-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Découvrez notre sélection exclusive d'accessoires ergomiques, durables et élégants pour chiens et chats. Pensés pour améliorer leur quotidien et sublimer votre intérieur.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  to="/catalog"
                  className="w-full sm:w-auto bg-amber-700 hover:bg-amber-800 text-white font-bold text-base px-8 py-4 rounded-2xl shadow-xl shadow-amber-700/25 flex items-center justify-center gap-2 transition transform hover:-translate-y-0.5"
                >
                  <span>Découvrir la Collection</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>

                <Link
                  to="/catalog?pet=Chien"
                  className="w-full sm:w-auto bg-white hover:bg-stone-50 text-stone-800 font-semibold text-base px-6 py-4 rounded-2xl border border-stone-300 shadow-xs flex items-center justify-center gap-2 transition"
                >
                  <span>🐶 Coin Chiens</span>
                </Link>

                <Link
                  to="/catalog?pet=Chat"
                  className="w-full sm:w-auto bg-white hover:bg-stone-50 text-stone-800 font-semibold text-base px-6 py-4 rounded-2xl border border-stone-300 shadow-xs flex items-center justify-center gap-2 transition"
                >
                  <span>🐱 Coin Chats</span>
                </Link>
              </div>

              {/* Social Proof */}
              <div className="pt-6 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-stone-600 text-xs font-medium border-t border-amber-900/10">
                <div className="flex items-center gap-2">
                  <div className="flex text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <span className="font-bold text-stone-900">4.9/5</span> (1,420+ avis vérifiés)
                </div>
                <div className="flex items-center gap-1.5 text-stone-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>+15 000 Animaux heureux en Europe</span>
                </div>
              </div>

            </div>

            {/* Right Column Image Banner */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white aspect-4/5 bg-stone-200">
                <img
                  src="/images/dog-bed-1.jpg"
                  alt="Lit orthopédique pour chien PatteStyle"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <h2 className="font-serif text-3xl font-bold text-stone-900">
            Univers & Catégories
          </h2>
          <p className="text-stone-500 text-sm">
            Un équipement adapté à la morphologie et aux besoins spécifiques de chaque compagnon.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            to={`/catalog?category=${encodeURIComponent('Couchage & Repos')}`}
            className="group relative h-48 rounded-2xl overflow-hidden shadow-md bg-stone-900 flex items-end p-4 text-white"
          >
            <img
              src="/images/dog-bed-1.jpg"
              alt="Couchage"
              className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:scale-110 transition duration-500"
            />
            <div className="relative z-10 space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-wider text-amber-300">Confort Absolu</span>
              <h3 className="font-bold text-lg leading-tight">Lits & Couchages</h3>
            </div>
          </Link>

          <Link
            to={`/catalog?category=${encodeURIComponent('Harnais & Laisses')}`}
            className="group relative h-48 rounded-2xl overflow-hidden shadow-md bg-stone-900 flex items-end p-4 text-white"
          >
            <img
              src="/images/dog-harness.jpg"
              alt="Harnais"
              className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:scale-110 transition duration-500"
            />
            <div className="relative z-10 space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-wider text-amber-300">Sécurité & Promenade</span>
              <h3 className="font-bold text-lg leading-tight">Harnais Ergonomiques</h3>
            </div>
          </Link>

          <Link
            to={`/catalog?category=${encodeURIComponent('Repas & Gamelles')}`}
            className="group relative h-48 rounded-2xl overflow-hidden shadow-md bg-stone-900 flex items-end p-4 text-white"
          >
            <img
              src="/images/pet-bowl.jpg"
              alt="Gamelles"
              className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:scale-110 transition duration-500"
            />
            <div className="relative z-10 space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-wider text-amber-300">Céramique & Inox</span>
              <h3 className="font-bold text-lg leading-tight">Gamelles & Repas</h3>
            </div>
          </Link>

          <Link
            to={`/catalog?category=${encodeURIComponent('Jouets & Éveil')}`}
            className="group relative h-48 rounded-2xl overflow-hidden shadow-md bg-stone-900 flex items-end p-4 text-white"
          >
            <img
              src="/images/pet-toy.jpg"
              alt="Jouets"
              className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:scale-110 transition duration-500"
            />
            <div className="relative z-10 space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-wider text-amber-300">Anti-Ennui</span>
              <h3 className="font-bold text-lg leading-tight">Jouets & Éveil</h3>
            </div>
          </Link>
        </div>
      </section>

      {/* Featured Products Carousel/Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex items-end justify-between border-b border-stone-200 pb-4">
          <div>
            <span className="text-xs font-bold text-amber-700 uppercase tracking-widest">Nos Incontournables</span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 mt-1">
              Produits Phares du Moment
            </h2>
          </div>
          <Link to="/catalog" className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1">
            Voir tout le catalogue <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-12">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-80 bg-stone-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {bestSellers.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Brand Story / Quality Section */}
      <section className="bg-stone-900 text-stone-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 bg-amber-900/50 text-amber-400 text-xs font-bold px-3 py-1 rounded-full border border-amber-700/40">
              <PawPrint className="w-4 h-4" />
              <span>Notre Engagement Qualité</span>
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl font-bold leading-tight text-white">
              Pourquoi plus de 15 000 maîtres nous font confiance en Europe ?
            </h2>

            <div className="space-y-4 text-stone-300 text-sm leading-relaxed">
              <p>
                Chez <strong>PatteStyle</strong>, nous pensons que les accessoires pour animaux ne doivent pas faire de compromis entre esthétique, ergonomie et durabilité.
              </p>
              <p>
                Chaque article est rigoureusement sélectionné et testé par des professionnels et des vétérinaires afin de garantir une sécurité totale pour votre chien ou chat.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-stone-800">
              <div>
                <span className="font-serif text-3xl font-bold text-amber-400">100%</span>
                <p className="text-xs text-stone-400 mt-1">Conforme aux normes européennes CE</p>
              </div>
              <div>
                <span className="font-serif text-3xl font-bold text-amber-400">24-48h</span>
                <p className="text-xs text-stone-400 mt-1">Préparation & expédition des commandes</p>
              </div>
            </div>
          </div>

          <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-stone-800 aspect-square">
            <img
              src="/images/cat-bed.jpg"
              alt="Maison de chat cozy PatteStyle"
              className="w-full h-full object-cover"
            />
          </div>

        </div>
      </section>

      {/* Customer Reviews Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1 text-amber-500">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-5 h-5 fill-current" />
            ))}
          </div>
          <h2 className="font-serif text-3xl font-bold text-stone-900">
            Avis de nos Clients Poilus
          </h2>
          <p className="text-stone-500 text-xs sm:text-sm">
            Découvrez les retours authentiques des propriétaires partout en Europe.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-stone-50 p-6 rounded-2xl border border-stone-200/70 space-y-4">
            <div className="flex items-center gap-1 text-amber-400">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
            </div>
            <p className="text-xs text-stone-700 italic leading-relaxed">
              "Le lit orthopédique est incroyable ! Mon Beagle de 8 ans qui souffre d'arthrose ne le quitte plus. La qualité du tissu est irréprochable et la livraison en Belgique a pris seulement 2 jours."
            </p>
            <div className="flex items-center gap-3 pt-2 border-t border-stone-200">
              <div className="w-9 h-9 rounded-full bg-amber-200 text-amber-900 font-bold flex items-center justify-center text-xs">
                MC
              </div>
              <div>
                <h5 className="font-bold text-stone-900 text-xs">Marie C. (Bruxelles, 🇧🇪)</h5>
                <span className="text-[10px] text-emerald-700 font-medium">Achat Vérifié • Propriétaire de Milo</span>
              </div>
            </div>
          </div>

          <div className="bg-stone-50 p-6 rounded-2xl border border-stone-200/70 space-y-4">
            <div className="flex items-center gap-1 text-amber-400">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
            </div>
            <p className="text-xs text-stone-700 italic leading-relaxed">
              "J'ai pris le harnais rembourré avec les bandes réfléchissantes pour mes balades de nuit. Très facile à ajuster et très solide. Le service client a répondu en 5 minutes à ma question."
            </p>
            <div className="flex items-center gap-3 pt-2 border-t border-stone-200">
              <div className="w-9 h-9 rounded-full bg-amber-200 text-amber-900 font-bold flex items-center justify-center text-xs">
                TL
              </div>
              <div>
                <h5 className="font-bold text-stone-900 text-xs">Thibault L. (Lyon, 🇫🇷)</h5>
                <span className="text-[10px] text-emerald-700 font-medium">Achat Vérifié • Propriétaire de Rocky</span>
              </div>
            </div>
          </div>

          <div className="bg-stone-50 p-6 rounded-2xl border border-stone-200/70 space-y-4">
            <div className="flex items-center gap-1 text-amber-400">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
            </div>
            <p className="text-xs text-stone-700 italic leading-relaxed">
              "L'arbre à chat cozy s'intègre parfaitement dans mon salon sans gâcher la déco ! Mon chaton l'a adopté immédiatement. Emballage soigné et livraison très rapide."
            </p>
            <div className="flex items-center gap-3 pt-2 border-t border-stone-200">
              <div className="w-9 h-9 rounded-full bg-amber-200 text-amber-900 font-bold flex items-center justify-center text-xs">
                SD
              </div>
              <div>
                <h5 className="font-bold text-stone-900 text-xs">Sophie D. (Geneva, 🇨🇭)</h5>
                <span className="text-[10px] text-emerald-700 font-medium">Achat Vérifié • Propriétaire de Nala</span>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;
