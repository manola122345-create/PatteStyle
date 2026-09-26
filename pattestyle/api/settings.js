import supabase from './_db-client.js';
import { requireAdmin } from './_auth.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      const { data, error } = await supabase.from('store_settings').select('*');
      if (error) throw error;

      const formatted = {};
      (data || []).forEach(item => {
        formatted[item.key] = item.value;
      });

      return res.status(200).json(formatted);
    }

    if (req.method === 'POST') {
      if (!requireAdmin(req, res)) return;
      const { key, value } = req.body;
      if (!key) return res.status(400).json({ error: 'Clé requise' });

      const { data, error } = await supabase
        .from('store_settings')
        .upsert([{ key, value }], { onConflict: 'key' })
        .select()
        .single();

      if (error) throw error;
      return res.status(200).json(data);
    }

    res.status(405).json({ error: 'Méthode non autorisée' });
  } catch (err) {
    console.error('API settings error:', err);
    res.status(500).json({ error: err.message });
  }
}
