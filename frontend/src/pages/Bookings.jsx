import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, MapPin, CheckCircle, Clock3, Trash2, Edit2, X, Loader2, Users, Info, Check, Ban, Filter } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import BookingModal from '../components/BookingModal';

const Bookings = () => {
    const { user } = useAuth();
    const isAdmin = user?.role === 'ADMIN';

    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('');
    
    // Edit Modal state
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);

    // Admin Reject/Approve modal state
    const [actionModal, setActionModal] = useState({ isOpen: false, booking: null, type: '', reason: '' });
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        fetchBookings();
    }, [filterStatus, isAdmin]);

    const fetchBookings = async () => {
        setLoading(true);
        try {
            const url = isAdmin 
                ? `/api/bookings${filterStatus ? `?status=${filterStatus}` : ''}`
                : '/api/bookings/my';
            const response = await axios.get(url, { withCredentials: true });
            setBookings(response.data);
        } catch (err) {
            console.error('Failed to fetch bookings:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async () => {
        if (!actionModal.booking) return;
        setActionLoading(true);
        try {
            const { booking, type, reason } = actionModal;
            const endpoint = `/api/bookings/${booking.id}/${type}`;
            await axios.post(endpoint, { reason }, { withCredentials: true });
            
            setActionModal({ isOpen: false, booking: null, type: '', reason: '' });
            fetchBookings();
        } catch (err) {
            alert('Action failed: ' + (err.response?.data || err.message));
        } finally {
            setActionLoading(false);
        }
    };

    const handleCancel = async (id) => {
        if (!window.confirm('Are you sure you want to cancel this booking?')) return;
        try {
            await axios.post(`/api/bookings/${id}/cancel`, {}, { withCredentials: true });
            fetchBookings();
        } catch (err) {
            alert('Failed to cancel booking');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this booking record permanently?')) return;
        try {
            await axios.delete(`/api/bookings/${id}`, { withCredentials: true });
            fetchBookings();
        } catch (err) {
            alert('Failed to delete booking');
        }
    };

    const handleEdit = (booking) => {
        setSelectedBooking(booking);
        setIsEditModalOpen(true);
    };

    if (loading && bookings.length === 0) {
        return (
            <div className="p-10 flex flex-col items-center justify-center min-h-[60vh]">
                <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
                <p className="text-slate-500 font-medium">Loading bookings...</p>
            </div>
        );
    }

    return (
        <div className="p-10 max-w-7xl mx-auto space-y-10">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">
                        {isAdmin ? 'Manage All Bookings' : 'My Bookings'}
                    </h1>
                    <p className="text-slate-500 mt-2 text-lg">
                        {isAdmin ? 'Review and manage all campus resource requests.' : 'View and manage your resource reservations.'}
                    </p>
                </div>

                {isAdmin && (
                    <div className="flex items-center gap-3 bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
                        <Filter className="w-4 h-4 text-slate-400 ml-2" />
                        <select 
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="bg-transparent border-none text-sm font-bold text-slate-700 focus:ring-0 outline-none pr-8 cursor-pointer"
                        >
                            <option value="">All Statuses</option>
                            <option value="PENDING">Pending</option>
                            <option value="APPROVED">Approved</option>
                            <option value="REJECTED">Rejected</option>
                            <option value="CANCELLED">Cancelled</option>
                        </select>
                    </div>
                )}
            </header>

            {bookings.length === 0 ? (
                <div className="bg-white rounded-3xl p-16 text-center shadow-sm border border-slate-100">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Calendar className="w-10 h-10 text-slate-300" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">No bookings found</h3>
                    <p className="text-slate-500 mt-2">There are no bookings matching your criteria.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {bookings.map((booking) => (
                        <motion.div
                            key={booking.id}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-3xl p-8 shadow-xl shadow-slate-200/40 border border-slate-100 hover:shadow-2xl transition-all group flex flex-col h-full"
                        >
                            <div className="flex items-start justify-between mb-6">
                                <div className="space-y-1">
                                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                                        {booking.resourceName}
                                    </h3>
                                    <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-wider">
                                        <MapPin className="w-3.5 h-3.5" />
                                        <span>Campus Hub</span>
                                    </div>
                                </div>
                                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${
                                    booking.status === 'APPROVED' ? 'bg-emerald-500 text-white' :
                                    booking.status === 'PENDING' ? 'bg-amber-500 text-white' :
                                    booking.status === 'REJECTED' ? 'bg-rose-500 text-white' :
                                    'bg-slate-400 text-white'
                                }`}>
                                    {booking.status}
                                </span>
                            </div>

                            <div className="space-y-3 pb-6 border-b border-slate-50 flex-grow">
                                <div className="p-3 bg-slate-50 rounded-2xl space-y-2">
                                    <div className="flex items-center gap-3 text-slate-600 text-sm font-bold">
                                        <Calendar className="w-4 h-4 text-indigo-500" />
                                        {new Date(booking.startTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </div>
                                    <div className="flex items-center gap-3 text-slate-600 text-sm font-bold">
                                        <Clock className="w-4 h-4 text-indigo-500" />
                                        {new Date(booking.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(booking.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>

                                <div className="flex items-start gap-3 mt-4">
                                    <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600">
                                        <Info className="w-4 h-4" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Purpose</p>
                                        <p className="text-sm text-slate-700 font-medium line-clamp-2">{booking.purpose}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600">
                                        <Users className="w-4 h-4" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Attendees</p>
                                        <p className="text-sm text-slate-700 font-bold">{booking.attendeesCount} pax</p>
                                    </div>
                                </div>

                                {isAdmin && (
                                    <div className="flex items-center gap-3 pt-2">
                                        <div className="p-2 bg-violet-50 rounded-xl text-violet-600">
                                            <CheckCircle className="w-4 h-4" />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Requested By</p>
                                            <p className="text-sm text-slate-700 font-bold">{booking.user?.email}</p>
                                        </div>
                                    </div>
                                )}

                                {booking.adminReason && (
                                    <div className="mt-2 p-3 bg-rose-50 border border-rose-100 rounded-xl">
                                        <p className="text-[10px] font-bold text-rose-400 uppercase tracking-widest mb-1">Feedback</p>
                                        <p className="text-xs text-rose-700 font-medium italic">"{booking.adminReason}"</p>
                                    </div>
                                )}
                            </div>

                            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                                <div className="flex flex-wrap items-center gap-2">
                                    {isAdmin && (
                                        <>
                                            {booking.status === 'PENDING' && (
                                                <>
                                                    <button 
                                                        onClick={() => setActionModal({ isOpen: true, booking, type: 'approve', reason: '' })}
                                                        className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-500 transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/20"
                                                    >
                                                        <Check className="w-3.5 h-3.5" /> Approve
                                                    </button>
                                                    <button 
                                                        onClick={() => setActionModal({ isOpen: true, booking, type: 'reject', reason: '' })}
                                                        className="px-4 py-2 bg-rose-600 text-white text-xs font-bold rounded-xl hover:bg-rose-500 transition-all flex items-center gap-2 shadow-lg shadow-rose-500/20"
                                                    >
                                                        <Ban className="w-3.5 h-3.5" /> Reject
                                                    </button>
                                                </>
                                            )}
                                            {booking.status !== 'CANCELLED' && (
                                                <button 
                                                    onClick={() => handleCancel(booking.id)}
                                                    className="px-4 py-2 bg-slate-800 text-white text-xs font-bold rounded-xl hover:bg-slate-700 transition-all flex items-center gap-2 shadow-md"
                                                >
                                                    <Ban className="w-3.5 h-3.5" /> Cancel
                                                </button>
                                            )}
                                            <button 
                                                onClick={() => handleDelete(booking.id)}
                                                className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                                                title="Delete permanently"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </>
                                    )}
                                    
                                    {!isAdmin && (
                                        <>
                                            {(booking.status === 'PENDING' || booking.status === 'APPROVED') && (
                                                <>
                                                    <button 
                                                        onClick={() => handleCancel(booking.id)}
                                                        className="px-4 py-2 bg-slate-100 text-slate-600 border border-slate-200 text-xs font-bold rounded-xl hover:bg-slate-200 transition-all flex items-center gap-2 shadow-sm"
                                                    >
                                                        <Ban className="w-3.5 h-3.5" /> Cancel
                                                    </button>
                                                    <button 
                                                        onClick={() => handleEdit(booking)}
                                                        className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-500 transition-all flex items-center gap-2 shadow-lg shadow-indigo-200"
                                                    >
                                                        <Edit2 className="w-3.5 h-3.5" /> Edit
                                                    </button>
                                                </>
                                            )}
                                            {(booking.status === 'CANCELLED' || booking.status === 'REJECTED') && (
                                                <button 
                                                    onClick={() => handleDelete(booking.id)}
                                                    className="px-4 py-2 bg-rose-50 text-rose-600 text-xs font-bold rounded-xl hover:bg-rose-100 transition-all flex items-center gap-2"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" /> Delete Record
                                                </button>
                                            )}
                                        </>
                                    )}
                                </div>

                                {(!isAdmin && booking.status === 'APPROVED') && (
                                    <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                                        <CheckCircle className="w-3.5 h-3.5" /> Confirmed
                                    </span>
                                )}

                                <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
                                    <Clock3 className="w-3 h-3" />
                                    {new Date(booking.createdAt).toLocaleDateString()}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Action Modal (Approve/Reject Reason) */}
            <AnimatePresence>
                {actionModal.isOpen && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setActionModal({ ...actionModal, isOpen: false })}
                            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[200]" />
                        
                        <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-3xl p-10 z-[201] shadow-2xl space-y-6"
                        >
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                                    {actionModal.type === 'approve' ? 'Approve Booking' : 'Reject Booking'}
                                </h3>
                                <p className="text-slate-500 text-sm mt-1 font-medium">
                                    Add a message or reason for the user (optional for approval).
                                </p>
                            </div>

                            <textarea 
                                value={actionModal.reason}
                                onChange={(e) => setActionModal({ ...actionModal, reason: e.target.value })}
                                placeholder={actionModal.type === 'reject' ? "Please provide a reason for rejection..." : "Add a comment (optional)..."}
                                className={`w-full h-32 p-4 rounded-2xl border-2 outline-none transition-all resize-none text-sm font-medium ${
                                    actionModal.type === 'approve' ? 'border-emerald-100 focus:border-emerald-500 bg-emerald-50/10' : 'border-rose-100 focus:border-rose-500 bg-rose-50/10'
                                }`}
                                required={actionModal.type === 'reject'}
                            />

                            <div className="flex gap-4">
                                <button onClick={() => setActionModal({ ...actionModal, isOpen: false })} className="flex-1 py-3.5 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-all">
                                    Cancel
                                </button>
                                <button 
                                    onClick={handleAction}
                                    disabled={actionLoading || (actionModal.type === 'reject' && !actionModal.reason.trim())}
                                    className={`flex-1 py-3.5 text-white font-bold rounded-2xl shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 ${
                                        actionModal.type === 'approve' ? 'bg-emerald-600 shadow-emerald-500/20 hover:bg-emerald-500' : 'bg-rose-600 shadow-rose-500/20 hover:bg-rose-500'
                                    }`}
                                >
                                    {actionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirm Action'}
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Edit Booking Modal */}
            <BookingModal
                isOpen={isEditModalOpen}
                onClose={() => { setIsEditModalOpen(false); setSelectedBooking(null); }}
                bookingToEdit={selectedBooking}
                onBookingSuccess={() => {
                    fetchBookings();
                }}
            />
        </div>
    );
};

export default Bookings;
