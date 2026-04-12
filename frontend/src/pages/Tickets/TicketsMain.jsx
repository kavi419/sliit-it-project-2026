import React from 'react';
import { Routes, Route } from 'react-router-dom';
import TicketsList from './TicketsList';
import TicketDetails from './TicketDetails';

const TicketsMain = () => {
  return (
    <Routes>
      <Route path="/" element={<TicketsList />} />
      <Route path="/:id" element={<TicketDetails />} />
    </Routes>
  );
};

export default TicketsMain;
