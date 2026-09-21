import crypto from 'node:crypto';

const TOKEN_TTL_MS = 12 * 60 * 60 * 1000; // 12 heures

function getSecret() {
  const secret = process.env.ADMIN_TOKEN_SECRET;
  if (!secret) {
    throw new Error('ADMIN_TOKEN_SECRET manquant côté serveur');
  }
  return secret;
}

export function signAdminToken() {
  const expires = Date.now() + TOKEN_TTL_MS;
  const payload = String(expires);
  const signature = crypto.createHmac('sha256', getSecret()).update(payload).digest('hex');
  return `${payload}.${signature}`;
}

export function isAdminRequest(req) {
  try {
    const header = req.headers.authorization || '';
    const [, token] = header.split(' '); // "Bearer <token>"
    if (!token) return false;

    const [payload, signature] = token.split('.');
    if (!payload || !signature) return false;

    const expected = crypto.createHmac('sha256', getSecret()).update(payload).digest('hex');
    const sigBuf = Buffer.from(signature, 'hex');
    const expBuf = Buffer.from(expected, 'hex');
    if (sigBuf.length !== expBuf.length) return false;
    if (!crypto.timingSafeEqual(sigBuf, expBuf)) return false;

    const expires = parseInt(payload, 10);
    if (!expires || Date.now() > expires) return false;

    return true;
  } catch {
    return false;
  }
}

export function requireAdmin(req, res) {
  if (!isAdminRequest(req)) {
    res.status(401).json({ error: 'Accès administrateur requis' });
    return false;
  }
  return true;
}
