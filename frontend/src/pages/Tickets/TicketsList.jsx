import React, { useState, useEffect } from 'react';
import api from '../../utils/axiosConfig';
import { Plus, Search, Filter, Wrench, Clock, CheckCircle2, XCircle, AlertTriangle, Edit3, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import CreateTicketModal from '../../components/Tickets/CreateTicketModal';
import EditTicketModal from '../../components/Tickets/EditTicketModal';

const StatusBadge = ({ status }) => {
  const styles = {
    OPEN: 'bg-emerald-100 text-emerald-700',
    IN_PROGRESS: 'bg-amber-100 text-amber-700',
    RESOLVED: 'bg-blue-100 text-blue-700',
    CLOSED: 'bg-slate-100 text-slate-700',
    REJECTED: 'bg-red-100 text-red-700'
  };
  
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${styles[status] || styles.OPEN}`}>
      {status.replace('_', ' ')}
    </span>
  );
};

const PriorityIcon = ({ priority }) => {
  switch (priority) {
    case 'CRITICAL': return <AlertTriangle className="w-4 h-4 text-red-500" />;
    case 'HIGH': return <AlertTriangle className="w-4 h-4 text-orange-500" />;
    case 'MEDIUM': return <AlertTriangle className="w-4 h-4 text-amber-500" />;
    default: return <AlertTriangle className="w-4 h-4 text-emerald-500" />;
  }
};

const TicketsList = ({ role }) => {
  const { user } = useAuth();
  const activeRole = role || 'USER';
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL'); // ALL, MY
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      let endpoint = '/api/tickets';
      if (activeRole === 'USER' || activeRole === 'STUDENT') {
        endpoint = '/api/tickets/my';
      } else if (activeRole === 'TECHNICIAN') {
        endpoint = '/api/tickets/assigned';
      } else if (filter === 'MY') {
        endpoint = '/api/tickets/my';
      }
      
      const res = await api.get(endpoint);
      setTickets(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this ticket?')) return;
    try {
      await api.delete(`/api/tickets/${id}`);
      fetchTickets();
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting ticket');
    }
  };

  const handleEdit = (e, ticket) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedTicket(ticket);
    setIsEditModalOpen(true);
  };

  const isOwner = (ticket) => {
    if (!user || !ticket) return false;

    // Admins can manage all tickets
    if (user.role === 'ADMIN') return true;

    // If fetching their own tickets, they are the owner
    if (activeRole === 'USER' || activeRole === 'STUDENT' || filter === 'MY') {
      return true;
    }
    
    const userIdMatch = user.id && ticket.createdById && String(user.id) === String(ticket.createdById);
    const userNameMatch = user.name && ticket.createdBy && user.name.trim().toLowerCase() === ticket.createdBy.trim().toLowerCase();
    const userEmailMatch = user.email && ticket.createdBy && user.email.trim().toLowerCase() === ticket.createdBy.trim().toLowerCase();
    
    return userIdMatch || userNameMatch || userEmailMatch;
  };

  useEffect(() => {
    fetchTickets();
  }, [filter]);

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <Wrench className="w-8 h-8 text-indigo-600" /> Maintenance Hub
          </h1>
          <p className="text-slate-500 font-medium mt-2">Manage incidents and report issues across campus.</p>
        </div>
        {activeRole !== 'TECHNICIAN' && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-indigo-600/20 transition-all hover:-translate-y-1"
          >
            <Plus className="w-5 h-5" /> Report Issue
          </button>
        )}
      </header>

      <div className="flex items-center justify-between">
        {activeRole === 'ADMIN' ? (
          <div className="flex gap-2 p-1 bg-slate-200/50 rounded-xl max-w-sm w-full md:w-auto">
            <button 
              onClick={() => setFilter('ALL')}
              className={`flex-1 md:flex-none px-6 py-2 text-sm font-bold rounded-lg transition-colors ${filter === 'ALL' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              All Tickets
            </button>
            <button 
               onClick={() => setFilter('MY')}
               className={`flex-1 md:flex-none px-6 py-2 text-sm font-bold rounded-lg transition-colors ${filter === 'MY' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              My Reports
            </button>
          </div>
        ) : (
          <div className="flex gap-2 p-1 bg-slate-200/50 rounded-xl max-w-sm w-full md:w-auto">
             <div className="px-6 py-2 text-sm font-bold rounded-lg bg-white text-indigo-600 shadow-sm">
                {activeRole === 'TECHNICIAN' ? 'My Assigned Tickets' : 'My Reports'}
             </div>
          </div>
        )}
        
        <div className="hidden md:flex relative w-64">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search tickets..." 
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-medium transition-all"
          />
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center">
             <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
          </div>
        ) : tickets.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-20 h-20 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
               <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-slate-800">No tickets found</h3>
            <p className="text-slate-500 mt-2 font-medium max-w-md mx-auto">Everything is running smoothly! You haven't reported any issues yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-widest">
                  <th className="p-5 font-bold">Ticket ID</th>
                  <th className="p-5 font-bold">Details</th>
                  <th className="p-5 font-bold hidden md:table-cell">Location / Resource</th>
                  <th className="p-5 font-bold">Status</th>
                  <th className="p-5 font-bold hidden sm:table-cell">Date Raised</th>
                  <th className="p-5 font-bold text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tickets.map(ticket => (
                  <tr key={ticket.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="p-5">
                      <Link to={`/tickets/${ticket.id}`} className="font-bold text-indigo-600 hover:text-indigo-800 transition-colors">
                        {ticket.ticketCode}
                      </Link>
                    </td>
                    <td className="p-5">
                      <p className="font-bold text-slate-900 group-hover:text-indigo-700 transition-colors">{ticket.title}</p>
                      <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 font-medium">
                        <PriorityIcon priority={ticket.priority} />
                        <span className="capitalize">{ticket.priority.toLowerCase()} Priority</span>
                        <span>•</span>
                        <span className="capitalize">{ticket.category.toLowerCase().replace('_', ' ')}</span>
                      </div>
                    </td>
                    <td className="p-5 hidden md:table-cell">
                      <div className="font-medium text-slate-800">{ticket.location}</div>
                      {ticket.resourceName && (
                        <div className="text-xs text-slate-500 mt-1">{ticket.resourceName}</div>
                      )}
                    </td>
                    <td className="p-5">
                      <StatusBadge status={ticket.status} />
                    </td>
                    <td className="p-5 hidden sm:table-cell">
                      <div className="text-sm font-medium text-slate-600 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-slate-400" />
                        {new Date(ticket.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="p-5">
                      <div className="flex items-center justify-center gap-2">
                        {isOwner(ticket) && (
                          <>
                            <button 
                              onClick={(e) => handleEdit(e, ticket)}
                              className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                              title="Edit"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={(e) => handleDelete(e, ticket.id)}
                              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        {!isOwner(ticket) && (
                          <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Locked</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <CreateTicketModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchTickets}
      />
      
      <EditTicketModal 
        isOpen={isEditModalOpen}
        onClose={() => { setIsEditModalOpen(false); setSelectedTicket(null); }}
        onSuccess={fetchTickets}
        ticket={selectedTicket}
      />
    </div>
  );
};

export default TicketsList;
