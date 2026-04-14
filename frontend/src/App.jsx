import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/MainLayout';
import Dashboard from './pages/Dashboard';
import ModernLogin from './components/ModernLogin';

function App() {
  return (
    <Router>
      <Routes>
        {/* Default route redirects to dashboard */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        {/* Login route */}
        <Route path="/login" element={<ModernLogin />} />
        
        {/* App layout with navigation */}
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          
          {/* Placeholder routes for other features */}
          <Route path="/bookings" element={<div className="p-10 text-2xl font-bold">Bookings Coming Soon...</div>} />
          <Route path="/profile" element={<div className="p-10 text-2xl font-bold">Profile Settings Coming Soon...</div>} />
          <Route path="/settings" element={<div className="p-10 text-2xl font-bold">System Settings Coming Soon...</div>} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
