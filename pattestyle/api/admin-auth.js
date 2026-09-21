import { signAdminToken } from './_auth.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  try {
    const configuredCode = process.env.ADMIN_ACCESS_CODE;
    if (!configuredCode) {
      console.error('ADMIN_ACCESS_CODE non configuré côté serveur');
      return res.status(500).json({ error: 'Configuration serveur manquante' });
    }

    const { code } = req.body || {};
    if (!code || code !== configuredCode) {
      return res.status(401).json({ error: 'Code incorrect' });
    }

    const token = signAdminToken();
    return res.status(200).json({ token });
  } catch (err) {
    console.error('API admin-auth error:', err);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}
