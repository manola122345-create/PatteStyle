import React, { useState } from 'react';
import { useAdmin } from '../contexts/AdminContext';
import { Lock, Key, X, CheckCircle2 } from 'lucide-react';

const AdminPinModal: React.FC = () => {
  const { showAdminPinModal, setShowAdminPinModal, verifyPin } = useAdmin();
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [checking, setChecking] = useState(false);

  if (!showAdminPinModal) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setChecking(true);
    const ok = await verifyPin(pin);
    setChecking(false);
    if (!ok) {
      setError(true);
    } else {
      setError(false);
      setPin('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center pb-4 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center">
              <Lock className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-stone-900 text-base">Accès Administration PatteStyle</h3>
          </div>
          <button
            onClick={() => setShowAdminPinModal(false)}
            className="text-stone-400 hover:text-stone-700 p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-4 space-y-4">
          <p className="text-xs text-stone-600 leading-relaxed">
            Entrez le code d'accès administrateur pour gérer le catalogue, modifier les statuts de commande et configurer les Pixels Marketing.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Code PIN Administrateur
              </label>
              <div className="relative">
                <input
                  type="password"
                  autoFocus
                  value={pin}
                  onChange={(e) => { setPin(e.target.value); setError(false); }}
                  placeholder="Code d'accès"
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-4 py-2.5 text-sm font-mono text-stone-900 focus:outline-hidden focus:border-amber-600"
                />
                <Key className="w-4 h-4 text-stone-400 absolute right-3 top-3" />
              </div>
              {error && (
                <p className="text-xs text-red-600 font-medium mt-1">
                  Code incorrect.
                </p>
              )}
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowAdminPinModal(false)}
                className="w-1/2 py-2.5 text-xs font-semibold text-stone-600 border border-stone-300 rounded-xl hover:bg-stone-50 transition"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={checking}
                className="w-1/2 py-2.5 bg-amber-700 hover:bg-amber-800 disabled:opacity-60 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" /> {checking ? 'Vérification...' : 'Déverrouiller'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminPinModal;
