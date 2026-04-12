import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../utils/axiosConfig';

import { ArrowLeft, Send, CheckCircle2, AlertTriangle, Paperclip, Wrench, User as UserIcon, Clock } from 'lucide-react';

const StatusBadge = ({ status }) => {
  const styles = {
    OPEN: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    IN_PROGRESS: 'bg-amber-100 text-amber-700 border-amber-200',
    RESOLVED: 'bg-blue-100 text-blue-700 border-blue-200',
    CLOSED: 'bg-slate-100 text-slate-700 border-slate-200',
    REJECTED: 'bg-red-100 text-red-700 border-red-200'
  };
  return (
    <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border ${styles[status]}`}>
      {status?.replace('_', ' ')}
    </span>
  );
};

const TicketDetails = ({ role }) => {
  const activeRole = role || 'USER';
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [ticket, setTicket] = useState(null);
  const [comments, setComments] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  
  // For Admin/Tech actions
  const [assigneeId, setAssigneeId] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const [ticketRes, commentsRes, attachmentsRes, techRes] = await Promise.all([
        api.get(`/api/tickets/${id}`),
        api.get(`/api/tickets/${id}/comments`),
        api.get(`/api/tickets/${id}/attachments`),
        api.get('/api/tickets/technicians').catch(() => ({ data: [] }))
      ]);
      
      setTicket(ticketRes.data);
      setComments(commentsRes.data);
      setAttachments(attachmentsRes.data);
      setTechnicians(techRes.data);
      setAssigneeId(ticketRes.data.assignedTechnicianId || '');
      setResolutionNotes(ticketRes.data.resolutionNotes || '');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      await api.post(`/api/tickets/${id}/comments`, { message: newComment });
      setNewComment('');
      // Refresh comments
      const updated = await api.get(`/api/tickets/${id}/comments`);
      setComments(updated.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAssign = async () => {
    try {
      await api.patch(`/api/tickets/${id}/assign`, { technicianId: assigneeId });
      fetchDetails();
    } catch (err) {
      console.error(err);
    }
  };

  const handleResolve = async () => {
    try {
      await api.patch(`/api/tickets/${id}/resolve`, { resolutionNotes });
      fetchDetails();
    } catch (err) {
      console.error(err);
    }
  };

  const handleClose = async () => {
    try {
        await api.patch(`/api/tickets/${id}/status`, { status: 'CLOSED' });
        fetchDetails();
    } catch (err) {
        console.error(err);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!ticket) return <div className="text-center p-10 font-bold text-red-500">Ticket not found</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <button onClick={() => navigate('/tickets')} className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-bold transition-colors">
        <ArrowLeft className="w-5 h-5" /> Back to My Tickets
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-8">
          
          <div className="glass-card p-8">
            <div className="flex items-start justify-between mb-6 border-b border-slate-100 pb-6">
              <div>
                <div className="flex items-center gap-4 mb-3">
                  <span className="text-sm font-black text-indigo-400 font-mono bg-indigo-50 px-3 py-1 rounded-lg">{ticket.ticketCode}</span>
                  <StatusBadge status={ticket.status} />
                </div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">{ticket.title}</h1>
              </div>
            </div>

            <div className="prose max-w-none text-slate-600 font-medium leading-relaxed">
              <p>{ticket.description}</p>
            </div>

            {attachments.length > 0 && (
              <div className="mt-8 pt-8 border-t border-slate-100">
                <h3 className="text-lg font-bold text-slate-800 tracking-tight mb-4 flex items-center gap-2">
                   <Paperclip className="w-5 h-5 text-slate-400" /> Attachments
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {attachments.map(att => (
                    <a key={att.id} href={att.url} target="_blank" rel="noreferrer" className="block relative group rounded-xl overflow-hidden border border-slate-200 bg-slate-50 aspect-video flex-col items-center justify-center">
                       {att.contentType?.startsWith('image') ? (
                          <img src={att.url} alt={att.fileName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                       ) : (
                          <div className="p-4 flex items-center justify-center h-full">
                            <span className="font-bold text-sm text-slate-600 truncate">{att.fileName}</span>
                          </div>
                       )}
                       <div className="absolute inset-0 bg-indigo-900/0 group-hover:bg-indigo-900/10 transition-colors duration-300" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Comments Section */}
          <div className="glass-card p-8">
             <h3 className="text-xl font-black text-slate-800 tracking-tight mb-6">Discussion</h3>
             
             <div className="space-y-6 mb-8 max-h-[500px] overflow-y-auto pr-4">
                {comments.length === 0 ? (
                  <p className="text-slate-400 font-medium text-center py-6">No comments yet. Start the conversation!</p>
                ) : (
                  comments.map(comment => (
                    <div key={comment.id} className="flex gap-4">
                       <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold shrink-0">
                          {comment.authorName?.charAt(0)}
                       </div>
                       <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl rounded-tl-none w-full shadow-sm">
                          <div className="flex items-center justify-between mb-2">
                             <div className="flex items-center gap-2">
                               <span className="font-bold text-slate-800 text-sm">{comment.authorName}</span>
                               {comment.authorName === ticket.createdBy && (
                                 <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Reporter</span>
                               )}
                               {comment.authorName === ticket.assignedTechnician && (
                                 <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Technician</span>
                               )}
                             </div>
                             <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                                <Clock className="w-3 h-3" /> {new Date(comment.createdAt).toLocaleString()}
                             </span>
                          </div>
                          <p className="text-slate-600 text-sm whitespace-pre-wrap">{comment.message}</p>
                       </div>
                    </div>
                  ))
                )}
             </div>

             {/* Add Comment */}
             <form onSubmit={handleAddComment} className="flex gap-3">
               <input
                 type="text"
                 value={newComment}
                 onChange={e => setNewComment(e.target.value)}
                 placeholder="Type your comment..."
                 className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-5 py-3 outline-none focus:ring-2 focus:ring-indigo-500 font-medium transition-all text-sm"
               />
               <button 
                 type="submit" 
                 disabled={!newComment.trim()}
                 className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-xl disabled:opacity-50 transition-colors flex items-center justify-center"
               >
                 <Send className="w-5 h-5" />
               </button>
             </form>
          </div>
        </div>

        {/* Sidebar Information */}
        <div className="space-y-6">
          <div className="glass-card p-6 border-t-4 border-t-indigo-500">
            <h3 className="text-lg font-black text-slate-800 tracking-tight mb-6 mt-2">Ticket Details</h3>
            
            <div className="space-y-5">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Reporter</p>
                <div className="flex items-center gap-2 font-medium text-slate-800">
                   <UserIcon className="w-4 h-4 text-slate-400" /> {ticket.createdBy}
                </div>
              </div>
              
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Category</p>
                <div className="font-medium text-slate-800">{ticket.category}</div>
              </div>

              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Priority</p>
                <div className="font-medium text-slate-800 flex items-center gap-2">
                   <AlertTriangle className={`w-4 h-4 ${ticket.priority === 'HIGH' || ticket.priority === 'CRITICAL' ? 'text-red-500' : 'text-amber-500'}`} />
                   {ticket.priority}
                </div>
              </div>
              
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Location & Resource</p>
                <div className="font-medium text-slate-800">{ticket.location}</div>
                {ticket.resourceName && <div className="text-sm text-slate-500 mt-1">{ticket.resourceName}</div>}
              </div>

              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Contact Details</p>
                <div className="font-medium text-slate-800">{ticket.preferredContact || 'Not provided'}</div>
              </div>
            </div>
          </div>

          {/* Admin / Staff Actions block */}
          {activeRole !== 'USER' && (
            <div className="glass-card p-6 border-t-4 border-t-amber-400">
              <h3 className="text-lg font-black text-slate-800 tracking-tight mb-4 mt-2">Staff Controls</h3>
              
              <div className="space-y-6">
                {activeRole === 'ADMIN' && (ticket.status === 'OPEN' || ticket.status === 'IN_PROGRESS') && (
                 <div className="space-y-3">
                   <p className="text-xs font-bold text-slate-500">Assign Technician</p>
                   <div className="flex gap-2">
                     <select 
                       value={assigneeId} 
                       onChange={(e) => setAssigneeId(e.target.value)}
                       className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium outline-none"
                     >
                       <option value="">Select Technician...</option>
                       {technicians.map(t => (
                         <option key={t.id} value={t.id}>{t.name}</option>
                       ))}
                     </select>
                     <button 
                       onClick={handleAssign}
                       disabled={!assigneeId}
                       className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors disabled:opacity-50"
                     >
                       Assign
                     </button>
                   </div>
                   {ticket.assignedTechnician && (
                     <div className="text-xs font-medium text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-100 flex items-center gap-2">
                       <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                       Currently assigned to: <span className="font-bold text-slate-700">{ticket.assignedTechnician}</span>
                     </div>
                   )}
                 </div>
               )}

               {activeRole === 'TECHNICIAN' && ticket.status === 'IN_PROGRESS' && (
                 <div className="space-y-3 pt-4 border-t border-slate-100">
                   <p className="text-xs font-bold text-slate-500">Resolve Issue</p>
                   <textarea
                     value={resolutionNotes}
                     onChange={(e) => setResolutionNotes(e.target.value)}
                     className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-amber-400 transition-all resize-none"
                     placeholder="Detailed resolution notes..."
                     rows={3}
                   />
                   <button 
                     onClick={handleResolve}
                     disabled={!resolutionNotes.trim()}
                     className="w-full bg-amber-500 hover:bg-amber-600 text-white py-2.5 rounded-xl font-bold transition-colors disabled:opacity-50"
                   >
                     Mark as Resolved
                   </button>
                 </div>
               )}

               {activeRole === 'ADMIN' && ticket.status === 'RESOLVED' && (
                   <div className="space-y-3 pt-4 border-t border-slate-100">
                       <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl mb-4">
                           <p className="text-xs font-bold text-blue-800 mb-1">Resolution Notes</p>
                           <p className="text-sm text-blue-900/80">{ticket.resolutionNotes}</p>
                       </div>
                       <button 
                         onClick={handleClose}
                         className="w-full bg-slate-800 hover:bg-slate-900 text-white py-2.5 rounded-xl font-bold transition-colors"
                       >
                         Confirm & Close Ticket
                       </button>
                   </div>
               )}
             </div>
          </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TicketDetails;
