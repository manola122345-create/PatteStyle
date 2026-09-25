export default async function handler(req, res) {
  const origin = `https://${req.headers.host}`;

  const body = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /checkout
Disallow: /order-confirmation

Sitemap: ${origin}/api/sitemap.xml
`;

  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  return res.status(200).send(body);
}
