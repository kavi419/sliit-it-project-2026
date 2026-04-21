import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, MapPin, CheckCircle, Clock3, Trash2, Edit2, X, Loader2 } from 'lucide-react';

const Bookings = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingBooking, setEditingBooking] = useState(null);
    const [editData, setEditData] = useState({ date: '', startTime: '', endTime: '' });
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/api/bookings/my', { withCredentials: true });
            setBookings(response.data);
        } catch (err) {
            console.error('Failed to fetch bookings:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to cancel this booking?')) return;
        
        try {
            await axios.delete(`/api/bookings/${id}`, { withCredentials: true });
            setBookings(bookings.filter(b => b.id !== id));
        } catch (err) {
            alert('Failed to delete booking');
        }
    };

    const startEdit = (booking) => {
        const startDate = new Date(booking.startTime);
        const endDate = new Date(booking.endTime);
        
        setEditingBooking(booking);
        setEditData({
            date: startDate.toISOString().split('T')[0],
            startTime: startDate.toTimeString().slice(0, 5),
            endTime: endDate.toTimeString().slice(0, 5)
        });
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setActionLoading(true);
        try {
            const payload = {
                startTime: `${editData.date}T${editData.startTime}:00`,
                endTime: `${editData.date}T${editData.endTime}:00`
            };
            await axios.put(`/api/bookings/${editingBooking.id}`, payload, { withCredentials: true });
            setEditingBooking(null);
            fetchBookings();
        } catch (err) {
            alert('Failed to update booking');
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="p-10 flex justify-center">
                <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="p-10 max-w-6xl mx-auto">
            <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">My Bookings</h1>
                    <p className="text-slate-500 mt-2 text-lg">Manage and view all your campus resource reservations.</p>
                </div>
            </header>

            {bookings.length === 0 ? (
                <div className="bg-white rounded-3xl p-16 text-center shadow-sm border border-slate-100">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Calendar className="w-10 h-10 text-slate-300" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">No bookings found</h3>
                    <p className="text-slate-500 mt-2">You haven't made any resource bookings yet.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {bookings.map((booking) => (
                        <motion.div
                            key={booking.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-3xl p-8 shadow-xl shadow-slate-200/50 border border-slate-100 hover:shadow-2xl transition-all group flex flex-col"
                        >
                            <div className="flex items-start justify-between mb-6">
                                <div className="space-y-1">
                                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                                        {booking.resourceName}
                                    </h3>
                                    <div className="flex items-center gap-2 text-slate-500 text-sm">
                                        <MapPin className="w-4 h-4" />
                                        <span>Campus Resource</span>
                                    </div>
                                </div>
                                <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                                    booking.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-600' :
                                    booking.status === 'PENDING' ? 'bg-amber-50 text-amber-600' :
                                    'bg-slate-50 text-slate-600'
                                }`}>
                                    {booking.status}
                                </span>
                            </div>

                            <div className="space-y-4 pt-6 border-t border-slate-50 flex-grow">
                                <div className="flex items-center gap-3 text-slate-600">
                                    <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                                        <Calendar className="w-4 h-4" />
                                    </div>
                                    <span className="font-medium">
                                        {new Date(booking.startTime).toLocaleDateString()}
                                    </span>
                                </div>

                                <div className="flex items-center gap-3 text-slate-600">
                                    <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                                        <Clock className="w-4 h-4" />
                                    </div>
                                    <span className="font-medium whitespace-nowrap">
                                        {new Date(booking.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        <span className="mx-2 text-slate-300">→</span>
                                        {new Date(booking.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </div>

                            <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <button 
                                        onClick={() => startEdit(booking)}
                                        className="p-2 hover:bg-slate-100 rounded-xl text-slate-600 transition-colors"
                                        title="Edit Booking"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(booking.id)}
                                        className="p-2 hover:bg-red-50 rounded-xl text-red-500 transition-colors"
                                        title="Delete Booking"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
                                    <Clock3 className="w-3 h-3" />
                                    <span>Added {new Date(booking.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Edit Modal */}
            <AnimatePresence>
                {editingBooking && (
                    <>
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setEditingBooking(null)}
                            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[150]" 
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg glass-card p-10 z-[151] shadow-2xl"
                        >
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h3 className="text-2xl font-bold text-slate-900">Edit Booking</h3>
                                    <p className="text-slate-500 text-sm mt-1">{editingBooking.resourceName}</p>
                                </div>
                                <button onClick={() => setEditingBooking(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                                    <X className="w-6 h-6 text-slate-400" />
                                </button>
                            </div>

                            <form onSubmit={handleUpdate} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Date</label>
                                    <input 
                                        type="date"
                                        required
                                        value={editData.date}
                                        onChange={(e) => setEditData({...editData, date: e.target.value})}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">Start Time</label>
                                        <input 
                                            type="time" 
                                            required
                                            value={editData.startTime}
                                            onChange={(e) => setEditData({...editData, startTime: e.target.value})}
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">End Time</label>
                                        <input 
                                            type="time" 
                                            required
                                            value={editData.endTime}
                                            onChange={(e) => setEditData({...editData, endTime: e.target.value})}
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                <button 
                                    type="submit" 
                                    disabled={actionLoading}
                                    className="w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl shadow-xl hover:bg-indigo-700 transition-all active:scale-95 flex items-center justify-center gap-3"
                                >
                                    {actionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Update Reservation'}
                                </button>
                            </form>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Bookings;
