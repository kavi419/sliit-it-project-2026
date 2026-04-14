import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import MainLayout from './components/MainLayout';
import Dashboard from './pages/Dashboard';
import ModernLogin from './components/ModernLogin';
import WaitingPage from './pages/WaitingPage';

/**
 * ProtectedRoute — guards routes that require an active session.
 *
 * Rules:
 *  - No user in session  → redirect to /login
 *  - PENDING_ADMIN        → redirect to /waiting (blocked until approved)
 *  - Otherwise           → render children normally
 */
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-purple-800 to-slate-900">
        <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  // No session — send to login
  // (Commented out for now so existing Google OAuth flow still works without
  //  a sessionStorage entry. Uncomment once full session management is wired.)
  // if (!user) return <Navigate to="/login" replace />;

  // PENDING_ADMIN cannot access the dashboard at all
  if (user && user.status === 'PENDING_ADMIN') {
    return <Navigate to="/waiting" replace />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Default → dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* Public routes */}
          <Route path="/login"   element={<ModernLogin />} />
          <Route path="/waiting" element={<WaitingPage />} />

          {/* Protected app layout */}
          <Route element={<MainLayout />}>
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route path="/bookings" element={<div className="p-10 text-2xl font-bold">Bookings Coming Soon...</div>} />
            <Route path="/profile"  element={<div className="p-10 text-2xl font-bold">Profile Settings Coming Soon...</div>} />
            <Route path="/settings" element={<div className="p-10 text-2xl font-bold">System Settings Coming Soon...</div>} />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
