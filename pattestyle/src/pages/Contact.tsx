import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2 } from 'lucide-react';

const Contact: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="text-center max-w-xl mx-auto space-y-2">
        <h1 className="font-serif text-3xl font-bold text-stone-900">
          Contactez le Support PatteStyle
        </h1>
        <p className="text-stone-500 text-xs sm:text-sm">
          Une question sur une taille, un délai de livraison ou une commande ? Notre équipe vous répond sous 24h.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="space-y-4 bg-stone-50 p-6 rounded-2xl border border-stone-200 text-xs text-stone-700">
          <div className="flex items-center gap-3">
            <Mail className="w-5 h-5 text-amber-700 shrink-0" />
            <div>
              <span className="font-bold text-stone-900 block">Email :</span>
              <span>contact@pattestyle.eu</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Phone className="w-5 h-5 text-amber-700 shrink-0" />
            <div>
              <span className="font-bold text-stone-900 block">Téléphone :</span>
              <span>+33 1 89 40 22 10 (7j/7)</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <MapPin className="w-5 h-5 text-amber-700 shrink-0" />
            <div>
              <span className="font-bold text-stone-900 block">Entrepôt Europe :</span>
              <span>Lyon & Bruxelles</span>
            </div>
          </div>
        </div>

        <div className="md:col-span-2 bg-white p-6 rounded-2xl border border-stone-200 shadow-xs">
          {submitted ? (
            <div className="py-12 text-center space-y-3 text-emerald-800">
              <CheckCircle2 className="w-12 h-12 mx-auto text-emerald-600" />
              <h4 className="font-bold text-lg">Message envoyé avec succès !</h4>
              <p className="text-xs text-stone-600">Un conseiller PatteStyle reviendra vers vous par email très rapidement.</p>
            </div>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Nom *</label>
                  <input type="text" required placeholder="Votre nom" className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Email *</label>
                  <input type="email" required placeholder="votre@email.com" className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Sujet *</label>
                <input type="text" required placeholder="Sujet de votre message" className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Message *</label>
                <textarea required rows={4} placeholder="Comment pouvons-nous vous aider ?" className="w-full bg-stone-50 border border-stone-300 rounded-xl p-3 text-xs" />
              </div>

              <button type="submit" className="bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs py-3 px-6 rounded-xl transition flex items-center justify-center gap-2">
                <Send className="w-4 h-4" /> Envoyer le message
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Contact;
