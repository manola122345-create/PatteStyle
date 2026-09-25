import supabase from './db-client.js';

function escapeXml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export default async function handler(req, res) {
  const origin = `https://${req.headers.host}`;

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
