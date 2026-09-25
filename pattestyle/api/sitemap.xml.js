import supabase from './db-client.js';

export default async function handler(req, res) {
  const origin = `https://${req.headers.host}`;

  let products = [];
  try {
    const { data } = await supabase
      .from('products')
      .select('id, created_at')
      .eq('is_active', true);
    products = data || [];
  } catch (err) {
    console.error('Erreur sitemap (produits):', err);
  }

  const staticPages = [
    { path: '/', priority: '1.0' },
    { path: '/catalog', priority: '0.9' },
    { path: '/about', priority: '0.5' },
    { path: '/contact', priority: '0.5' },
    { path: '/shipping-returns', priority: '0.4' },
    { path: '/terms', priority: '0.3' }
  ];

  const urls = [
    ...staticPages.map((p) => `  <url>
    <loc>${origin}${p.path}</loc>
    <priority>${p.priority}</priority>
  </url>`),
    ...products.map((p) => `  <url>
    <loc>${origin}/product/${p.id}</loc>
    <lastmod>${new Date(p.created_at).toISOString().split('T')[0]}</lastmod>
    <priority>0.8</priority>
  </url>`)
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;

  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  return res.status(200).send(xml);
}
