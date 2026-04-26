import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import MainLayout from './components/MainLayout';
import Dashboard from './pages/Dashboard';
import Resources from './pages/Resources';
import TicketsMain from './pages/Tickets/TicketsMain';
import ModernLogin from './components/ModernLogin';
import WaitingPage from './pages/WaitingPage';
import Bookings from './pages/Bookings';

/**
 * ProtectedRoute — guards routes that require an active session.
 *
 * Rules:
 *  - No user in session  → redirect to /login
 *  - PENDING_ADMIN       → redirect to /waiting
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

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.status === 'PENDING_ADMIN') {
    return <Navigate to="/waiting" replace />;
  }

  return children;
};

const RootRedirect = () => {
  const { user } = useAuth();
  if (user?.role === 'TECHNICIAN') return <Navigate to="/tickets/dashboard" replace />;
  return <Navigate to="/dashboard" replace />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Default route */}
          <Route path="/" element={<RootRedirect />} />

          {/* Public routes */}
          <Route path="/login" element={<ModernLogin />} />
          <Route path="/waiting" element={<WaitingPage />} />

          {/* Protected routes — all wrapped by MainLayout */}
          <Route
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/tickets/*" element={<TicketsMain />} />
            <Route path="/bookings" element={<Bookings />} />
            <Route path="/profile" element={<div className="p-10 text-2xl font-bold">Profile Settings Coming Soon...</div>} />
            <Route path="/settings" element={<div className="p-10 text-2xl font-bold">System Settings Coming Soon...</div>} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;