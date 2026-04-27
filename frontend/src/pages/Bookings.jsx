import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { Calendar, Clock, MapPin, CheckCircle, Clock3, Trash2, Edit2, X, Loader2, Users, Info, Check, Ban, Filter, Download, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import BookingModal from '../components/BookingModal';
import api from '../utils/axiosConfig';

const Bookings = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
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

    // Handle resourceId from URL
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const rid = params.get('resourceId');
        if (rid) {
            // Logic to open modal for new booking with pre-selected ID
            setIsEditModalOpen(true);
            setSelectedBooking({ resourceId: rid });
            // Clean URL
            navigate(location.pathname, { replace: true });
        }
    }, [location.search]);

    useEffect(() => {
        fetchBookings();
    }, [filterStatus, isAdmin]);

    const fetchBookings = async () => {
        setLoading(true);
        try {
            const url = isAdmin 
                ? `/api/bookings${filterStatus ? `?status=${filterStatus}` : ''}`
                : '/api/bookings/my';
            const response = await api.get(url);
            setBookings(response.data);
        } catch (err) {
            console.error('Failed to fetch bookings:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!loading && bookings.length > 0 && location.state?.action && location.state?.bookingId) {
            const booking = bookings.find(b => b.id === location.state.bookingId);
            if (booking && booking.status === 'PENDING') {
                setActionModal({ 
                    isOpen: true, 
                    booking, 
                    type: location.state.action, 
                    reason: '' 
                });
                // Clear state to avoid reopening on refresh
                window.history.replaceState({}, document.title);
            }
        }
    }, [bookings, loading, location.state]);

    const handleAction = async () => {
        if (!actionModal.booking) return;
        setActionLoading(true);
        try {
            const { booking, type, reason } = actionModal;
            const endpoint = `/api/bookings/${booking.id}/${type}`;
            await api.post(endpoint, { reason });
            
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
            await api.post(`/api/bookings/${id}/cancel`, {});
            fetchBookings();
        } catch (err) {
            alert('Failed to cancel booking');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this booking record permanently?')) return;
        try {
            await api.delete(`/api/bookings/${id}`);
            fetchBookings();
        } catch (err) {
            alert('Failed to delete booking');
        }
    };

    const handleEdit = (booking) => {
        setSelectedBooking(booking);
        setIsEditModalOpen(true);
    };

    const generatePass = (booking) => {
        const printWindow = window.open('', '_blank', 'width=800,height=900');
        
        const content = `
            <html>
                <head>
                    <title>Booking Pass - ${booking.resourceName}</title>
                    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap" rel="stylesheet">
                    <script src="https://cdn.tailwindcss.com"></script>
                    <style>
                        body { font-family: 'Inter', sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; }
                        @media print {
                            body { background-color: white; padding: 0; }
                            .no-print { display: none; }
                        }
                        .pass-card {
                            max-width: 450px;
                            margin: 20px auto;
                            background: white;
                            border-radius: 32px;
                            overflow: hidden;
                            box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.1);
                            border: 1px solid #e2e8f0;
                        }
                    </style>
                </head>
                <body>
                    <div class="pass-card">
                        <div class="bg-gradient-to-br from-indigo-600 to-violet-700 p-10 text-white text-center relative">
                            <div class="absolute top-0 right-0 p-8 opacity-10">
                                <svg class="w-24 h-24" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
                            </div>
                            <div class="inline-flex items-center gap-2 px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-6 border border-white/20">
                                Official Digital Pass
                            </div>
                            <h1 class="text-3xl font-black tracking-tight mb-2">Smart Campus Hub</h1>
                            <p class="text-indigo-100 text-[10px] font-bold uppercase tracking-[0.15em]">Resource Access Authorization</p>
                        </div>
                        
                        <div class="p-10 space-y-8">
                            <div class="text-center">
                                <p class="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2">Reserved Venue</p>
                                <h2 class="text-3xl font-black text-slate-900">${booking.resourceName}</h2>
                                <p class="text-sm text-slate-500 font-semibold mt-1">Main Campus Hub • University Zone</p>
                            </div>
                            
                            <div class="grid grid-cols-2 gap-8 py-6 border-y border-slate-100">
                                <div>
                                    <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Date</p>
                                    <p class="text-base font-black text-slate-800">${new Date(booking.startTime).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                                </div>
                                <div>
                                    <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Session Time</p>
                                    <p class="text-base font-black text-indigo-600">
                                        ${new Date(booking.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${new Date(booking.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>
                            
                            <div>
                                <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Authorized User</p>
                                <div class="flex items-center gap-3">
                                    <div class="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                                        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"/></svg>
                                    </div>
                                    <div>
                                        <p class="text-sm font-black text-slate-800">${booking.user?.fullName || 'Campus Student'}</p>
                                        <p class="text-[11px] text-slate-500 font-medium">${booking.userEmail || booking.user?.email}</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="bg-indigo-50/50 rounded-3xl p-6 border border-indigo-100/50 flex items-center justify-between">
                                <div>
                                    <p class="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1">Pass ID</p>
                                    <p class="text-lg font-mono font-black text-indigo-700">SCH-${booking.id.toString().substring(0, 8).toUpperCase()}</p>
                                </div>
                                <div class="w-16 h-16 bg-white p-1 rounded-xl border border-indigo-100 shadow-sm flex items-center justify-center overflow-hidden">
                                    <img 
                                        src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=SCH-VERIFY-${booking.id}-${encodeURIComponent(booking.resourceName)}" 
                                        alt="Verification QR"
                                        class="w-full h-full object-contain"
                                    />
                                </div>
                            </div>
                        </div>
                        
                        <div class="bg-slate-50 p-8 text-center">
                            <p class="text-[9px] text-slate-400 font-bold uppercase leading-loose tracking-widest">
                                Valid for single entry only • Non-transferable<br/>
                                Smart Campus Hub Management System 2026
                            </p>
                        </div>
                    </div>
                    
                    <div class="text-center no-print mt-8">
                        <button onclick="window.print()" class="px-10 py-4 bg-indigo-600 text-white text-sm font-black rounded-2xl shadow-2xl shadow-indigo-200 hover:bg-indigo-700 hover:scale-105 transition-all">
                            SAVE PASS AS PDF
                        </button>
                        <p class="text-slate-400 text-[10px] font-bold mt-4 uppercase tracking-widest">Select "Save as PDF" in the print destination</p>
                    </div>
                </body>
            </html>
        `;
        
        printWindow.document.write(content);
        printWindow.document.close();
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
                    <div className="flex items-center gap-4 mt-2">
                        <p className="text-slate-500 text-lg">
                            {isAdmin ? 'Review and manage all campus resource requests.' : 'View and manage your resource reservations.'}
                        </p>
                        {!isAdmin && (
                            <button 
                                onClick={() => { setSelectedBooking(null); setIsEditModalOpen(true); }}
                                className="px-5 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
                            >
                                + New Booking
                            </button>
                        )}
                    </div>
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
                                            {booking.status === 'PENDING' && (
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
                                            {booking.status === 'APPROVED' && (
                                                <button 
                                                    onClick={() => handleCancel(booking.id)}
                                                    className="px-4 py-2 bg-slate-100 text-slate-600 border border-slate-200 text-xs font-bold rounded-xl hover:bg-slate-200 transition-all flex items-center gap-2 shadow-sm"
                                                >
                                                    <Ban className="w-3.5 h-3.5" /> Cancel
                                                </button>
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

                                {(booking.status === 'APPROVED') && (
                                    <button 
                                        onClick={() => generatePass(booking)}
                                        className="px-4 py-2 bg-emerald-50 text-emerald-600 border border-emerald-100 text-xs font-bold rounded-xl hover:bg-emerald-600 hover:text-white transition-all flex items-center gap-2 shadow-sm"
                                    >
                                        <Download className="w-3.5 h-3.5" /> Download Pass
                                    </button>
                                )}

                                {(!isAdmin && booking.status === 'APPROVED') && (
                                    <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                                        <ShieldCheck className="w-3.5 h-3.5" /> Verified
                                    </span>
                                )}

                                <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
                                    <Clock3 className="w-3 h-3" />
                                    {booking.createdAt ? new Date(booking.createdAt).toLocaleDateString() : 'N/A'}
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
