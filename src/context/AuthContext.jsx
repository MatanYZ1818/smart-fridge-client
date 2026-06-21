/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useMemo, useState } from 'react';
import * as ambientApi from '../lib/ambientApi';

const AuthContext = createContext(null);

const STORAGE_KEY = 'ambient-invisible-auth-user-v1';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch {
      // ignore storage errors
    }
    return null;
  });
  const bootstrapped = true;

  const value = useMemo(() => {
    const logout = () => {
      setUser(null);
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        // ignore
      }
    };

    const login = async ({ email, password }) => {
      const u = await ambientApi.loginUser({ email, password });
      setUser(u);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
      } catch {
        // ignore
      }
      return u;
    };

    const register = async (payload) => {
      await ambientApi.registerUser(payload);
      // We intentionally don't auto-login. UX can be decided later.
    };

    const updateProfile = async ({ email, existingPassword, update }) => {
      await ambientApi.updateUser({ email, existingPassword, update });
      // Backend doesn't return updated user. Re-login for fresh data.
    };

    return { user, bootstrapped, logout, login, register, updateProfile };
  }, [user, bootstrapped]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}

