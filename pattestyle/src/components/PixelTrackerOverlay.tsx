import React, { useState, useEffect } from 'react';
import { subscribeToTrackingEvents, TrackingEvent } from '../lib/tracking';
import { Target, CheckCircle, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';

const PixelTrackerOverlay: React.FC = () => {
  const [events, setEvents] = useState<TrackingEvent[]>([]);
  const [isMinimized, setIsMinimized] = useState(true);

  useEffect(() => {
    // Load existing history
    try {
      const history = JSON.parse(localStorage.getItem('pattestyle_pixel_logs') || '[]');
      setEvents(history);
    } catch {}

    const unsub = subscribeToTrackingEvents((newEvent) => {
      setEvents(prev => [newEvent, ...prev.slice(0, 25)]);
    });

    return unsub;
  }, []);

  if (events.length === 0) return null;

  return (
    <div className="fixed bottom-4 left-4 z-40 bg-stone-900 text-stone-100 rounded-2xl shadow-2xl border border-stone-700 text-xs w-80 overflow-hidden font-mono">
      {/* Top bar */}
      <div 
        onClick={() => setIsMinimized(!isMinimized)}
        className="bg-stone-800 p-2.5 px-3 flex items-center justify-between cursor-pointer hover:bg-stone-700 transition"
      >
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-amber-400 animate-pulse" />
          <span className="font-bold text-amber-200 text-[11px]">Pixel Inspector (Meta & TikTok)</span>
          <span className="bg-amber-900/60 text-amber-300 text-[9px] px-1.5 py-0.5 rounded font-bold">
            {events.length}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {isMinimized ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </div>

      {/* Expandable Events Logs */}
      {!isMinimized && (
        <div className="p-3 max-h-60 overflow-y-auto space-y-2 bg-stone-950">
          <div className="flex justify-between items-center pb-2 border-b border-stone-800 text-[10px] text-stone-400">
            <span>Derniers événements trackés :</span>
            <button 
              onClick={() => { localStorage.removeItem('pattestyle_pixel_logs'); setEvents([]); }}
              className="hover:text-red-400 flex items-center gap-1"
            >
              <Trash2 className="w-3 h-3" /> Effacer
            </button>
          </div>

          {events.map((evt) => (
            <div key={evt.id} className="bg-stone-900 p-2 rounded border border-stone-800 text-[11px]">
              <div className="flex justify-between items-center text-amber-400 font-bold">
                <span>⚡ {evt.eventName}</span>
                <span className="text-[9px] text-stone-500">{evt.timestamp}</span>
              </div>
              <div className="text-[10px] text-stone-400 truncate mt-1">
                {evt.payload.title || evt.payload.product_id ? `Produit: ${evt.payload.title || evt.payload.product_id}` : `Prix: ${evt.payload.total || evt.payload.price || ''}€`}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PixelTrackerOverlay;
