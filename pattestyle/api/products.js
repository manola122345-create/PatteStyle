import supabase from './_db-client.js';
import { requireAdmin } from './_auth.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      const { id, category, pet_type, search, featured, limit } = req.query;

      let query = supabase.from('products').select('*');

      if (id) {
        const { data, error } = await supabase.from('products').select('*').eq('id', id).single();
        if (error) throw error;
        return res.status(200).json(data);
      }

      if (category && category !== 'Tous') {
        query = query.eq('category', category);
      }

      if (pet_type && pet_type !== 'Tous') {
        query = query.or(`pet_type.eq.${pet_type},pet_type.eq.Les deux`);
      }

      if (featured === 'true') {
        query = query.eq('is_featured', true);
      }

      if (search) {
        query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,category.ilike.%${search}%`);
      }

      query = query.order('id', { ascending: false });

      if (limit) {
        query = query.limit(parseInt(limit, 10));
      }

      const { data, error } = await query;
      if (error) throw error;
      return res.status(200).json(data || []);
    }

    if (req.method === 'POST') {
      if (!requireAdmin(req, res)) return;
      const {
        title,
        subtitle,
        description,
        price,
        compare_at_price,
        category,
        pet_type,
        images,
        variants,
        stock_quantity,
        is_active,
        is_featured,
        is_best_seller,
        delivery_estimate,
        badge,
        supplier_url,
        specifications
      } = req.body;

      const slug = (title || 'produit').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

      const { data, error } = await supabase
        .from('products')
        .insert([{
          title,
          slug,
          subtitle: subtitle || '',
          description: description || '',
          price: parseFloat(price),
          compare_at_price: compare_at_price ? parseFloat(compare_at_price) : null,
          category: category || 'Accessoires',
          pet_type: pet_type || 'Les deux',
          images: Array.isArray(images) ? images : [images || '/images/dog-bed-1.jpg'],
          variants: variants || [],
          stock_quantity: parseInt(stock_quantity || 10, 10),
          is_active: is_active !== undefined ? is_active : true,
          is_featured: !!is_featured,
          is_best_seller: !!is_best_seller,
          delivery_estimate: delivery_estimate || 'Livraison 1 à 14 jours en Europe',
          badge: badge || null,
          supplier_url: supplier_url || null,
          specifications: specifications || ''
        }])
        .select()
        .single();

      if (error) throw error;
      return res.status(201).json(data);
    }

    if (req.method === 'PUT') {
      if (!requireAdmin(req, res)) return;
      const { id, ...updates } = req.body;
      if (!id) return res.status(400).json({ error: 'ID produit requis' });

      if (updates.price) updates.price = parseFloat(updates.price);
      if (updates.compare_at_price) updates.compare_at_price = parseFloat(updates.compare_at_price);
      if (updates.stock_quantity) updates.stock_quantity = parseInt(updates.stock_quantity, 10);

      const { data, error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return res.status(200).json(data);
    }

    if (req.method === 'DELETE') {
      if (!requireAdmin(req, res)) return;
      const { id } = req.body;
      if (!id) return res.status(400).json({ error: 'ID produit requis' });

      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      return res.status(200).json({ success: true, id });
    }

    res.status(405).json({ error: 'Méthode non autorisée' });
  } catch (err) {
    console.error('API products error:', err);
    res.status(500).json({ error: err.message });
  }
}
