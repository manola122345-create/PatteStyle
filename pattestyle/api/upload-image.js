import supabase from './_db-client.js';
import { requireAdmin } from './_auth.js';

export const config = {
  api: {
    bodyParser: { sizeLimit: '8mb' }
  }
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  try {
    if (!requireAdmin(req, res)) return;

    const { filename, dataUrl } = req.body || {};
    if (!filename || typeof dataUrl !== 'string' || !dataUrl.startsWith('data:')) {
      return res.status(400).json({ error: 'Image invalide' });
    }

    const match = dataUrl.match(/^data:([^;]+);base64,(.*)$/);
    if (!match) {
      return res.status(400).json({ error: "Format d'image invalide" });
    }
    const mimeType = match[1];
    const buffer = Buffer.from(match[2], 'base64');

    if (buffer.length > 6 * 1024 * 1024) {
      return res.status(400).json({ error: 'Image trop lourde (max 6 Mo)' });
    }
    if (!mimeType.startsWith('image/')) {
      return res.status(400).json({ error: 'Le fichier doit être une image' });
    }

    const ext = (filename.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';
    const path = `products/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(path, buffer, { contentType: mimeType, upsert: false });

    if (uploadError) {
      console.error('Erreur upload Supabase Storage:', uploadError);
      return res.status(500).json({
        error: `Échec de l'upload (${uploadError.message || uploadError.error || 'raison inconnue'}). Vérifie que le bucket 'product-images' existe et est public.`
      });
    }

    const { data } = supabase.storage.from('product-images').getPublicUrl(path);
    return res.status(200).json({ url: data.publicUrl });
  } catch (err) {
    console.error('API upload-image error:', err);
    return res.status(500).json({ error: `Erreur serveur : ${err.message || err}` });
  }
}
