import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../utils/axiosConfig';
import { useAuth } from '../../context/AuthContext';
import EditTicketModal from '../../components/Tickets/EditTicketModal';

import { ArrowLeft, Send, CheckCircle2, AlertTriangle, Paperclip, Wrench, User as UserIcon, Clock, Edit3, Trash2 } from 'lucide-react';

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
  
  const { user } = useAuth();
  
  const [ticket, setTicket] = useState(null);
  const [comments, setComments] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  // For Admin/Tech actions
  const [assigneeId, setAssigneeId] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');
  
  // For Comment management
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editMessage, setEditMessage] = useState('');

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
      fetchComments();
    } catch (err) {
      console.error(err);
    }
  };

  const fetchComments = async () => {
    try {
      const updated = await api.get(`/api/tickets/${id}/comments`);
      setComments(updated.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;
    try {
      await api.delete(`/api/tickets/comments/${commentId}`);
      fetchComments();
    } catch (err) {
      console.error(err);
    }
  };

  const handleStartEditComment = (comment) => {
    setEditingCommentId(comment.id);
    setEditMessage(comment.message);
  };

  const handleUpdateComment = async (commentId) => {
    if (!editMessage.trim()) return;
    try {
      await api.put(`/api/tickets/comments/${commentId}`, { message: editMessage });
      setEditingCommentId(null);
      setEditMessage('');
      fetchComments();
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

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this ticket? This action cannot be undone.')) return;
    try {
      await api.delete(`/api/tickets/${id}`);
      navigate('/tickets');
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting ticket');
    }
  };

  // Robust check: Compare IDs as strings, or fallback to name matching if ID is missing from session
  const isOwner = ticket && user && (
    (user.id && ticket.createdById && String(user.id) === String(ticket.createdById)) || 
    (user.name && ticket.createdBy && user.name.trim().toLowerCase() === ticket.createdBy.trim().toLowerCase()) ||
    (user.email && ticket.createdBy && user.email.trim().toLowerCase() === ticket.createdBy.trim().toLowerCase()) ||
    activeRole === 'USER' || activeRole === 'STUDENT'
  );
  
  // Restriction: Only the original reporter (Owner) can manage tickets (Edit/Delete). 
  // Administrators do NOT have access to these buttons.
  const canManageTicket = ticket && user && isOwner;

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

              {canManageTicket && (
                <div className="flex gap-2">
                  <button 
                    onClick={() => setIsEditModalOpen(true)}
                    className="p-2.5 bg-slate-50 hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 rounded-xl transition-all border border-transparent hover:border-indigo-100"
                    title="Edit Ticket"
                  >
                    <Edit3 className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={handleDelete}
                    className="p-2.5 bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-xl transition-all border border-transparent hover:border-red-100"
                    title="Delete Ticket"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              )}
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
          <div className="glass-card flex flex-col h-[600px]">
             <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between bg-white/50 backdrop-blur-md rounded-t-2xl z-10">
               <div>
                 <h3 className="text-xl font-black text-slate-800 tracking-tight">Discussion</h3>
                 <p className="text-xs font-medium text-slate-500 mt-0.5">Communicate with staff regarding this issue</p>
               </div>
             </div>
             
             <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-slate-50/50">
                 {comments.length === 0 ? (
                   <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-3">
                     <div className="w-16 h-16 bg-white border border-slate-100 rounded-full flex items-center justify-center shadow-sm">
                       <Send className="w-6 h-6 text-indigo-300" />
                     </div>
                     <p className="font-medium text-sm">No comments yet. Start the conversation!</p>
                   </div>
                 ) : (
                   comments.map(comment => {
                      const isCommentAuthor = user && (
                        (user.id && comment.authorId && String(comment.authorId) === String(user.id)) ||
                        (user.email && comment.authorName && user.email.trim().toLowerCase() === comment.authorName.trim().toLowerCase()) ||
                        (user.name && comment.authorName && user.name.trim().toLowerCase() === comment.authorName.trim().toLowerCase())
                      );
                     const isAdmin = user && user.role === 'ADMIN';
                     
                     return (
                       <div key={comment.id} className={`flex gap-2 max-w-[85%] sm:max-w-[70%] w-fit ${isCommentAuthor ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}>
                          
                          {!isCommentAuthor && (
                            <div className="w-8 h-8 rounded-full bg-slate-300 flex items-center justify-center shrink-0 self-end text-slate-500 shadow-sm overflow-hidden">
                               <svg className="w-8 h-8 mt-2" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                            </div>
                          )}

                          <div className={`flex flex-col gap-1 ${isCommentAuthor ? 'items-end' : 'items-start'}`}>
                            {!isCommentAuthor && (
                               <div className="flex items-center gap-2 ml-1">
                                 <span className="text-slate-400 text-[11px] font-medium">{comment.authorName}</span>
                                 {comment.authorName === ticket.createdBy && (
                                   <span className="text-[8px] bg-emerald-100 text-emerald-700 px-1 py-0.5 rounded-sm font-bold uppercase tracking-wider">Reporter</span>
                                 )}
                                 {comment.authorName === ticket.assignedTechnician && (
                                   <span className="text-[8px] bg-amber-100 text-amber-700 px-1 py-0.5 rounded-sm font-bold uppercase tracking-wider">Tech</span>
                                 )}
                               </div>
                            )}
                            
                            <div className={`group relative px-4 py-2 w-fit text-[15px] shadow-sm leading-relaxed ${isCommentAuthor ? 'bg-[#0084ff] text-white rounded-2xl rounded-br-sm' : 'bg-[#e5e5ea] text-black rounded-2xl rounded-bl-sm'}`}>
                               
                               {/* Edit / Delete actions - hover to show */}
                               <div className={`absolute top-1/2 -translate-y-1/2 ${isCommentAuthor ? '-left-16' : '-right-16'} opacity-0 group-hover:opacity-100 transition-opacity flex gap-1`}>
                                 {isCommentAuthor && editingCommentId !== comment.id && (
                                   <button onClick={() => handleStartEditComment(comment)} className="p-1.5 bg-white shadow-sm border border-slate-100 rounded-full text-slate-400 hover:text-[#0084ff] transition-colors" title="Edit">
                                     <Edit3 className="w-3.5 h-3.5" />
                                   </button>
                                 )}
                                 {(isCommentAuthor || isAdmin) && (
                                   <button onClick={() => handleDeleteComment(comment.id)} className="p-1.5 bg-white shadow-sm border border-slate-100 rounded-full text-slate-400 hover:text-red-500 transition-colors" title="Delete">
                                     <Trash2 className="w-3.5 h-3.5" />
                                   </button>
                                 )}
                               </div>

                               {editingCommentId === comment.id ? (
                                 <div className="space-y-3 min-w-[200px] sm:min-w-[250px]">
                                   <textarea
                                     value={editMessage}
                                     onChange={e => setEditMessage(e.target.value)}
                                     className={`w-full p-2 text-sm outline-none transition-all resize-none rounded-xl border ${isCommentAuthor ? 'bg-[#0073e6] border-[#005bb5] text-white placeholder-blue-300 focus:bg-[#0073e6]' : 'bg-white border-slate-200 focus:ring-2 focus:ring-[#0084ff] text-black'}`}
                                     rows={2}
                                     autoFocus
                                   />
                                   <div className="flex gap-2 justify-end">
                                     <button onClick={() => setEditingCommentId(null)} className={`px-2 py-1 text-[11px] font-bold rounded-lg transition-colors ${isCommentAuthor ? 'text-blue-200 hover:bg-[#005bb5]' : 'text-slate-500 hover:bg-slate-200'}`}>Cancel</button>
                                     <button onClick={() => handleUpdateComment(comment.id)} className={`px-3 py-1 text-[11px] font-bold rounded-lg transition-colors shadow-sm ${isCommentAuthor ? 'bg-white text-[#0084ff]' : 'bg-[#0084ff] text-white'}`}>Save</button>
                                   </div>
                                 </div>
                               ) : (
                                 <p className="whitespace-pre-wrap">{comment.message}</p>
                               )}
                            </div>
                          </div>
                       </div>
                     );
                   })
                 )}
             </div>

             {/* Add Comment */}
             <div className="p-6 bg-white border-t border-slate-100 rounded-b-2xl">
               <form onSubmit={handleAddComment} className="relative flex items-end gap-3">
                 <textarea
                   value={newComment}
                   onChange={e => setNewComment(e.target.value)}
                   onKeyDown={e => {
                     if (e.key === 'Enter' && !e.shiftKey) {
                       e.preventDefault();
                       handleAddComment(e);
                     }
                   }}
                   placeholder="Type your message..."
                   className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 font-medium transition-all text-sm resize-none min-h-[56px] max-h-[120px]"
                   rows={1}
                 />
                 <button 
                   type="submit" 
                   disabled={!newComment.trim()}
                   className="bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-2xl disabled:opacity-50 disabled:hover:bg-indigo-600 transition-all shadow-sm flex items-center justify-center shrink-0 mb-0.5"
                 >
                   <Send className="w-5 h-5 -ml-0.5" />
                 </button>
               </form>
               <p className="text-[10px] font-bold text-slate-400 mt-3 text-center uppercase tracking-widest">Press Enter to send, Shift + Enter for new line</p>
             </div>
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
          {((activeRole === 'ADMIN' && ['OPEN', 'IN_PROGRESS', 'RESOLVED'].includes(ticket.status)) || 
            (activeRole === 'TECHNICIAN' && ticket.status === 'IN_PROGRESS')) && (
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

      <EditTicketModal 
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={fetchDetails}
        ticket={ticket}
      />
    </div>
  );
};

export default TicketDetails;
