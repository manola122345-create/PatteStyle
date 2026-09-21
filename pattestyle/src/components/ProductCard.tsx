import React from 'react';
import { Link } from 'react-router-dom';
import { Star, ShoppingBag, Eye, Heart, Sparkles } from 'lucide-react';
import { useCart } from '../contexts/CartContext';

interface ProductCardProps {
  product: {
    id: number;
    title: string;
    subtitle?: string;
    price: number;
    compare_at_price?: number;
    category: string;
    pet_type: string;
    images: string[] | string;
    badge?: string;
    stock_quantity: number;
  };
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();

  const mainImage = Array.isArray(product.images) && product.images.length > 0
    ? product.images[0]
    : typeof product.images === 'string'
    ? product.images
    : '/images/dog-bed-1.jpg';

  const discountPercent = product.compare_at_price && product.compare_at_price > product.price
    ? Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)
    : null;

  return (
    <div className="group bg-white rounded-2xl border border-stone-200/80 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col h-full">
      
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-stone-100">
        <img
          src={mainImage}
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
          {product.badge && (
            <span className="bg-amber-700 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md shadow-xs flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> {product.badge}
            </span>
          )}
          {discountPercent && (
            <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs">
              -{discountPercent}%
            </span>
          )}
        </div>

        {/* Pet Type Indicator Badge */}
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-xs text-stone-800 text-[10px] font-bold px-2 py-1 rounded-lg border border-stone-200 shadow-xs">
          {product.pet_type === 'Chien' && '🐶 Chien'}
          {product.pet_type === 'Chat' && '🐱 Chat'}
          {product.pet_type === 'Les deux' && '🐶🐱 Universel'}
        </div>

        {/* Quick View Hover overlay button */}
        <div className="absolute inset-0 bg-stone-900/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-4">
          <Link
            to={`/product/${product.id}`}
            className="bg-white text-stone-900 font-semibold text-xs px-4 py-2.5 rounded-xl shadow-md hover:bg-stone-50 transition flex items-center gap-1.5"
          >
            <Eye className="w-4 h-4" /> Voir le produit
          </Link>
        </div>
      </div>

      {/* Product Content */}
      <div className="p-4 flex flex-col flex-1 justify-between bg-white">
        <div>
          <div className="text-[11px] font-medium text-amber-700 uppercase tracking-wider mb-1">
            {product.category}
          </div>

          <Link to={`/product/${product.id}`}>
            <h3 className="font-medium text-stone-900 text-sm line-clamp-2 hover:text-amber-800 transition min-h-[40px]">
              {product.title}
            </h3>
          </Link>

          {/* Rating */}
          <div className="flex items-center gap-1 mt-1.5 mb-3">
            <div className="flex text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-current" />
              ))}
            </div>
            <span className="text-[11px] text-stone-500 font-medium">(4.9/5)</span>
          </div>
        </div>

        {/* Price & Add to Cart */}
        <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
          <div className="flex flex-col">
            <div className="flex items-baseline gap-2">
              <span className="font-bold text-stone-900 text-lg">
                {product.price.toFixed(2)} €
              </span>
              {product.compare_at_price && product.compare_at_price > product.price && (
                <span className="text-xs text-stone-400 line-through">
                  {product.compare_at_price.toFixed(2)} €
                </span>
              )}
            </div>
            {product.stock_quantity <= 5 && (
              <span className="text-[10px] text-amber-600 font-semibold">
                ⚡ Plus que {product.stock_quantity} en stock
              </span>
            )}
          </div>

          <button
            onClick={() => addToCart(product)}
            className="bg-amber-100 hover:bg-amber-700 text-amber-900 hover:text-white p-2.5 rounded-xl transition shadow-xs"
            title="Ajouter au panier"
          >
            <ShoppingBag className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};

export default ProductCard;
