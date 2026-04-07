import React from 'react';
import { Bell, Search, User } from 'lucide-react';

const Navbar = () => {
  return (
    <header className="fixed top-0 right-0 left-64 h-20 glass z-40 border-b border-white/20 flex items-center justify-between px-10">
      <div className="relative w-96 group">
        <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors group-focus-within:text-indigo-500">
          <Search className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500" />
        </span>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-2 border border-white/30 rounded-xl leading-5 bg-white/20 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-indigo-600 focus:border-transparent sm:text-sm transition-all"
          placeholder="Search for resources, bookings, and more"
        />
      </div>

      <div className="flex items-center gap-6">
        <button className="relative p-2 text-gray-400 hover:text-indigo-500 transition-colors">
          <Bell className="h-6 w-6" />
          <span className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white" />
        </button>
        
        <div className="flex items-center gap-4 pl-6 border-l border-white/20">
          <div className="text-right">
            <p className="text-sm font-semibold text-slate-800">Campus User</p>
            <p className="text-xs text-slate-500">Student</p>
          </div>
          <div className="h-10 w-10 rounded-xl glass flex items-center justify-center text-indigo-600">
            <User className="w-6 h-6" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
