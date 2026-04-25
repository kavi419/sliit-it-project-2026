import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Calendar, Layout, User, Settings, LogOut, Building2, Wrench } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const SidebarItem = ({ to, icon: Icon, label }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `relative flex items-center gap-3 mx-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
        isActive
          ? 'text-indigo-700 bg-indigo-50'
          : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100/70'
      }`
    }
  >
    {({ isActive }) => (
      <>
        {isActive && (
          <motion.div
            layoutId="sidebar-pill"
            className="absolute inset-0 bg-gradient-to-r from-indigo-50 to-violet-50
              border border-indigo-100/80 rounded-xl"
            transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
          />
        )}
        <Icon className={`relative w-4.5 h-4.5 transition-all duration-200
          ${isActive ? 'text-indigo-600 scale-110' : 'text-slate-400 group-hover:scale-110 group-hover:text-slate-600'}`}
          size={18} />
        <span className={`relative text-sm font-semibold tracking-tight
          ${isActive ? 'text-indigo-700' : 'text-slate-600'}`}>
          {label}
        </span>
        {isActive && (
          <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-indigo-600" />
        )}
      </>
    )}
  </NavLink>
);

const Sidebar = () => {
  const { user, logout } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 z-50 flex flex-col
      bg-white/70 backdrop-blur-xl border-r border-slate-200/60"
      style={{ boxShadow: '4px 0 24px rgba(0,0,0,0.04)' }}>

      {/* Brand */}
      <div className="px-6 py-6 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-700
            flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Layout className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-black text-slate-800 tracking-tight leading-none">Smart Campus</p>
            <p className="text-[10px] text-slate-400 font-medium mt-0.5 uppercase tracking-wider">Hub v2.0</p>
          </div>
        </div>
      </div>

      {/* Nav label */}
      <div className="px-6 pt-5 pb-2">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Navigation</p>
      </div>

      {/* Nav items */}
      <nav className="flex flex-col gap-1 flex-1 overflow-y-auto pb-4">
        <SidebarItem to="/dashboard" icon={Home}     label="Dashboard"  />
        {isAdmin && <SidebarItem to="/resources" icon={Building2} label="Resources" />}
        <SidebarItem to="/bookings"  icon={Calendar}  label={isAdmin ? "Bookings" : "My Bookings"} />
        <SidebarItem to="/tickets"   icon={Wrench}    label="Maintenance" />
        <SidebarItem to="/profile"   icon={User}      label="Profile"    />
        <SidebarItem to="/settings"  icon={Settings}  label="Settings"   />
      </nav>

      {/* User card + logout */}
      <div className="p-4 border-t border-slate-100 space-y-2">
        {user && (
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-slate-50">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-sm
              ${isAdmin ? 'bg-gradient-to-br from-rose-500 to-pink-600' : 'bg-gradient-to-br from-indigo-500 to-violet-600'}`}>
              {(user.name || user.email || 'U')[0].toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-700 truncate">{user.name || user.email}</p>
              <p className={`text-[10px] font-bold uppercase tracking-widest ${isAdmin ? 'text-rose-500' : 'text-indigo-500'}`}>
                {user.role || 'STUDENT'}
              </p>
            </div>
          </div>
        )}
        <button
          id="btn-logout"
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-slate-500
            hover:text-red-600 hover:bg-red-50 transition-all duration-200 group text-sm font-semibold"
        >
          <LogOut className="w-4 h-4 group-hover:rotate-12 transition-transform" />
          Sign Out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
