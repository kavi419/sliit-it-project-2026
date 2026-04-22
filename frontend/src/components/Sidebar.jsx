import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Calendar, Layout, User, Settings, LogOut, Building2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const SidebarItem = ({ to, icon: Icon, label }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `relative flex items-center gap-3 px-6 py-4 transition-all duration-300 group ${
        isActive ? 'text-indigo-600' : 'text-slate-500 hover:text-indigo-500'
      }`
    }
  >
    {({ isActive }) => (
      <>
        <Icon className={`w-5 h-5 ${isActive ? 'scale-110' : 'group-hover:scale-110'} transition-transform`} />
        <span className="font-medium">{label}</span>
        {isActive && (
          <motion.div
            layoutId="sidebar-active"
            className="absolute left-0 w-1.5 h-8 bg-indigo-600 rounded-r-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          />
        )}
      </>
    )}
  </NavLink>
);

const Sidebar = () => {
  const { user, logout } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const handleLogout = async () => {
    await logout(); // clears sessionStorage + calls Spring /logout + redirects to /login
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 glass z-50 border-r border-white/20">
      <div className="p-8">
        <h1 className="text-2xl font-bold text-indigo-600 tracking-tight flex items-center gap-2">
          <Layout className="w-8 h-8" /> Smart Campus
        </h1>
      </div>

      <nav className="mt-8 flex flex-col gap-1">
        <SidebarItem to="/dashboard" icon={Home}     label="Dashboard"  />
        {isAdmin && <SidebarItem to="/resources" icon={Building2} label="Resources" />}
        <SidebarItem to="/bookings"  icon={Calendar}  label="My Bookings" />
        <SidebarItem to="/profile"   icon={User}      label="Profile"    />
        <SidebarItem to="/settings"  icon={Settings}  label="Settings"   />
      </nav>

      <div className="absolute bottom-10 left-0 w-full px-6">
        <button
          id="btn-logout"
          onClick={handleLogout}
          className="flex items-center gap-3 text-slate-500 hover:text-red-500 transition-colors
            w-full px-4 py-3 rounded-xl hover:bg-red-50"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
