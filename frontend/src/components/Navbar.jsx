import React, { useState } from 'react';
import { Bell, Search, Shield, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const { user } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const displayName = user?.name || 'Campus User';
  const email       = user?.email || '';
  const role        = user?.role || 'STUDENT';
  const isAdmin     = role === 'ADMIN';
  const initials    = displayName.substring(0, 2).toUpperCase();

  return (
    <header className="fixed top-0 right-0 left-64 h-16 z-40 flex items-center justify-between px-8
      bg-white/70 backdrop-blur-xl border-b border-slate-200/60"
      style={{ boxShadow: '0 1px 0 rgba(0,0,0,0.04)' }}>

      {/* Search */}
      <div className="relative w-72 group">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400
          group-focus-within:text-indigo-500 transition-colors pointer-events-none" />
        <input
          id="navbar-search"
          type="text"
          placeholder="Search resources, bookings..."
          className="w-full pl-9 pr-4 py-2 text-sm bg-slate-100/80 hover:bg-slate-100 border border-transparent
            focus:bg-white focus:border-indigo-200 focus:ring-2 focus:ring-indigo-500/20
            rounded-xl outline-none transition-all duration-200 placeholder-slate-400 text-slate-700 font-medium"
        />
      </div>

      {/* Right cluster */}
      <div className="flex items-center gap-3">

        {/* Admin badge chip */}
        {isAdmin && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5
              bg-gradient-to-r from-rose-50 to-pink-50 border border-rose-200
              rounded-full shadow-sm"
          >
            <Shield className="w-3 h-3 text-rose-600" />
            <span className="text-[11px] font-bold text-rose-700 uppercase tracking-widest">Admin</span>
          </motion.div>
        )}

        {/* Notifications */}
        <div className="relative">
          <button
            id="navbar-notifications"
            className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center
              text-slate-500 hover:text-slate-700 transition-all duration-200"
          >
            <Bell className="w-4 h-4" />
          </button>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
        </div>

        {/* Divider */}
        <div className="w-px h-6 bg-slate-200" />

        {/* User dropdown button */}
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl hover:bg-slate-100/80
            transition-all duration-200 group"
        >
          {/* Avatar */}
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-black
            shadow-md transition-transform group-hover:scale-105
            ${isAdmin
              ? 'bg-gradient-to-br from-rose-500 to-pink-600 shadow-rose-500/30'
              : 'bg-gradient-to-br from-indigo-500 to-violet-600 shadow-indigo-500/30'}`}>
            {initials}
          </div>

          <div className="hidden sm:block text-left">
            <p className="text-xs font-bold text-slate-800 leading-none">{displayName}</p>
            <p className={`text-[10px] font-semibold uppercase tracking-widest mt-0.5
              ${isAdmin ? 'text-rose-500' : 'text-slate-400'}`}>
              {role}
            </p>
          </div>

          <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Dropdown */}
        <AnimatePresence>
          {dropdownOpen && (
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.97 }}
              transition={{ duration: 0.15 }}
              className="absolute top-14 right-4 w-56 bg-white/90 backdrop-blur-xl
                border border-slate-200/80 rounded-2xl shadow-xl shadow-slate-900/10 overflow-hidden z-50"
            >
              {/* User info */}
              <div className="px-4 py-3.5 border-b border-slate-100">
                <p className="text-sm font-bold text-slate-800">{displayName}</p>
                <p className="text-xs text-slate-500 font-medium mt-0.5 truncate">{email}</p>
              </div>
              <div className="p-2">
                {[
                  { label: 'Profile Settings', href: '/profile' },
                  { label: 'My Bookings', href: '/bookings' },
                ].map(item => (
                  <a key={item.href} href={item.href}
                    className="flex items-center px-3 py-2 rounded-xl text-sm font-medium
                      text-slate-600 hover:bg-indigo-50 hover:text-indigo-700 transition-colors">
                    {item.label}
                  </a>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};

export default Navbar;
