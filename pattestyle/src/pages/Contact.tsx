import React, { useState } from 'react';
import { Mail, Send, CheckCircle2 } from 'lucide-react';
import Seo from '../components/Seo';

const Contact: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setError('');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, subject, message })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur lors de l\'envoi');
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'envoi du message');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <Seo
        title="Contact"
        description="Contactez PatteStyle par email — nous répondons sous 24h pour toute question sur une commande ou un produit."
        path="/contact"
      />
      <div className="text-center max-w-xl mx-auto space-y-2">
        <h1 className="font-serif text-3xl font-bold text-stone-900">
          Contactez le Support PatteStyle
        </h1>
        <p className="text-stone-500 text-xs sm:text-sm">
          Une question sur une taille, un délai de livraison ou une commande ? Notre équipe vous répond par email sous 24h.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="space-y-4 bg-stone-50 p-6 rounded-2xl border border-stone-200 text-xs text-stone-700">
          <div className="flex items-center gap-3">
            <Mail className="w-5 h-5 text-amber-700 shrink-0" />
            <div>
              <span className="font-bold text-stone-900 block">Email :</span>
              <span>shoppattes@gmail.com</span>
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
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Nom *</label>
                  <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Votre nom" className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Email *</label>
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="votre@email.com" className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Sujet *</label>
                <input type="text" required value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Sujet de votre message" className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Message *</label>
                <textarea required rows={4} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Comment pouvons-nous vous aider ?" className="w-full bg-stone-50 border border-stone-300 rounded-xl p-3 text-xs" />
              </div>

              {error && <p className="text-xs text-red-600 font-medium">{error}</p>}

              <button type="submit" disabled={sending} className="bg-amber-700 hover:bg-amber-800 disabled:opacity-60 text-white font-bold text-xs py-3 px-6 rounded-xl transition flex items-center justify-center gap-2">
                <Send className="w-4 h-4" /> {sending ? 'Envoi en cours...' : 'Envoyer le message'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Contact;
