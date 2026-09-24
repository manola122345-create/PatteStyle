import React, { useState, useEffect } from 'react';
import { useAdmin } from '../contexts/AdminContext';
import { 
  BarChart3, 
  Package, 
  ShoppingBag, 
  Users, 
  Target, 
  Plus, 
  Edit3, 
  Trash2, 
  Check, 
  Lock, 
  Truck, 
  Eye,
  RefreshCw,
  Search,
  CheckCircle2
} from 'lucide-react';

const Admin: React.FC = () => {
  const { isAdmin, adminToken, setShowAdminPinModal, logoutAdmin } = useAdmin();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'orders' | 'customers' | 'marketing'>('dashboard');

  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Product Add/Edit Modal
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);

  // Product Form Fields
  const [pTitle, setPTitle] = useState('');
  const [pSubtitle, setPSubtitle] = useState('');
  const [pDescription, setPDescription] = useState('');
  const [pPrice, setPPrice] = useState('');
  const [pComparePrice, setPComparePrice] = useState('');
  const [pCategory, setPCategory] = useState('Couchage & Repos');
  const [pPetType, setPPetType] = useState('Chien');
  const [pStock, setPStock] = useState('15');
  const [pImages, setPImages] = useState<string[]>(['/images/dog-bed-1.jpg']);
  const [pBadge, setPBadge] = useState('');
  const [pSupplierUrl, setPSupplierUrl] = useState('');
  const [pSpecifications, setPSpecifications] = useState('');
  const [pColors, setPColors] = useState('');
  const [pSizes, setPSizes] = useState('');
  const [pIsFeatured, setPIsFeatured] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const handleImageFilesSelect = async (files: FileList) => {
    setUploadError('');
    setUploadingImage(true);

    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/')) {
        setUploadError('Le fichier doit être une image.');
        continue;
      }
      if (file.size > 6 * 1024 * 1024) {
        setUploadError('Image trop lourde (max 6 Mo).');
        continue;
      }

      try {
        const dataUrl: string = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        const res = await fetch('/api/upload-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
          body: JSON.stringify({ filename: file.name, dataUrl })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Échec de l'upload");

        setPImages((prev) => [...prev, data.url]);
      } catch (err: any) {
        setUploadError(err.message || "Échec de l'upload de l'image");
      }
    }

    setUploadingImage(false);
  };

  const removeImageAt = (idx: number) => {
    setPImages((prev) => prev.filter((_, i) => i !== idx));
  };

  // Order Details Modal
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  // Pixel Settings State
  const [metaPixel, setMetaPixel] = useState(localStorage.getItem('pattestyle_meta_pixel') || 'FB-98421054');
  const [tiktokPixel, setTiktokPixel] = useState(localStorage.getItem('pattestyle_tiktok_pixel') || 'TT-7749201');
  const [pixelSaved, setPixelSaved] = useState(false);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const authHeaders = { Authorization: `Bearer ${adminToken}` };
      const [pRes, oRes, cRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/orders', { headers: authHeaders }),
        fetch('/api/customers', { headers: authHeaders })
      ]);

      const pData = await pRes.json();
      const oData = await oRes.json();
      const cData = await cRes.json();

      setProducts(Array.isArray(pData) ? pData : []);
      setOrders(Array.isArray(oData) ? oData : []);
      setCustomers(Array.isArray(cData) ? cData : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchAllData();
    }
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 bg-amber-100 text-amber-900 rounded-full flex items-center justify-center mx-auto">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="font-serif text-2xl font-bold text-stone-900">Back-Office Réservé</h2>
        <p className="text-xs text-stone-600">
          Cet espace est réservé au gérant de PatteStyle. Veuillez vous authentifier.
        </p>
        <button
          onClick={() => setShowAdminPinModal(true)}
          className="bg-amber-700 text-white font-bold text-xs px-6 py-3 rounded-xl shadow-lg"
        >
          Se Connecter (PIN: 1234)
        </button>
      </div>
    );
  }

  // Analytics KPI
  const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
  const totalOrders = orders.length;
  const avgBasket = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  const buildVariants = () => {
    const colors = pColors.split(',').map((c) => c.trim()).filter(Boolean);
    const sizes = pSizes.split(',').map((s) => s.trim()).filter(Boolean);

    if (colors.length > 0 && sizes.length > 0) {
      const combos: { color: string; size: string }[] = [];
      colors.forEach((color) => sizes.forEach((size) => combos.push({ color, size })));
      return combos;
    }
    if (colors.length > 0) return colors.map((color) => ({ color }));
    if (sizes.length > 0) return sizes.map((size) => ({ size }));
    return [];
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      title: pTitle,
      subtitle: pSubtitle,
      description: pDescription,
      price: parseFloat(pPrice),
      compare_at_price: pComparePrice ? parseFloat(pComparePrice) : null,
      category: pCategory,
      pet_type: pPetType,
      stock_quantity: parseInt(pStock, 10),
      images: pImages.length > 0 ? pImages : ['/images/dog-bed-1.jpg'],
      badge: pBadge || null,
      supplier_url: pSupplierUrl || null,
      specifications: pSpecifications || '',
      variants: buildVariants(),
      is_featured: pIsFeatured
    };

    try {
      let res;
      const authHeaders = { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` };
      if (editingProduct) {
        res = await fetch('/api/products', {
          method: 'PUT',
          headers: authHeaders,
          body: JSON.stringify({ id: editingProduct.id, ...payload })
        });
      } else {
        res = await fetch('/api/products', {
          method: 'POST',
          headers: authHeaders,
          body: JSON.stringify(payload)
        });
      }

      if (res.ok) {
        setShowProductModal(false);
        resetProductForm();
        fetchAllData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (!confirm('Supprimer définitivement ce produit du catalogue ?')) return;
    try {
      const res = await fetch('/api/products', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
        body: JSON.stringify({ id })
      });
      if (res.ok) fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateOrderStatus = async (orderId: number, status: string) => {
    try {
      const res = await fetch('/api/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
        body: JSON.stringify({ id: orderId, status })
      });
      if (res.ok) fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  const resetProductForm = () => {
    setEditingProduct(null);
    setPTitle('');
    setPSubtitle('');
    setPDescription('');
    setPPrice('');
    setPComparePrice('');
    setPCategory('Couchage & Repos');
    setPPetType('Chien');
    setPStock('15');
    setPImages(['/images/dog-bed-1.jpg']);
    setPBadge('');
    setPSupplierUrl('');
    setPSpecifications('');
    setPColors('');
    setPSizes('');
    setPIsFeatured(true);
  };

  const openEditProduct = (prod: any) => {
    setEditingProduct(prod);
    setPTitle(prod.title || '');
    setPSubtitle(prod.subtitle || '');
    setPDescription(prod.description || '');
    setPPrice(prod.price?.toString() || '');
    setPComparePrice(prod.compare_at_price?.toString() || '');
    setPCategory(prod.category || 'Couchage & Repos');
    setPPetType(prod.pet_type || 'Chien');
    setPStock(prod.stock_quantity?.toString() || '15');
    setPImages(Array.isArray(prod.images) && prod.images.length > 0 ? prod.images : ['/images/dog-bed-1.jpg']);
    setPBadge(prod.badge || '');
    setPSupplierUrl(prod.supplier_url || '');
    setPSpecifications(prod.specifications || '');
    const variantColors = Array.from(new Set((prod.variants || []).map((v: any) => v.color).filter(Boolean)));
    const variantSizes = Array.from(new Set((prod.variants || []).map((v: any) => v.size).filter(Boolean)));
    setPColors(variantColors.join(', '));
    setPSizes(variantSizes.join(', '));
    setPIsFeatured(!!prod.is_featured);
    setShowProductModal(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Admin Header */}
      <div className="bg-stone-900 text-white rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row justify-between items-center gap-4 shadow-xl">
        <div className="space-y-1 text-center md:text-left">
          <div className="inline-flex items-center gap-1.5 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full border border-emerald-500/30">
            <Lock className="w-3 h-3" /> Back-Office Gestion PatteStyle
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold">
            Tableau de Bord Administrateur
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchAllData}
            className="p-2.5 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl transition text-xs font-semibold flex items-center gap-1.5"
            title="Rafraîchir les données"
          >
            <RefreshCw className="w-4 h-4" /> Actualiser
          </button>
          <button
            onClick={logoutAdmin}
            className="p-2.5 bg-red-900/50 hover:bg-red-800 text-red-200 rounded-xl transition text-xs font-semibold"
          >
            Quitter le Mode Admin
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-stone-200 overflow-x-auto">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`px-5 py-3 text-xs font-bold border-b-2 transition flex items-center gap-2 shrink-0 ${
            activeTab === 'dashboard' ? 'border-amber-700 text-amber-800 bg-white' : 'border-transparent text-stone-500 hover:text-stone-900'
          }`}
        >
          <BarChart3 className="w-4 h-4" /> Ventes & KPIs
        </button>
        <button
          onClick={() => setActiveTab('products')}
          className={`px-5 py-3 text-xs font-bold border-b-2 transition flex items-center gap-2 shrink-0 ${
            activeTab === 'products' ? 'border-amber-700 text-amber-800 bg-white' : 'border-transparent text-stone-500 hover:text-stone-900'
          }`}
        >
          <Package className="w-4 h-4" /> Catalogue Products ({products.length})
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-5 py-3 text-xs font-bold border-b-2 transition flex items-center gap-2 shrink-0 ${
            activeTab === 'orders' ? 'border-amber-700 text-amber-800 bg-white' : 'border-transparent text-stone-500 hover:text-stone-900'
          }`}
        >
          <ShoppingBag className="w-4 h-4" /> Commandes ({orders.length})
        </button>
        <button
          onClick={() => setActiveTab('customers')}
          className={`px-5 py-3 text-xs font-bold border-b-2 transition flex items-center gap-2 shrink-0 ${
            activeTab === 'customers' ? 'border-amber-700 text-amber-800 bg-white' : 'border-transparent text-stone-500 hover:text-stone-900'
          }`}
        >
          <Users className="w-4 h-4" /> Clients ({customers.length})
        </button>
        <button
          onClick={() => setActiveTab('marketing')}
          className={`px-5 py-3 text-xs font-bold border-b-2 transition flex items-center gap-2 shrink-0 ${
            activeTab === 'marketing' ? 'border-amber-700 text-amber-800 bg-white' : 'border-transparent text-stone-500 hover:text-stone-900'
          }`}
        >
          <Target className="w-4 h-4" /> Tracking & Pixels
        </button>
      </div>

      {/* Tab 1: Dashboard KPIs */}
      {activeTab === 'dashboard' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-1">
              <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Chiffre d'Affaires Total</span>
              <div className="text-3xl font-bold text-stone-900 font-serif">
                {totalRevenue.toFixed(2)} €
              </div>
              <span className="text-[11px] text-emerald-600 font-semibold">100% payé via Stripe</span>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-1">
              <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Commandes Enregistrées</span>
              <div className="text-3xl font-bold text-stone-900 font-serif">
                {totalOrders}
              </div>
              <span className="text-[11px] text-stone-500">Expéditions Europe</span>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-1">
              <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Panier Moyen</span>
              <div className="text-3xl font-bold text-amber-800 font-serif">
                {avgBasket.toFixed(2)} €
              </div>
              <span className="text-[11px] text-stone-500">Objectif: 45,00 €</span>
            </div>
          </div>

          {/* Recent Orders table preview */}
          <div className="bg-white p-6 rounded-2xl border border-stone-200 space-y-4">
            <h3 className="font-bold text-stone-900 text-base">Dernières Commandes Europe</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 text-stone-500 uppercase font-semibold">
                  <tr>
                    <th className="p-3">N° Commande</th>
                    <th className="p-3">Client</th>
                    <th className="p-3">Zone</th>
                    <th className="p-3">Total</th>
                    <th className="p-3">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {orders.slice(0, 5).map((ord) => (
                    <tr key={ord.id} className="hover:bg-stone-50">
                      <td className="p-3 font-mono font-bold text-amber-800">{ord.order_number}</td>
                      <td className="p-3 font-medium text-stone-900">{ord.customer_name}</td>
                      <td className="p-3 text-stone-500">{ord.shipping_zone}</td>
                      <td className="p-3 font-bold text-stone-900">{ord.total?.toFixed(2)} €</td>
                      <td className="p-3">
                        <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-[10px]">
                          {ord.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Products Manager */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-stone-900 text-lg">Catalogue Produits ({products.length})</h3>
            <button
              onClick={() => { resetProductForm(); setShowProductModal(true); }}
              className="bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition flex items-center gap-1.5 shadow-md"
            >
              <Plus className="w-4 h-4" /> Ajouter un produit
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-stone-500 uppercase font-semibold">
                <tr>
                  <th className="p-3">Produit</th>
                  <th className="p-3">Catégorie</th>
                  <th className="p-3">Animal</th>
                  <th className="p-3">Prix</th>
                  <th className="p-3">Stock</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {products.map((prod) => {
                  const img = Array.isArray(prod.images) && prod.images.length > 0 ? prod.images[0] : prod.image || '/images/dog-bed-1.jpg';
                  return (
                    <tr key={prod.id} className="hover:bg-stone-50">
                      <td className="p-3 flex items-center gap-3">
                        <img src={img} alt="" className="w-10 h-10 object-cover rounded-lg bg-stone-100 shrink-0" />
                        <div>
                          <span className="font-bold text-stone-900 block">{prod.title}</span>
                          <span className="text-[10px] text-stone-400">{prod.badge || 'Standard'}</span>
                        </div>
                      </td>
                      <td className="p-3 text-stone-600">{prod.category}</td>
                      <td className="p-3 font-semibold text-amber-800">{prod.pet_type}</td>
                      <td className="p-3 font-bold text-stone-900">{prod.price?.toFixed(2)} €</td>
                      <td className="p-3">
                        <span className={`font-bold px-2 py-0.5 rounded text-[10px] ${prod.stock_quantity > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                          {prod.stock_quantity} dispo
                        </span>
                      </td>
                      <td className="p-3 text-right space-x-2">
                        <button onClick={() => openEditProduct(prod)} className="p-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg">
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDeleteProduct(prod.id)} className="p-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Orders Manager */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          <h3 className="font-bold text-stone-900 text-lg">Gestion des Commandes Clients</h3>
          <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-stone-500 uppercase font-semibold">
                <tr>
                  <th className="p-3">N° Commande</th>
                  <th className="p-3">Client</th>
                  <th className="p-3">Produits</th>
                  <th className="p-3">Total</th>
                  <th className="p-3">Statut</th>
                  <th className="p-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {orders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-stone-50">
                    <td className="p-3 font-mono font-bold text-amber-800">{ord.order_number}</td>
                    <td className="p-3">
                      <span className="font-bold text-stone-900 block">{ord.customer_name}</span>
                      <span className="text-[10px] text-stone-400">{ord.customer_email}</span>
                    </td>
                    <td className="p-3 text-stone-600">
                      {Array.isArray(ord.items) ? ord.items.length : 1} article(s)
                    </td>
                    <td className="p-3 font-bold text-stone-900">{ord.total?.toFixed(2)} €</td>
                    <td className="p-3">
                      <select
                        value={ord.status || 'Payée'}
                        onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value)}
                        className="bg-stone-100 border border-stone-300 font-bold text-[11px] rounded-lg px-2 py-1"
                      >
                        <option value="En attente">En attente</option>
                        <option value="Payée">Payée</option>
                        <option value="Expédiée">Expédiée</option>
                        <option value="Livrée">Livrée</option>
                        <option value="Annulée">Annulée</option>
                      </select>
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => setSelectedOrder(ord)}
                        className="p-1.5 bg-amber-100 text-amber-900 hover:bg-amber-200 rounded-lg text-[10px] font-bold flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" /> Détails
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Customers View */}
      {activeTab === 'customers' && (
        <div className="space-y-6">
          <h3 className="font-bold text-stone-900 text-lg">Base Clients PatteStyle</h3>
          <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-stone-500 uppercase font-semibold">
                <tr>
                  <th className="p-3">Client</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Pays</th>
                  <th className="p-3">Nb Commandes</th>
                  <th className="p-3">Total Dépensé</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {customers.map((cust) => (
                  <tr key={cust.id} className="hover:bg-stone-50">
                    <td className="p-3 font-bold text-stone-900">{cust.name}</td>
                    <td className="p-3 text-stone-600">{cust.email}</td>
                    <td className="p-3 text-stone-500">{cust.country || 'France'}</td>
                    <td className="p-3 font-mono font-bold text-stone-800">{cust.total_orders}</td>
                    <td className="p-3 font-bold text-amber-800">{cust.total_spent?.toFixed(2)} €</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 5: Marketing & Pixels Settings */}
      {activeTab === 'marketing' && (
        <div className="space-y-6 max-w-2xl bg-white p-6 rounded-2xl border border-stone-200 shadow-xs">
          <h3 className="font-bold text-stone-900 text-lg flex items-center gap-2">
            <Target className="w-5 h-5 text-amber-700" /> Configuration des Pixels Tracking TikTok & Meta
          </h3>

          <p className="text-xs text-stone-600 leading-relaxed">
            Renseignez vos identifiants de pixels de suivi publicitaire. Tous les événements clés (ViewContent, AddToCart, InitiateCheckout, Purchase) seront immédiatement retransmis.
          </p>

          <div className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Meta (Facebook) Pixel ID
              </label>
              <input
                type="text"
                value={metaPixel}
                onChange={(e) => setMetaPixel(e.target.value)}
                placeholder="ex: FB-98421054"
                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs font-mono text-stone-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                TikTok Pixel ID
              </label>
              <input
                type="text"
                value={tiktokPixel}
                onChange={(e) => setTiktokPixel(e.target.value)}
                placeholder="ex: TT-7749201"
                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs font-mono text-stone-900"
              />
            </div>

            <button
              onClick={() => {
                localStorage.setItem('pattestyle_meta_pixel', metaPixel);
                localStorage.setItem('pattestyle_tiktok_pixel', tiktokPixel);
                setPixelSaved(true);
                setTimeout(() => setPixelSaved(false), 3000);
              }}
              className="bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs py-2.5 px-6 rounded-xl transition flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" /> Enregistrer les Identifiants
            </button>

            {pixelSaved && (
              <p className="text-xs text-emerald-600 font-semibold">
                ✓ Pixels configurés et prêts à l'emploi.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Add / Edit Product Modal */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold text-stone-900 text-base pb-3 border-b border-stone-100">
              {editingProduct ? 'Éditer le Produit' : 'Nouveau Produit au Catalogue'}
            </h3>

            <form onSubmit={handleSaveProduct} className="space-y-4 pt-4 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Titre Produit *</label>
                <input
                  type="text"
                  required
                  value={pTitle}
                  onChange={(e) => setPTitle(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Sous-titre / Slogan</label>
                <input
                  type="text"
                  value={pSubtitle}
                  onChange={(e) => setPSubtitle(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Prix Vente (€) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={pPrice}
                    onChange={(e) => setPPrice(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Prix Barré (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={pComparePrice}
                    onChange={(e) => setPComparePrice(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Catégorie</label>
                  <select
                    value={pCategory}
                    onChange={(e) => setPCategory(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2"
                  >
                    <option value="Couchage & Repos">Couchage & Repos</option>
                    <option value="Harnais & Laisses">Harnais & Laisses</option>
                    <option value="Jouets & Éveil">Jouets & Éveil</option>
                    <option value="Soin & Grooming">Soin & Grooming</option>
                    <option value="Repas & Gamelles">Repas & Gamelles</option>
                    <option value="Accessoires Auto & Transport">Accessoires Auto & Transport</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Cible Animal</label>
                  <select
                    value={pPetType}
                    onChange={(e) => setPPetType(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2"
                  >
                    <option value="Chien">Chien</option>
                    <option value="Chat">Chat</option>
                    <option value="Les deux">Les deux</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Quantité Stock</label>
                  <input
                    type="number"
                    value={pStock}
                    onChange={(e) => setPStock(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Badge Promo</label>
                  <input
                    type="text"
                    placeholder="ex: -30% Offre Flash"
                    value={pBadge}
                    onChange={(e) => setPBadge(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Lien produit fournisseur (AliExpress)
                </label>
                <input
                  type="url"
                  placeholder="https://www.aliexpress.com/item/..."
                  value={pSupplierUrl}
                  onChange={(e) => setPSupplierUrl(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2"
                />
                <p className="text-[11px] text-stone-400 mt-1">
                  Usage interne uniquement — jamais visible par les clients. Apparaît sur chaque commande pour passer la commande fournisseur rapidement.
                </p>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Images du produit</label>
                <div className="flex flex-wrap gap-3 mb-3">
                  {pImages.map((img, idx) => (
                    <div key={idx} className="relative w-20 h-20 rounded-xl bg-stone-100 border border-stone-300 overflow-hidden shrink-0 group">
                      <img src={img} alt={`Aperçu ${idx + 1}`} className="w-full h-full object-cover" />
                      {idx === 0 && (
                        <span className="absolute bottom-0 inset-x-0 bg-amber-700 text-white text-[9px] font-bold text-center py-0.5">
                          Principale
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => removeImageAt(idx)}
                        className="absolute top-1 right-1 bg-stone-900/70 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
                <label className="inline-flex items-center gap-2 bg-stone-800 hover:bg-stone-900 text-white text-xs font-semibold px-4 py-2.5 rounded-xl cursor-pointer transition">
                  {uploadingImage ? 'Envoi en cours...' : '+ Ajouter des images'}
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    disabled={uploadingImage}
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) handleImageFilesSelect(e.target.files);
                      e.target.value = '';
                    }}
                  />
                </label>
                <p className="text-[11px] text-stone-400 mt-1.5">
                  La première image est utilisée comme image principale du produit. Les clients pourront naviguer entre toutes les images sur la fiche produit.
                </p>
                {uploadError && (
                  <p className="text-xs text-red-600 font-medium mt-1.5">{uploadError}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Couleurs disponibles</label>
                  <input
                    type="text"
                    placeholder="ex: Beige, Gris, Marron"
                    value={pColors}
                    onChange={(e) => setPColors(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2"
                  />
                  <p className="text-[10px] text-stone-400 mt-1">Séparées par des virgules. Laisse vide si pas de choix de couleur.</p>
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Tailles disponibles</label>
                  <input
                    type="text"
                    placeholder="ex: S, M, L"
                    value={pSizes}
                    onChange={(e) => setPSizes(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2"
                  />
                  <p className="text-[10px] text-stone-400 mt-1">Séparées par des virgules. Laisse vide si pas de choix de taille.</p>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Conseils & Spécifications</label>
                <textarea
                  rows={4}
                  placeholder="ex: Entretien : lavable en machine à 30°C.&#10;Matériaux : tissu Oxford haute densité, mousse à mémoire de forme."
                  value={pSpecifications}
                  onChange={(e) => setPSpecifications(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl p-3"
                />
                <p className="text-[11px] text-stone-400 mt-1">
                  Affiché dans l'onglet "Conseils & Spécifications" de la fiche produit. Laisse vide pour garder le texte générique par défaut.
                </p>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={pDescription}
                  onChange={(e) => setPDescription(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl p-3"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="w-1/2 py-2.5 text-stone-600 border border-stone-300 rounded-xl font-bold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="w-1/2 bg-amber-700 text-white py-2.5 rounded-xl font-bold"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 text-xs space-y-4">
            <h3 className="font-bold text-stone-900 text-base pb-2 border-b border-stone-100 flex justify-between">
              <span>Détail Commande {selectedOrder.order_number}</span>
              <button onClick={() => setSelectedOrder(null)} className="text-stone-400">✕</button>
            </h3>

            <div className="space-y-2">
              <p><strong>Client :</strong> {selectedOrder.customer_name} ({selectedOrder.customer_email})</p>
              <p><strong>Adresse de livraison :</strong> {selectedOrder.shipping_address?.street}, {selectedOrder.shipping_address?.zip} {selectedOrder.shipping_address?.city} ({selectedOrder.shipping_address?.country})</p>
              <p><strong>N° Suivi :</strong> {selectedOrder.tracking_number}</p>
            </div>

            <div className="border-t pt-2">
              <strong className="block mb-1">Articles :</strong>
              <div className="space-y-2">
                {Array.isArray(selectedOrder.items) && selectedOrder.items.map((it: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-center gap-2 bg-stone-50 rounded-lg px-2 py-1.5">
                    <div>
                      <span className="block">{it.quantity}x {it.title}</span>
                      {it.supplier_url ? (
                        <a
                          href={it.supplier_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-amber-700 underline text-[11px] font-semibold"
                        >
                          Commander chez le fournisseur →
                        </a>
                      ) : (
                        <span className="text-stone-400 text-[11px]">Pas de lien fournisseur renseigné</span>
                      )}
                    </div>
                    <span className="font-bold whitespace-nowrap">{(it.price * it.quantity).toFixed(2)} €</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t pt-2 font-bold text-stone-900 flex justify-between">
              <span>Total Commande :</span>
              <span className="text-amber-800">{selectedOrder.total?.toFixed(2)} €</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Admin;
