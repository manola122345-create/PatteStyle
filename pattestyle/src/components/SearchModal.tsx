import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, PawPrint, ChevronRight } from 'lucide-react';

interface SearchModalProps {
  onClose: () => void;
}

const SearchModal: React.FC<SearchModalProps> = ({ onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/products?search=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-start justify-center pt-16 px-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden border border-stone-200 animate-in fade-in slide-in-from-top-4 duration-200">
        
        {/* Input Bar */}
        <div className="p-4 border-b border-stone-100 flex items-center gap-3">
          <Search className="w-5 h-5 text-stone-400" />
          <input
            type="text"
            autoFocus
            placeholder="Rechercher un produit (ex: harnais, lit, brosse, chat...)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full text-stone-800 placeholder-stone-400 text-sm focus:outline-hidden"
          />
          <button 
            onClick={onClose}
            className="p-1 text-stone-400 hover:text-stone-700 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content area */}
        <div className="max-h-96 overflow-y-auto p-4">
          {loading ? (
            <div className="py-8 text-center text-stone-500 text-sm flex items-center justify-center gap-2">
              <PawPrint className="w-5 h-5 animate-spin text-amber-700" />
              Recherche des meilleurs accessoires...
            </div>
          ) : query && results.length === 0 ? (
            <div className="py-8 text-center text-stone-500 text-sm">
              Aucun accessoire ne correspond à "<span className="font-semibold text-stone-800">{query}</span>".
            </div>
          ) : results.length > 0 ? (
            <div className="space-y-2">
              <div className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-2">
                {results.length} Produit(s) trouvé(s)
              </div>
              {results.map((product) => {
                const img = Array.isArray(product.images) && product.images.length > 0 
                  ? product.images[0] 
                  : product.image || '/images/dog-bed-1.jpg';
                return (
                  <div
                    key={product.id}
                    onClick={() => {
                      onClose();
                      navigate(`/product/${product.id}`);
                    }}
                    className="flex items-center gap-4 p-2.5 rounded-xl hover:bg-amber-50 cursor-pointer transition border border-transparent hover:border-amber-200"
                  >
                    <img
                      src={img}
                      alt={product.title}
                      className="w-14 h-14 object-cover rounded-lg bg-stone-100 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase bg-amber-100 text-amber-900 px-2 py-0.5 rounded">
                          {product.pet_type}
                        </span>
                        <span className="text-xs text-stone-400 truncate">{product.category}</span>
                      </div>
                      <h4 className="font-medium text-stone-900 text-sm truncate">{product.title}</h4>
                      <p className="text-xs text-amber-700 font-bold mt-0.5">{product.price.toFixed(2)} €</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-stone-300" />
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-6 text-center text-stone-400 text-xs">
              Mots-clés populaires : <span className="text-stone-700 font-medium">Harnais anti-traction, Lit orthopédique, Jouet chat, Brosse grooming</span>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default SearchModal;
