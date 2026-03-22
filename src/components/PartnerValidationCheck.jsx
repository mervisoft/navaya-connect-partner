import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { base44 } from '@/api/base44Client';

export default function PartnerValidationCheck({ children }) {
  const { user, isAuthenticated, validatePartner } = useAuth();
  const [isValidated, setIsValidated] = useState(null);

  useEffect(() => {
    const checkPartner = async () => {
      if (isAuthenticated && user?.email) {
        let isPartner = true; // default to allow on error
        try {
          isPartner = await validatePartner(user.email);
        } catch (e) {
          console.warn('Partner validation failed, allowing access:', e);
          setIsValidated(true);
          return;
        }
        setIsValidated(isPartner);
        
        if (!isPartner) {
          // User is not a registered partner - logout after 2 seconds
          setTimeout(() => {
            base44.auth.logout();
          }, 2000);
        }
      }
    };

    if (isAuthenticated) {
      checkPartner();
    }
  }, [isAuthenticated, user, validatePartner]);

  if (!isAuthenticated) {
    return children;
  }

  if (isValidated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-sky-50/30">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isValidated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-sky-50/30 p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md">
          <div className="text-4xl mb-4">🚫</div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Zugriff verweigert</h1>
          <p className="text-slate-600 mb-6">
            Ihre E-Mail-Adresse ist nicht als Partner registriert. Nur registrierte Handelspartner können dieses Portal nutzen.
          </p>
          <p className="text-sm text-slate-500">
            Kontaktieren Sie uns für mehr Informationen.
          </p>
        </div>
      </div>
    );
  }

  return children;
}