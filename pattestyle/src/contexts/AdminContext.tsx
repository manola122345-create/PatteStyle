import React, { createContext, useContext, useState, useEffect } from 'react';

interface AdminContextType {
  isAdmin: boolean;
  adminToken: string | null;
  setIsAdmin: (val: boolean) => void;
  showAdminPinModal: boolean;
  setShowAdminPinModal: (val: boolean) => void;
  verifyPin: (pin: string) => Promise<boolean>;
  logoutAdmin: () => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

const TOKEN_KEY = 'pattestyle_admin_token';

function isTokenValid(token: string | null): boolean {
  if (!token) return false;
  const [payload] = token.split('.');
  const expires = parseInt(payload, 10);
  return Boolean(expires) && Date.now() < expires;
}

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [adminToken, setAdminToken] = useState<string | null>(() => {
    const stored = localStorage.getItem(TOKEN_KEY);
    return isTokenValid(stored) ? stored : null;
  });
  const [isAdmin, setIsAdminState] = useState<boolean>(() => isTokenValid(localStorage.getItem(TOKEN_KEY)));
  const [showAdminPinModal, setShowAdminPinModal] = useState<boolean>(false);

  useEffect(() => {
    if (adminToken) {
      localStorage.setItem(TOKEN_KEY, adminToken);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  }, [adminToken]);

  const setIsAdmin = (val: boolean) => {
    setIsAdminState(val);
    if (!val) setAdminToken(null);
  };

  const verifyPin = async (pin: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/admin-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: pin })
      });
      if (!res.ok) return false;

      const data = await res.json();
      if (!data.token) return false;

      setAdminToken(data.token);
      setIsAdminState(true);
      setShowAdminPinModal(false);
      return true;
    } catch (err) {
      console.error('Erreur de vérification admin:', err);
      return false;
    }
  };

  const logoutAdmin = () => {
    setIsAdminState(false);
    setAdminToken(null);
  };

  return (
    <AdminContext.Provider value={{
      isAdmin,
      adminToken,
      setIsAdmin,
      showAdminPinModal,
      setShowAdminPinModal,
      verifyPin,
      logoutAdmin
    }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error('useAdmin must be used within AdminProvider');
  return ctx;
};
