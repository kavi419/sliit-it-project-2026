import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

/**
 * Global authentication context.
 *
 * Stored in sessionStorage so refreshing the page restores state instantly
 * without a server round-trip. The session clears on explicit logout.
 *
 * User shape: { email, name, role, status }  |  null (unauthenticated)
 *
 * Hydration order:
 *  1. sessionStorage hit  → instant, no network call
 *  2. GET /api/user/me    → works for Google OAuth (Spring session cookie) AND
 *                           email/password (pass ?email= param)
 */
const AuthContext = createContext(null);

const SESSION_KEY = 'sc_user';

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(() => {
    try { return JSON.parse(sessionStorage.getItem(SESSION_KEY)) ?? null; }
    catch { return null; }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = sessionStorage.getItem(SESSION_KEY);

    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setUser(parsed);

        // ── Background role sync ─────────────────────────────────────────────
        // Even if we have a cached session, re-fetch the role from the DB so
        // that admin approvals or role changes are reflected immediately on
        // the next page load — without requiring the user to log out and back in.
        const url = parsed.email
          ? `/api/user/me?email=${encodeURIComponent(parsed.email)}`
          : '/api/user/me';

        axios.get(url, { withCredentials: true })
          .then(res => {
            const fresh = {
              email:  res.data.email  || parsed.email,
              name:   res.data.name   || parsed.name || 'Campus User',
              role:   res.data.role   || 'STUDENT',
              status: res.data.status || 'ACTIVE',
            };
            // Only update if something actually changed (avoids unnecessary re-renders)
            if (fresh.role !== parsed.role || fresh.status !== parsed.status) {
              sessionStorage.setItem(SESSION_KEY, JSON.stringify(fresh));
              setUser(fresh);
            }
          })
          .catch(() => { /* silent — cached data is good enough */ })
          .finally(() => setLoading(false));

        return; // don't fall through to the unauthenticated fetch below
      } catch {
        sessionStorage.removeItem(SESSION_KEY);
      }
    }

    // ── No cached session: try Google OAuth cookie ──────────────────────────
    axios.get('/api/user/me', { withCredentials: true })
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
        // Not logged in — leave user as null, ProtectedRoute will handle it
      })
      .finally(() => setLoading(false));
  }, []);

  // ── Persist helper ──────────────────────────────────────────────────────────
  const saveUser = useCallback((u) => {
    if (u) sessionStorage.setItem(SESSION_KEY, JSON.stringify(u));
    else    sessionStorage.removeItem(SESSION_KEY);
    setUser(u);
  }, []);

  // ── Login (called after successful email/password auth) ─────────────────────
  // Immediately stores the server-returned role/status, then does a background
  // re-fetch from /api/user/me to ensure the role is the DB source of truth.
  const login = useCallback((userData) => {
    saveUser(userData);

    // Background DB sync — resolve the real role immediately after login
    const url = userData.email
      ? `/api/user/me?email=${encodeURIComponent(userData.email)}`
      : '/api/user/me';

    axios.get(url, { withCredentials: true })
      .then(res => {
        const fresh = {
          email:  res.data.email  || userData.email,
          name:   res.data.name   || userData.name,
          role:   res.data.role   || userData.role,
          status: res.data.status || userData.status,
        };
        saveUser(fresh);
      })
      .catch(() => { /* use the data from the login response */ });
  }, [saveUser]);

  // ── Logout ──────────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    sessionStorage.removeItem(SESSION_KEY);
    setUser(null);
    try {
      await axios.post('/logout', {}, { withCredentials: true });
    } catch {
      // Spring logout sends a redirect which axios treats as an error — ignore
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
