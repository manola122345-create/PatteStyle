// Intégration réelle des pixels Meta (Facebook) & TikTok.
// Remplace l'ancien système purement décoratif (console.log only).

declare global {
  interface Window {
    fbq?: any;
    _fbq?: any;
    ttq?: any;
  }
}

let metaPixelId: string | null = null;
let tiktokPixelId: string | null = null;
let metaLoaded = false;
let tiktokLoaded = false;

function loadMetaPixel(pixelId: string) {
  if (metaLoaded || typeof window === 'undefined') return;
  metaLoaded = true;

  /* eslint-disable */
  (function (f: any, b: any, e: any, v: any) {
    if (f.fbq) return;
    const n: any = (f.fbq = function () {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
    });
    if (!f._fbq) f._fbq = n;
    n.push = n;
    n.loaded = true;
    n.version = '2.0';
    n.queue = [];
    const t = b.createElement(e);
    t.async = true;
    t.src = v;
    const s = b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t, s);
  })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
  /* eslint-enable */

  window.fbq('init', pixelId);
  window.fbq('track', 'PageView');
}

function loadTikTokPixel(pixelId: string) {
  if (tiktokLoaded || typeof window === 'undefined') return;
  tiktokLoaded = true;

  /* eslint-disable */
  (function (w: any, d: any, t: any) {
    w.TiktokAnalyticsObject = t;
    const ttq: any = (w[t] = w[t] || []);
    ttq.methods = ['page', 'track', 'identify', 'instances', 'debug', 'on', 'off', 'once', 'ready', 'alias', 'group', 'enableCookie', 'disableCookie'];
    ttq.setAndDefer = function (t2: any, e: any) {
      t2[e] = function () {
        t2.push([e].concat(Array.prototype.slice.call(arguments, 0)));
      };
    };
    for (let i = 0; i < ttq.methods.length; i++) ttq.setAndDefer(ttq, ttq.methods[i]);
    ttq.instance = function (t2: any) {
      let e = ttq._i[t2] || [];
      for (let n2 = 0; n2 < ttq.methods.length; n2++) ttq.setAndDefer(e, ttq.methods[n2]);
      return e;
    };
    ttq.load = function (e: any, n2: any) {
      const i = 'https://analytics.tiktok.com/i18n/pixel/events.js';
      ttq._i = ttq._i || {};
      ttq._i[e] = [];
      ttq._i[e]._u = i;
      ttq._t = ttq._t || {};
      ttq._t[e] = +new Date();
      ttq._o = ttq._o || {};
      ttq._o[e] = n2 || {};
      const o = d.createElement('script');
      o.type = 'text/javascript';
      o.async = true;
      o.src = i + '?sdkid=' + e + '&lib=' + t;
      const a = d.getElementsByTagName('script')[0];
      a.parentNode.insertBefore(o, a);
    };
    ttq.load(pixelId);
    ttq.page();
  })(window, document, 'ttq');
  /* eslint-enable */
}

// Appelé une fois au chargement du site avec les vrais identifiants
// configurés par l'admin (récupérés depuis /api/settings).
export function initPixels(ids: { meta?: string | null; tiktok?: string | null }) {
  if (ids.meta && ids.meta !== metaPixelId) {
    metaPixelId = ids.meta;
    loadMetaPixel(ids.meta);
  }
  if (ids.tiktok && ids.tiktok !== tiktokPixelId) {
    tiktokPixelId = ids.tiktok;
    loadTikTokPixel(ids.tiktok);
  }
}

// Appelé à chaque changement de page (navigation interne, SPA) une fois les
// pixels déjà chargés.
export function trackPageView() {
  if (window.fbq) window.fbq('track', 'PageView');
  if (window.ttq) window.ttq.page();
}

// Correspondance entre nos noms d'événements internes et les événements
// standards TikTok (Meta utilise déjà les mêmes noms que les nôtres).
const TIKTOK_EVENT_MAP: Record<string, string> = {
  ViewContent: 'ViewContent',
  AddToCart: 'AddToCart',
  InitiateCheckout: 'InitiateCheckout',
  InitiatePayment: 'InitiateCheckout',
  Purchase: 'CompletePayment'
};

export function trackEvent(eventName: string, payload: Record<string, any> = {}) {
  if (typeof window === 'undefined') return;

  const metaPayload: Record<string, any> = { ...payload, currency: payload.currency || 'EUR' };
  if (payload.total != null) metaPayload.value = payload.total;

  if (window.fbq) {
    window.fbq('track', eventName, metaPayload);
  }

  const tiktokEventName = TIKTOK_EVENT_MAP[eventName];
  if (window.ttq && tiktokEventName) {
    window.ttq.track(tiktokEventName, metaPayload);
  }

  if (!window.fbq && !window.ttq) {
    console.log(`[Pixel] ${eventName} (pixels non configurés) :`, payload);
  }
}
