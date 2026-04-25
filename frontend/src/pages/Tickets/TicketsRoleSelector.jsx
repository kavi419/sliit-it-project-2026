import React from 'react';
import { ShieldAlert, Wrench, User } from 'lucide-react';

const TicketsRoleSelector = ({ onSelect }) => {
  return (
    <div className="max-w-4xl mx-auto py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-4">Welcome to Maintenance Hub</h1>
        <p className="text-lg font-medium text-slate-500">For demonstration purposes, please select a role to simulate the dashboard experience.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Student View */}
        <button 
          onClick={() => onSelect('USER')}
          className="glass-card p-8 text-left hover:-translate-y-2 transition-all hover:shadow-xl hover:shadow-blue-500/10 border-t-4 border-transparent hover:border-blue-500 group"
        >
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
             <User className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-slate-800 mb-2">Campus Student</h2>
          <p className="text-slate-500 font-medium">Students can create new maintenance tickets and track the progress of their submitted issues.</p>
        </button>

        {/* Technician View */}
        <button 
          onClick={() => onSelect('TECHNICIAN')}
          className="glass-card p-8 text-left hover:-translate-y-2 transition-all hover:shadow-xl hover:shadow-amber-500/10 border-t-4 border-transparent hover:border-amber-500 group"
        >
          <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
             <Wrench className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-slate-800 mb-2">Technician</h2>
          <p className="text-slate-500 font-medium">Technicians view their assigned repairs, communicate with reporters, and mark tickets as resolved.</p>
        </button>

        {/* Admin View */}
        <button 
          onClick={() => onSelect('ADMIN')}
          className="glass-card p-8 text-left hover:-translate-y-2 transition-all hover:shadow-xl hover:shadow-indigo-500/10 border-t-4 border-transparent hover:border-indigo-500 group"
        >
          <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
             <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-slate-800 mb-2">IT Administrator</h2>
          <p className="text-slate-500 font-medium">Admins possess full oversight. They triage incoming tickets, assign mechanics, and close finalized reports.</p>
        </button>
      </div>
    </div>
  );
};

export default TicketsRoleSelector;
