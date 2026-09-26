import supabase from './_db-client.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      const { product_id } = req.query;
      let query = supabase.from('reviews').select('*');

      if (product_id) {
        query = query.eq('product_id', parseInt(product_id, 10));
      }

      query = query.order('created_at', { ascending: false });

      const { data, error } = await query;
      if (error) throw error;
      return res.status(200).json(data || []);
    }

    if (req.method === 'POST') {
      const { product_id, author_name, rating, comment, pet_info } = req.body;

      if (!product_id || !author_name || !rating) {
        return res.status(400).json({ error: 'Données d\'avis incomplètes' });
      }

      const { data, error } = await supabase
        .from('reviews')
        .insert([{
          product_id: parseInt(product_id, 10),
          author_name,
          rating: parseInt(rating, 10),
          comment: comment || '',
          verified_purchase: true,
          pet_info: pet_info || 'Propriétaire vérifié'
        }])
        .select()
        .single();

      if (error) throw error;
      return res.status(201).json(data);
    }

    res.status(405).json({ error: 'Méthode non autorisée' });
  } catch (err) {
    console.error('API reviews error:', err);
    res.status(500).json({ error: err.message });
  }
}
