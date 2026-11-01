import React, { createContext, useContext } from 'react';

/**
 * Temporary auth shim.
 * Real authentication will be provided by the Go backend (Sprint 0.4+).
 * API-compatible with the original Supabase-based context so the
 * transplanted components stay byte-identical.
 */
export interface AuthUser {
  id: string;
  email: string;
}

interface AuthContextType {
  user: AuthUser | null;
  session: null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STUB_USER: AuthUser = {
  id: 'local-admin',
  email: 'admin@inventorex.local',
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const signOut = async () => {
    // No session to clear yet - real sign-out lands with the Go backend.
  };

  return (
    <AuthContext.Provider
      value={{ user: STUB_USER, session: null, loading: false, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
