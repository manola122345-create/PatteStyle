import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, PawPrint, Filter, X, ArrowUpDown } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { trackEvent } from '../lib/tracking';

const Catalog: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const selectedPet = searchParams.get('pet') || 'Tous';
  const selectedCategory = searchParams.get('category') || 'Tous';
  const [sortBy, setSortBy] = useState<string>('newest');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const categoriesList = [
    'Tous',
    'Couchage & Repos',
    'Harnais & Laisses',
    'Jouets & Éveil',
    'Soin & Grooming',
    'Repas & Gamelles',
    'Accessoires Auto & Transport'
  ];

  useEffect(() => {
    trackEvent('ViewContent', { page: 'Catalog', pet: selectedPet, category: selectedCategory });

    const fetchProducts = async () => {
      setLoading(true);
      try {
        let url = `/api/products?`;
        if (selectedPet !== 'Tous') url += `pet_type=${encodeURIComponent(selectedPet)}&`;
        if (selectedCategory !== 'Tous') url += `category=${encodeURIComponent(selectedCategory)}&`;

        const res = await fetch(url);
        const data = await res.json();
        setProducts(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [selectedPet, selectedCategory]);

  // Filter & Sort Logic
  const filteredProducts = products.filter(product => {
    return true;
  }).sort((a, b) => {
    if (sortBy === 'price-asc') return a.price - b.price;
    if (sortBy === 'price-desc') return b.price - a.price;
    return b.id - a.id;
  });

  const updatePetFilter = (pet: string) => {
    if (pet === 'Tous') searchParams.delete('pet');
    else searchParams.set('pet', pet);
    setSearchParams(searchParams);
  };

  const updateCategoryFilter = (cat: string) => {
    if (cat === 'Tous') searchParams.delete('category');
    else searchParams.set('category', cat);
    setSearchParams(searchParams);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header Title */}
      <div className="bg-gradient-to-r from-amber-900 to-stone-900 text-white rounded-3xl p-8 shadow-xl space-y-3">
        <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
          <PawPrint className="w-4 h-4" /> Catalogue Officiel PatteStyle Europe
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold">
          {selectedPet !== 'Tous' ? `Accessoires pour ${selectedPet}s` : 'Tous nos Accessoires pour Animaux'}
        </h1>
        <p className="text-stone-300 text-xs sm:text-sm max-w-2xl">
          Découvrez du matériel haut de gamme conçu pour le bien-être de votre compagnon. Expédition gratuite en Europe dès 49€.
        </p>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Sidebar Filters (Desktop) */}
        <div className="hidden lg:block space-y-6 bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs h-fit sticky top-28">
          <div className="flex items-center justify-between pb-4 border-b border-stone-100">
            <h3 className="font-bold text-stone-900 text-base flex items-center gap-2">
              <Filter className="w-4 h-4 text-amber-700" /> Filtres
            </h3>
            {(selectedPet !== 'Tous' || selectedCategory !== 'Tous') && (
              <button 
                onClick={() => {
                  setSearchParams({});
                }}
                className="text-[11px] font-semibold text-amber-700 hover:underline"
              >
                Réinitialiser
              </button>
            )}
          </div>

          {/* Animal Target Filter */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Compagnon
            </label>
            <div className="grid grid-cols-3 gap-1 bg-stone-100 p-1 rounded-xl">
              {['Tous', 'Chien', 'Chat'].map((pet) => (
                <button
                  key={pet}
                  onClick={() => updatePetFilter(pet)}
                  className={`py-1.5 text-xs font-bold rounded-lg transition ${
                    selectedPet === pet 
                      ? 'bg-amber-700 text-white shadow-xs' 
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  {pet === 'Tous' ? 'Tous' : pet === 'Chien' ? '🐶 Chiens' : '🐱 Chats'}
                </button>
              ))}
            </div>
          </div>

          {/* Category Filter */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Catégories
            </label>
            <div className="space-y-1">
              {categoriesList.map((cat) => (
                <button
                  key={cat}
                  onClick={() => updateCategoryFilter(cat)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition flex items-center justify-between ${
                    selectedCategory === cat
                      ? 'bg-amber-100 text-amber-950 font-bold border border-amber-300'
                      : 'text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  <span>{cat}</span>
                  {selectedCategory === cat && <span className="w-2 h-2 rounded-full bg-amber-700" />}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Product Grid Area */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Controls Bar */}
          <div className="bg-white p-4 rounded-2xl border border-stone-200/80 flex flex-wrap items-center justify-between gap-4">
            
            <button
              onClick={() => setMobileFilterOpen(true)}
              className="lg:hidden flex items-center gap-2 text-xs font-bold text-stone-800 bg-stone-100 px-3.5 py-2 rounded-xl"
            >
              <SlidersHorizontal className="w-4 h-4 text-amber-700" />
              Filtres ({selectedPet !== 'Tous' || selectedCategory !== 'Tous' ? 'Actifs' : 'Tous'})
            </button>

            <span className="text-xs text-stone-500 font-medium">
              <strong className="text-stone-900">{filteredProducts.length}</strong> produit(s) affiché(s)
            </span>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <ArrowUpDown className="w-4 h-4 text-stone-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-stone-50 border border-stone-200 text-stone-800 text-xs font-semibold rounded-xl px-3 py-2 focus:outline-hidden"
              >
                <option value="newest">Trier par : Nouveautés</option>
                <option value="price-asc">Prix : Croissant</option>
                <option value="price-desc">Prix : Décroissant</option>
              </select>
            </div>

          </div>

          {/* Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 py-12">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-80 bg-stone-100 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-2xl border border-stone-200 space-y-4">
              <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-700 mx-auto flex items-center justify-center">
                <PawPrint className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-stone-800">Aucun produit ne correspond à vos filtres</h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                Essayez de réinitialiser la catégorie sélectionnée.
              </p>
              <button
                onClick={() => { setSearchParams({}); }}
                className="bg-amber-700 text-white font-bold text-xs px-6 py-2.5 rounded-xl"
              >
                Voir tout le catalogue
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

        </div>

      </div>

      {/* Mobile Filter Modal */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex justify-end">
          <div className="bg-white w-full max-w-xs h-full p-6 overflow-y-auto space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-stone-100">
              <h3 className="font-bold text-stone-900">Filtres Catalogue</h3>
              <button onClick={() => setMobileFilterOpen(false)} className="p-1 text-stone-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-stone-500">Animal</label>
              <div className="grid grid-cols-3 gap-1 bg-stone-100 p-1 rounded-xl">
                {['Tous', 'Chien', 'Chat'].map((pet) => (
                  <button
                    key={pet}
                    onClick={() => updatePetFilter(pet)}
                    className={`py-1.5 text-xs font-bold rounded-lg ${selectedPet === pet ? 'bg-amber-700 text-white' : 'text-stone-600'}`}
                  >
                    {pet}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-stone-500">Catégories</label>
              <div className="space-y-1">
                {categoriesList.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => updateCategoryFilter(cat)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium ${selectedCategory === cat ? 'bg-amber-100 text-amber-900 font-bold' : 'text-stone-600'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => setMobileFilterOpen(false)}
              className="w-full bg-amber-700 text-white font-bold py-3 rounded-xl text-xs"
            >
              Afficher les résultats ({filteredProducts.length})
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default Catalog;
