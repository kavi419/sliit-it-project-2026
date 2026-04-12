import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import TicketsList from './TicketsList';
import TicketDetails from './TicketDetails';
import TicketsRoleSelector from './TicketsRoleSelector';

const TicketsMain = () => {
  const [role, setRole] = useState(localStorage.getItem('mockRole'));
  const navigate = useNavigate();

  const handleRoleSelect = (selectedRole) => {
    localStorage.setItem('mockRole', selectedRole);
    setRole(selectedRole);
    navigate('/tickets/dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('mockRole');
    setRole(null);
    navigate('/tickets');
  };

  return (
    <div>
      {role && (
        <div className="bg-slate-900 text-slate-300 text-xs py-3 px-6 flex justify-between rounded-2xl mb-8 items-center shadow-lg">
            <span className="font-medium text-sm flex items-center gap-3">
              Dashboard View: 
              <span className={`px-3 py-1 font-bold rounded-lg text-white ${role === 'ADMIN' ? 'bg-indigo-500' : role === 'TECHNICIAN' ? 'bg-amber-500' : 'bg-blue-500'}`}>
                {role}
              </span>
            </span>
            <button onClick={handleLogout} className="bg-white/10 hover:bg-white/20 px-4 py-1.5 rounded-lg text-white font-bold transition-colors">
              Switch Role View
            </button>
        </div>
      )}
      <Routes>
        <Route path="/" element={<TicketsRoleSelector onSelect={handleRoleSelect} />} />
        <Route path="/dashboard" element={<TicketsList role={role} />} />
        <Route path="/:id" element={<TicketDetails role={role} />} />
      </Routes>
    </div>
  );
};

export default TicketsMain;
