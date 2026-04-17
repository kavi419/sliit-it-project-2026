import React from 'react';
import { Bell, Search, User, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();

  const displayName = user?.name || 'Campus User';
  const role        = user?.role || 'STUDENT';
  const isAdmin     = role === 'ADMIN';

  return (
    <header className="fixed top-0 right-0 left-64 h-20 glass z-40 border-b border-white/20 flex items-center justify-between px-10">
      {/* Search */}
      <div className="relative w-96 group">
        <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
        </span>
        <input
          id="navbar-search"
          type="text"
          className="block w-full pl-10 pr-3 py-2 border border-white/30 rounded-xl leading-5
            bg-white/20 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400
            focus:ring-2 focus:ring-indigo-600 focus:border-transparent sm:text-sm transition-all"
          placeholder="Search for resources, bookings, and more"
        />
      </div>

      {/* Right side */}
      <div className="flex items-center gap-6">
        {/* Notifications */}
        <button id="navbar-notifications" className="relative p-2 text-gray-400 hover:text-indigo-500 transition-colors">
          <Bell className="h-6 w-6" />
          <span className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white" />
        </button>

        {/* User identity */}
        <div className="flex items-center gap-4 pl-6 border-l border-white/20">
          <div className="text-right">
            <div className="flex items-center justify-end gap-2">
              <p className="text-sm font-semibold text-slate-800">{displayName}</p>
              {/* Rose ADMIN badge */}
              {isAdmin && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full
                  bg-rose-100 border border-rose-200 text-rose-700 text-[10px] font-bold uppercase tracking-widest">
                  <Shield className="w-2.5 h-2.5" />
                  Admin
                </span>
              )}
            </div>
            <p className={`text-xs uppercase tracking-widest font-semibold mt-0.5
              ${isAdmin ? 'text-rose-500' : 'text-slate-400'}`}>
              {role}
            </p>
          </div>

          {/* Avatar */}
          <div className={`h-10 w-10 rounded-xl flex items-center justify-center
            ${isAdmin ? 'bg-rose-100 text-rose-600' : 'glass text-indigo-600'}`}>
            <User className="w-6 h-6" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
