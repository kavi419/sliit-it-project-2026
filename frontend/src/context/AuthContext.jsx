import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

/**
 * Global authentication context.
 *
 * Stored in sessionStorage so a page refresh survives without a server round-trip,
 * but the session is cleared when the browser tab closes.
 *
 * Shape: { email, name, role, status }  |  null (unauthenticated)
 */
const AuthContext = createContext(null);

const SESSION_KEY = 'sc_user';

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(() => {
    try { return JSON.parse(sessionStorage.getItem(SESSION_KEY)) ?? null; }
    catch { return null; }
  });
  const [loading, setLoading] = useState(true);

  // ── Try to resolve the logged-in user on mount ──────────────────────────────
  // Works for Google OAuth sessions (cookie-based) AND email/password sessions
  // that stored the user in sessionStorage.
  useEffect(() => {
    const stored = sessionStorage.getItem(SESSION_KEY);
    if (stored) {
      try { setUser(JSON.parse(stored)); }
      catch { sessionStorage.removeItem(SESSION_KEY); }
      setLoading(false);
      return;
    }

    // Attempt to fetch the OAuth2 user from the backend (cookie session)
    axios.get('/api/dashboard', { withCredentials: true })
      .then(res => {
        const u = {
          email:  res.data.email  || '',
          name:   res.data.name   || 'Campus User',
          role:   res.data.role   || 'STUDENT',
          status: res.data.status || 'ACTIVE',
        };
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(u));
        setUser(u);
      })
      .catch(() => {
        // Not logged in — leave user as null
      })
      .finally(() => setLoading(false));
  }, []);

  // ── Persist on every change ─────────────────────────────────────────────────
  const saveUser = useCallback((u) => {
    if (u) sessionStorage.setItem(SESSION_KEY, JSON.stringify(u));
    else    sessionStorage.removeItem(SESSION_KEY);
    setUser(u);
  }, []);

  // ── Login (called after successful email/password auth) ─────────────────────
  const login = useCallback((userData) => {
    saveUser(userData);
  }, [saveUser]);

  // ── Logout ──────────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    sessionStorage.removeItem(SESSION_KEY);
    setUser(null);
    try {
      // Invalidate server-side session (Google OAuth) then redirect to login
      await axios.post('/logout', {}, { withCredentials: true });
    } catch {
      // ignore — Spring logout may redirect, which axios treats as an error
    } finally {
      window.location.href = '/login';
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, saveUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
