import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Star, 
  Truck, 
  ShieldCheck, 
  ShoppingBag, 
  Check, 
  Sparkles, 
  Clock, 
  Heart,
  MessageSquare,
  PawPrint,
  ChevronRight
} from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { trackEvent } from '../lib/tracking';
import ProductCard from '../components/ProductCard';
import Seo from '../components/Seo';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { addToCart } = useCart();

  const [product, setProduct] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Gallery & Variant State
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<'description' | 'specifications' | 'reviews'>('description');

  // Review Form State
  const [authorName, setAuthorName] = useState('');
  const [petInfo, setPetInfo] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);

    const fetchData = async () => {
      try {
        const res = await fetch(`/api/products?id=${id}`);
        const data = await res.json();
        if (data) {
          setProduct(data);
          
          const images = Array.isArray(data.images) && data.images.length > 0 
            ? data.images 
            : [data.image || '/images/dog-bed-1.jpg'];
          setSelectedImage(images[0]);

          // Set default variants if available
          if (Array.isArray(data.variants) && data.variants.length > 0) {
            const first = data.variants[0];
            if (first.color) setSelectedColor(first.color);
            if (first.size) setSelectedSize(first.size);
          }

          trackEvent('ViewContent', {
            product_id: data.id,
            title: data.title,
            price: data.price,
            category: data.category
          });
        }

        // Fetch reviews
        const revRes = await fetch(`/api/reviews?product_id=${id}`);
        const revData = await revRes.json();
        setReviews(Array.isArray(revData) ? revData : []);

        // Fetch related products
        const relRes = await fetch(`/api/products?limit=4`);
        const relData = await relRes.json();
        if (Array.isArray(relData)) {
          setRelatedProducts(relData.filter(p => p.id !== Number(id)).slice(0, 3));
        }

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim() || !comment.trim()) return;

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: product.id,
          author_name: authorName,
          pet_info: petInfo || 'Propriétaire d\'animal',
          rating,
          comment
        })
      });

      if (res.ok) {
        const newRev = await res.json();
        setReviews(prev => [newRev, ...prev]);
        setReviewSubmitted(true);
        setComment('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-stone-500">
        <PawPrint className="w-8 h-8 animate-spin text-amber-700 mx-auto mb-2" />
        Chargement de la fiche produit...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-2xl font-bold text-stone-800">Produit introuvable</h2>
        <Link to="/catalog" className="text-amber-700 font-bold hover:underline">
          Retour au catalogue
        </Link>
      </div>
    );
  }

  const galleryImages = Array.isArray(product.images) && product.images.length > 0
    ? product.images
    : [product.image || '/images/dog-bed-1.jpg'];

  // Colors & Sizes extraction from variants or defaults
  const availableColors = Array.from(new Set((product.variants || []).map((v: any) => v.color).filter(Boolean)));
  const availableSizes = Array.from(new Set((product.variants || []).map((v: any) => v.size).filter(Boolean)));

  const discountPercent = product.compare_at_price && product.compare_at_price > product.price
    ? Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)
    : null;

  const avgRating = reviews.length > 0
    ? reviews.reduce((sum: number, r: any) => sum + (r.rating || 0), 0) / reviews.length
    : null;

  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.subtitle || product.description || product.title,
    image: galleryImages,
    sku: String(product.id),
    brand: { '@type': 'Brand', name: 'PatteStyle' },
    offers: {
      '@type': 'Offer',
      url: `${window.location.origin}/product/${product.id}`,
      priceCurrency: 'EUR',
      price: product.price,
      availability: product.stock_quantity > 0
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition'
    },
    ...(avgRating && reviews.length > 0 ? {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: avgRating.toFixed(1),
        reviewCount: reviews.length
      }
    } : {})
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      <Seo
        title={product.title}
        description={product.subtitle || product.description || `${product.title} — disponible sur PatteStyle, livraison en Europe.`}
        path={`/product/${product.id}`}
        image={galleryImages[0]}
        type="product"
        jsonLd={productJsonLd}
      />
      
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-stone-500">
        <Link to="/" className="hover:text-stone-900">Accueil</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link to="/catalog" className="hover:text-stone-900">Catalogue</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-amber-800 font-semibold truncate">{product.title}</span>
      </nav>

      {/* Main PDP Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* Left: Gallery (5 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="relative aspect-square rounded-3xl overflow-hidden border border-stone-200 bg-stone-100 shadow-md">
            <img
              src={selectedImage}
              alt={product.title}
              className="w-full h-full object-cover"
            />
            {product.badge && (
              <span className="absolute top-4 left-4 bg-amber-700 text-white text-xs font-bold px-3 py-1 rounded-lg shadow-xs flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> {product.badge}
              </span>
            )}
            {discountPercent && (
              <span className="absolute top-4 right-4 bg-red-600 text-white text-xs font-bold px-2.5 py-1 rounded-lg">
                -{discountPercent}%
              </span>
            )}
          </div>

          {/* Thumbnails */}
          {galleryImages.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {galleryImages.map((img: string, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition shrink-0 ${
                    selectedImage === img ? 'border-amber-700 ring-2 ring-amber-700/20' : 'border-stone-200 hover:border-stone-400'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Info & Buying Options (7 cols) */}
        <div className="lg:col-span-6 space-y-6">
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="bg-amber-100 text-amber-900 text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full">
                {product.pet_type}
              </span>
              <span className="text-xs text-stone-500 font-medium">{product.category}</span>
            </div>

            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 leading-tight">
              {product.title}
            </h1>

            {/* Subtitle / Punchline */}
            {product.subtitle && (
              <p className="text-stone-600 text-sm font-medium">
                {product.subtitle}
              </p>
            )}

            {/* Rating summary */}
            <div className="flex items-center gap-2 pt-1">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <span className="text-xs font-bold text-stone-800">4.9/5</span>
              <span className="text-xs text-stone-400">({reviews.length + 24} avis clients vérifiés)</span>
            </div>
          </div>

          {/* Price Box */}
          <div className="bg-amber-50/80 border border-amber-200/80 p-4 rounded-2xl flex items-center justify-between">
            <div>
              <div className="flex items-baseline gap-3">
                <span className="font-bold text-3xl text-stone-900">
                  {product.price.toFixed(2)} €
                </span>
                {product.compare_at_price && (
                  <span className="text-sm text-stone-400 line-through">
                    {product.compare_at_price.toFixed(2)} €
                  </span>
                )}
              </div>
              <span className="text-[11px] text-stone-500 font-medium">TVA incluse • Paiement en 3x ou 4x sans frais</span>
            </div>

            <div className="text-right">
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-lg">
                <Check className="w-3.5 h-3.5" /> En Stock
              </span>
            </div>
          </div>

          {/* Urgency Stock Banner */}
          {product.stock_quantity <= 8 && (
            <div className="bg-amber-100 text-amber-950 text-xs font-bold p-3 rounded-xl border border-amber-300 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-700 animate-pulse" />
              <span>⚡ Plus que {product.stock_quantity} exemplaires disponibles à ce tarif !</span>
            </div>
          )}

          {/* Color Variants */}
          {availableColors.length > 0 && (
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase text-stone-600">
                Couleur : <span className="text-amber-800 font-bold">{selectedColor || 'Par défaut'}</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {availableColors.map((color: any) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition ${
                      selectedColor === color
                        ? 'border-amber-700 bg-amber-700 text-white shadow-xs'
                        : 'border-stone-300 bg-white text-stone-800 hover:border-stone-400'
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Size Variants */}
          {availableSizes.length > 0 && (
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase text-stone-600">
                Taille : <span className="text-amber-800 font-bold">{selectedSize || 'Standard'}</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {availableSizes.map((size: any) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold border transition ${
                      selectedSize === size
                        ? 'border-amber-700 bg-amber-700 text-white shadow-xs'
                        : 'border-stone-300 bg-white text-stone-800 hover:border-stone-400'
                    }`}
                  >
                    Taille {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity + Add to Cart */}
          <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
            
            {/* Quantity Selector */}
            <div className="flex items-center border border-stone-300 rounded-2xl bg-white p-1">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 flex items-center justify-center font-bold text-stone-600 hover:bg-stone-100 rounded-xl"
              >
                -
              </button>
              <span className="w-12 text-center font-bold text-stone-900 text-sm">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-10 h-10 flex items-center justify-center font-bold text-stone-600 hover:bg-stone-100 rounded-xl"
              >
                +
              </button>
            </div>

            {/* Add Button */}
            <button
              onClick={() => addToCart(product, selectedColor, selectedSize, quantity)}
              className="flex-1 w-full bg-amber-700 hover:bg-amber-800 text-white font-bold py-4 px-6 rounded-2xl shadow-xl shadow-amber-700/20 flex items-center justify-center gap-2 transition"
            >
              <ShoppingBag className="w-5 h-5" />
              <span>Ajouter au Panier ({(product.price * quantity).toFixed(2)} €)</span>
            </button>

          </div>

          {/* Shipping Delivery Time Indicator */}
          <div className="bg-stone-50 border border-stone-200/80 p-4 rounded-2xl space-y-2">
            <div className="flex items-center gap-2 text-stone-800 text-xs font-bold">
              <Truck className="w-4 h-4 text-amber-700" />
              <span>Estimé de Livraison Europe :</span>
            </div>
            <p className="text-xs text-stone-600">
              {product.delivery_estimate || 'Livraison sous 1 à 7 jours ouvrables en Europe (Colissimo / Chronopost).'}
            </p>
          </div>

          {/* Guarantees row */}
          <div className="grid grid-cols-3 gap-2 text-center text-[10px] text-stone-500 pt-2 border-t border-stone-200">
            <div className="space-y-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600 mx-auto" />
              <span>Paiement Sécurisé</span>
            </div>
            <div className="space-y-1">
              <Truck className="w-4 h-4 text-amber-600 mx-auto" />
              <span>Livraison 1-7 jours</span>
            </div>
            <div className="space-y-1">
              <Heart className="w-4 h-4 text-red-500 mx-auto" />
              <span>Service Client 7j/7</span>
            </div>
          </div>

        </div>

      </div>

      {/* Tabs: Description, Specs, Reviews */}
      <div className="bg-white rounded-3xl border border-stone-200/80 overflow-hidden shadow-xs">
        <div className="flex border-b border-stone-200 bg-stone-50/50">
          <button
            onClick={() => setActiveTab('description')}
            className={`px-6 py-4 text-xs font-bold border-b-2 transition ${
              activeTab === 'description' ? 'border-amber-700 text-amber-800 bg-white' : 'border-transparent text-stone-500 hover:text-stone-900'
            }`}
          >
            Description Détailée
          </button>
          <button
            onClick={() => setActiveTab('specifications')}
            className={`px-6 py-4 text-xs font-bold border-b-2 transition ${
              activeTab === 'specifications' ? 'border-amber-700 text-amber-800 bg-white' : 'border-transparent text-stone-500 hover:text-stone-900'
            }`}
          >
            Conseils & Spécifications
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`px-6 py-4 text-xs font-bold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'reviews' ? 'border-amber-700 text-amber-800 bg-white' : 'border-transparent text-stone-500 hover:text-stone-900'
            }`}
          >
            <span>Avis Clients</span>
            <span className="bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full text-[10px]">
              {reviews.length}
            </span>
          </button>
        </div>

        <div className="p-6 sm:p-8">
          {activeTab === 'description' && (
            <div className="prose leading-relaxed text-xs sm:text-sm text-stone-700 space-y-4">
              <p>{product.description}</p>
              <p>
                Spécialement développé pour offrir une expérience optimale à votre animal de compagnie, cet accessoire combine des matériaux respirants et robustes, faciles à entretenir.
              </p>
            </div>
          )}

          {activeTab === 'specifications' && (
            <div className="space-y-4 text-xs sm:text-sm text-stone-700">
              {product.specifications ? (
                <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 whitespace-pre-line">
                  {product.specifications}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-stone-50 p-4 rounded-xl border border-stone-200">
                    <span className="font-bold text-stone-900 block mb-1">Entretien :</span>
                    <span>Lavable en machine à 30°C ou au chiffon humide. Séchage rapide à l'air libre.</span>
                  </div>
                  <div className="bg-stone-50 p-4 rounded-xl border border-stone-200">
                    <span className="font-bold text-stone-900 block mb-1">Matériaux :</span>
                    <span>Tissu Oxford haute densité, mousse à mémoire de forme, microfibre hypoallergénique.</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-8">
              
              {/* Reviews List */}
              <div className="space-y-4">
                {reviews.length === 0 ? (
                  <p className="text-xs text-stone-500 italic">Soyez le premier à donner votre avis sur cet accessoire !</p>
                ) : (
                  reviews.map((rev) => (
                    <div key={rev.id} className="p-4 bg-stone-50 rounded-2xl border border-stone-200/60 space-y-2">
                      <div className="flex justify-between items-center">
                        <div>
                          <h5 className="font-bold text-stone-900 text-xs">{rev.author_name}</h5>
                          <span className="text-[10px] text-stone-500">{rev.pet_info}</span>
                        </div>
                        <div className="flex text-amber-400">
                          {[...Array(rev.rating)].map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-current" />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-stone-700">{rev.comment}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Add Review Form */}
              <div className="pt-6 border-t border-stone-200 space-y-4">
                <h4 className="font-bold text-stone-900 text-sm flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-amber-700" /> Laisser un avis
                </h4>

                {reviewSubmitted ? (
                  <div className="bg-emerald-50 text-emerald-800 p-4 rounded-xl text-xs font-semibold">
                    Merci ! Votre avis a été enregistré avec succès.
                  </div>
                ) : (
                  <form onSubmit={handleAddReview} className="space-y-4 max-w-xl">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-stone-700 mb-1">Votre Prénom</label>
                        <input
                          type="text"
                          required
                          value={authorName}
                          onChange={(e) => setAuthorName(e.target.value)}
                          placeholder="ex: Julien B."
                          className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs focus:outline-hidden"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-stone-700 mb-1">Votre Animal</label>
                        <input
                          type="text"
                          value={petInfo}
                          onChange={(e) => setPetInfo(e.target.value)}
                          placeholder="ex: Propriétaire de Charly (Pug)"
                          className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs focus:outline-hidden"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">Note (sur 5 étoiles)</label>
                      <select
                        value={rating}
                        onChange={(e) => setRating(Number(e.target.value))}
                        className="bg-stone-50 border border-stone-300 text-stone-800 text-xs rounded-xl px-3 py-2"
                      >
                        <option value="5">⭐⭐⭐⭐⭐ 5/5 Excellent</option>
                        <option value="4">⭐⭐⭐⭐ 4/5 Très bon</option>
                        <option value="3">⭐⭐⭐ 3/5 Correct</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">Votre commentaire</label>
                      <textarea
                        required
                        rows={3}
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Qu'a pensé votre compagnon de cet accessoire ?"
                        className="w-full bg-stone-50 border border-stone-300 rounded-xl p-3 text-xs focus:outline-hidden"
                      />
                    </div>

                    <button
                      type="submit"
                      className="bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs py-2.5 px-6 rounded-xl transition"
                    >
                      Publier mon avis
                    </button>
                  </form>
                )}
              </div>

            </div>
          )}
        </div>
      </div>

      {/* Associated Recommended Products */}
      {relatedProducts.length > 0 && (
        <section className="space-y-6 pt-6">
          <h3 className="font-serif text-2xl font-bold text-stone-900">
            Produits Recommandés & Associés
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

    </div>
  );
};

export default ProductDetail;
