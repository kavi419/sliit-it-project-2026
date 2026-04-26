import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import TicketsList from './TicketsList';
import TicketDetails from './TicketDetails';
import TechnicianDashboard from './TechnicianDashboard';
import { useAuth } from '../../context/AuthContext';

const TicketsMain = () => {
  const { user } = useAuth();
  const role = user?.role || 'STUDENT';

  return (
    <div>
      <Routes>
        <Route path="/" element={<Navigate to="/tickets/dashboard" replace />} />
        <Route path="/dashboard" element={role === 'TECHNICIAN' ? <TechnicianDashboard /> : <TicketsList role={role} />} />
        <Route path="/:id" element={<TicketDetails role={role} />} />
      </Routes>
    </div>
  );
};

export default TicketsMain;
