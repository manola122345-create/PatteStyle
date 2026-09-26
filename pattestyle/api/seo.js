import supabase from './_db-client.js';

function escapeXml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

async function handleRobots(req, res, origin) {
  const body = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /checkout
Disallow: /order-confirmation

Sitemap: ${origin}/sitemap.xml
`;
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  return res.status(200).send(body);
}

async function handleSitemap(req, res, origin) {
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

async function handleProductFeed(req, res, origin) {
  let products = [];
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true);
    if (error) throw error;
    products = data || [];
  } catch (err) {
    console.error('Erreur product-feed:', err);
    return res.status(500).send('Erreur lors de la génération du flux');
  }

  const items = products.map((p) => {
    const image = Array.isArray(p.images) && p.images[0] ? p.images[0] : `${origin}/images/dog-bed-1.jpg`;
    const imageUrl = image.startsWith('http') ? image : `${origin}${image}`;
    const availability = p.stock_quantity > 0 ? 'in stock' : 'out of stock';

    return `  <item>
    <g:id>${p.id}</g:id>
    <title>${escapeXml(p.title)}</title>
    <description>${escapeXml(p.subtitle || p.description || p.title)}</description>
    <link>${origin}/product/${p.id}</link>
    <g:image_link>${escapeXml(imageUrl)}</g:image_link>
    <g:availability>${availability}</g:availability>
    <g:price>${p.price} EUR</g:price>
    <g:brand>PatteStyle</g:brand>
    <g:condition>new</g:condition>
    <g:product_type>${escapeXml(p.category || 'Accessoires')}</g:product_type>
    <g:google_product_category>Animals &amp; Pet Supplies</g:google_product_category>
    <g:identifier_exists>false</g:identifier_exists>
  </item>`;
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
<channel>
  <title>PatteStyle — Catalogue Produits</title>
  <link>${origin}</link>
  <description>Flux produits PatteStyle pour Google Merchant Center</description>
${items.join('\n')}
</channel>
</rss>`;

  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  return res.status(200).send(xml);
}

// Regroupe robots.txt, sitemap.xml et le flux Google Merchant en une seule
// fonction serverless (Vercel Hobby limite à 12 fonctions par déploiement).
export default async function handler(req, res) {
  const origin = `https://${req.headers.host}`;
  const type = req.query.type;

  if (type === 'robots') return handleRobots(req, res, origin);
  if (type === 'sitemap') return handleSitemap(req, res, origin);
  if (type === 'feed') return handleProductFeed(req, res, origin);

  return res.status(400).send('Type inconnu');
}
