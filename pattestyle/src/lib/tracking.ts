// Tracking system helper for Meta (Facebook) & TikTok Pixels
export interface TrackingEvent {
  id: string;
  eventName: string;
  provider: 'Meta' | 'TikTok' | 'Both';
  timestamp: string;
  payload: Record<string, any>;
}

type EventListener = (event: TrackingEvent) => void;
const listeners: EventListener[] = [];

export function subscribeToTrackingEvents(callback: EventListener) {
  listeners.push(callback);
  return () => {
    const idx = listeners.indexOf(callback);
    if (idx > -1) listeners.splice(idx, 1);
  };
}

export function trackEvent(eventName: string, payload: Record<string, any> = {}) {
  const metaPixelId = localStorage.getItem('pattestyle_meta_pixel') || 'FB-98421054';
  const tiktokPixelId = localStorage.getItem('pattestyle_tiktok_pixel') || 'TT-7749201';

  const event: TrackingEvent = {
    id: `evt-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    eventName,
    provider: 'Both',
    timestamp: new Date().toLocaleTimeString('fr-FR'),
    payload: {
      ...payload,
      metaPixelId,
      tiktokPixelId,
      currency: 'EUR'
    }
  };

  console.log(`[Pixel Tracker] 🎯 ${eventName}:`, event);

  // Notify listeners (UI overlay logger)
  listeners.forEach(fn => fn(event));

  // Store in event history
  try {
    const history = JSON.parse(localStorage.getItem('pattestyle_pixel_logs') || '[]');
    history.unshift(event);
    localStorage.setItem('pattestyle_pixel_logs', JSON.stringify(history.slice(0, 30)));
  } catch (e) {
    console.error(e);
  }
}
