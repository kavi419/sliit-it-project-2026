import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { User, Mail, Calendar, MapPin, ArrowRight, CheckCircle2, AlertCircle, Shield, Users, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import BookingModal from '../components/BookingModal';
import { useAuth } from '../context/AuthContext';

// Shared animation variant for staggered section reveal
const sectionVariant = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] } },
};

// ─── Resource Card ────────────────────────────────────────────────────────────
const ResourceCard = ({ title, status, image, onBook }) => (
  <motion.div
    variants={sectionVariant}
    className="glass-card overflow-hidden group hover:shadow-xl transition-all duration-500 hover:-translate-y-2"
  >
    <div className="h-44 w-full bg-slate-200 relative overflow-hidden">
      <div className="absolute inset-0 bg-indigo-600/10 group-hover:bg-indigo-600/0 transition-colors duration-500" />
      <img src={image} alt={title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
      <div className="absolute top-3 right-3">
        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold shadow-md flex items-center gap-1.5 ${
          status === 'Available' ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'
        }`}>
          {status === 'Available' ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
          {status}
        </span>
      </div>
    </div>
    <div className="p-5">
      <h3 className="text-base font-bold text-slate-800 tracking-tight">{title}</h3>
      <div className="flex items-center gap-3 mt-2 text-xs text-slate-500 font-medium">
        <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />Main Campus</span>
        <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" />20-50 Pax</span>
      </div>
      <button
        onClick={() => onBook(title)}
        className="w-full mt-4 py-2.5 bg-slate-50 border border-slate-200 text-indigo-600 text-sm font-bold rounded-xl
          hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all duration-300 shadow-sm"
      >
        Book Now
      </button>
    </div>
  </motion.div>
);

// ─── User Management Tab ──────────────────────────────────────────────────────
const UserManagementTab = () => {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [approvingId, setApprovingId]   = useState(null);
  const [toast, setToast]               = useState('');

  const fetchPending = () => {
    setLoadingUsers(true);
    axios.get('/api/admin/pending-users', { withCredentials: true })
      .then(res => setPendingUsers(res.data))
      .catch(() => setPendingUsers([]))
      .finally(() => setLoadingUsers(false));
  };

  useEffect(() => { fetchPending(); }, []);

  const handleApprove = async (id, email) => {
    setApprovingId(id);
    try {
      await axios.post(`/api/admin/approve/${id}`, {}, { withCredentials: true });
      setToast(`✅ ${email} approved as Admin!`);
      setPendingUsers(prev => prev.filter(u => u.id !== id));
      setTimeout(() => setToast(''), 4000);
    } catch {
      setToast('❌ Approval failed. Please try again.');
      setTimeout(() => setToast(''), 4000);
    } finally {
      setApprovingId(null);
    }
  };

  return (
    <section className="space-y-6">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="fixed top-6 right-6 z-50 bg-slate-900 text-white text-sm font-semibold px-5 py-3 rounded-2xl shadow-2xl"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center gap-3">
        <span className="p-2 bg-rose-600 text-white rounded-xl shadow-sm">
          <Users className="w-5 h-5" />
        </span>
        <div>
          <h3 className="text-2xl font-extrabold text-slate-800 tracking-tight">User Management</h3>
          <p className="text-sm text-slate-500 font-medium mt-0.5">Review and approve pending admin registrations</p>
        </div>
      </div>

      {loadingUsers ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
        </div>
      ) : pendingUsers.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
          <p className="text-xl font-bold text-slate-700">All clear!</p>
          <p className="text-slate-500 font-medium mt-1">No pending admin approvals at this time.</p>
        </div>
      ) : (
        <div className="glass-card divide-y divide-slate-100 overflow-hidden">
          {pendingUsers.map(u => (
            <motion.div
              key={u.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-6 flex items-center justify-between hover:bg-slate-50/50 transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-rose-100 flex items-center justify-center text-rose-600">
                  <Shield className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-bold text-slate-800">{u.name || u.email}</p>
                  <p className="text-sm text-slate-500 font-medium flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5" />{u.email}
                  </p>
                  <span className="mt-1 inline-block px-2 py-0.5 rounded-full bg-amber-100 text-amber-700
                    text-[10px] font-bold uppercase tracking-wider">
                    {u.status}
                  </span>
                </div>
              </div>

              <button
                id={`btn-approve-${u.id}`}
                onClick={() => handleApprove(u.id, u.email)}
                disabled={approvingId === u.id}
                className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500
                  text-white font-bold rounded-xl shadow-sm transition-all active:scale-95
                  disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {approvingId === u.id
                  ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <Check className="w-4 h-4" />
                }
                Approve
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </section>
  );
};

// ─── Dashboard ────────────────────────────────────────────────────────────────
const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedResource, setSelectedResource] = useState(null);
  const [isModalOpen, setIsModalOpen]         = useState(false);
  const [dateStr, setDateStr]                 = useState('');

  const displayName = user?.name || 'Campus User';
  const role        = user?.role || 'STUDENT';
  const isAdmin     = role === 'ADMIN';

  useEffect(() => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    setDateStr(new Date().toLocaleDateString('en-US', options));
  }, []);

  const resources = [
    { title: 'IoT Lab',        status: 'Available', image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=800' },
    { title: 'Study Room 01',  status: 'Available', image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800' },
    { title: 'Auditorium',     status: 'Occupied',  image: 'https://images.unsplash.com/photo-1505373633560-eb0a6f2a5100?auto=format&fit=crop&q=80&w=800' },
    { title: 'Library Zone B', status: 'Available', image: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&q=80&w=800' },
  ];

  const [recentBookings, setRecentBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(true);

  useEffect(() => {
    const fetchRecent = async () => {
      try {
        const url = isAdmin ? '/api/bookings' : '/api/bookings/my';
        const response = await axios.get(url, { withCredentials: true });
        setRecentBookings(response.data.slice(0, 3)); // Show top 3
      } catch (err) {
        console.error('Failed to fetch dashboard bookings:', err);
      } finally {
        setLoadingBookings(false);
      }
    };
    fetchRecent();
  }, [isAdmin]);

  const staggerContainer = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } }
  };

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* ── Header ── */}
      <motion.header variants={sectionVariant} className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold text-indigo-500 uppercase tracking-widest mb-1">Good morning ☀</p>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">
            Welcome back, {displayName.split(' ')[0]}!
          </h2>
          <p className="text-slate-500 mt-1.5 font-medium flex items-center gap-2 text-sm">
            <Calendar className="w-3.5 h-3.5 text-indigo-400" /> {dateStr}
          </p>
        </div>
        <div className="flex items-center gap-3 bg-white/70 border border-slate-200/80 p-2 pr-5 rounded-2xl shadow-sm">
          <div className={`h-11 w-11 rounded-xl flex items-center justify-center text-white text-sm font-black shadow-md
            ${isAdmin ? 'bg-gradient-to-br from-rose-500 to-pink-600 shadow-rose-500/30' : 'bg-gradient-to-br from-indigo-500 to-violet-600 shadow-indigo-500/30'}`}>
            {displayName[0]?.toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800">{displayName}</p>
            <p className={`text-[11px] font-bold uppercase tracking-widest ${isAdmin ? 'text-rose-600' : 'text-indigo-500'}`}>{role}</p>
          </div>
        </div>
      </motion.header>

      {/* ── Tab bar (admin only) ── */}
      {isAdmin && (
        <motion.div variants={sectionVariant} className="flex gap-1.5 bg-slate-100/80 p-1 rounded-2xl w-fit">
          {[{ id: 'overview', label: 'Overview' }, { id: 'users', label: '👥 User Management' }].map(tab => (
            <button
              key={tab.id}
              id={`tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2 font-semibold text-sm rounded-xl transition-all duration-200
                ${activeTab === tab.id
                  ? 'bg-white text-indigo-700 shadow-sm border border-slate-200/80'
                  : 'text-slate-500 hover:text-slate-700'}`}
            >
              {tab.label}
            </button>
          ))}
        </motion.div>
      )}

      {/* ── Tab Content ── */}
      <AnimatePresence mode="wait">
        {activeTab === 'overview' ? (
          <motion.div key="overview" className="space-y-12">

            {/* Admin or Student Panel */}
            {isAdmin ? (
              <motion.section variants={sectionVariant}
                className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-700 p-8 text-white shadow-xl shadow-indigo-500/20">
                {/* Grid pattern */}
                <div className="absolute inset-0 opacity-10"
                  style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
                <div className="relative">
                  <div className="flex items-center gap-3 mb-3">
                    <Shield className="w-5 h-5 text-indigo-200" />
                    <h3 className="text-xl font-extrabold tracking-tight">Admin Panel</h3>
                  </div>
                  <p className="text-indigo-200 font-medium text-sm mb-6 max-w-lg">
                    You have full administrative access to manage campus resources, approve pending users, and view system-wide booking activity.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <button onClick={() => navigate('/resources')} className="px-5 py-2.5 bg-white text-indigo-700 text-sm font-bold rounded-xl shadow-sm hover:bg-indigo-50 transition">Manage Resources</button>
                    <button onClick={() => navigate('/bookings')} className="px-5 py-2.5 bg-white/20 text-white border border-white/30 text-sm font-bold rounded-xl hover:bg-white/30 transition">View All Bookings</button>
                    <button
                      onClick={() => setActiveTab('users')}
                      className="px-5 py-2.5 bg-white/20 text-white border border-white/30 text-sm font-bold rounded-xl hover:bg-white/30 transition flex items-center gap-2">
                      <Users className="w-4 h-4" /> Manage Users
                    </button>
                  </div>
                </div>
              </motion.section>
            ) : (
              <motion.section variants={sectionVariant}
                className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 p-8 sm:p-10 text-white shadow-2xl shadow-indigo-500/25">
                {/* Grid pattern */}
                <div className="absolute inset-0 opacity-10"
                  style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
                
                {/* Glowing orbs */}
                <div className="absolute top-[-20%] right-[-10%] w-72 h-72 bg-white/20 rounded-full blur-[80px] pointer-events-none" />
                <div className="absolute bottom-[-20%] left-[-10%] w-64 h-64 bg-cyan-400/20 rounded-full blur-[80px] pointer-events-none" />

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                  <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[10px] font-bold uppercase tracking-widest mb-5 shadow-sm">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                      Live Campus Status
                    </div>
                    <h3 className="text-3xl md:text-4xl font-black tracking-tight leading-tight mb-3 drop-shadow-sm">
                      Ready for your next<br/>study session?
                    </h3>
                    <p className="text-indigo-100 font-medium text-sm max-w-sm leading-relaxed">
                      Book a room, lab, or auditorium instantly. Your perfect study space is just a click away.
                    </p>
                    <button 
                      onClick={() => navigate('/bookings')}
                      className="mt-6 px-6 py-3 bg-white text-indigo-700 text-sm font-bold rounded-xl shadow-lg shadow-indigo-900/20 hover:bg-indigo-50 hover:scale-105 transition-all duration-300"
                    >
                      View My Schedule
                    </button>
                  </div>
                  
                  {/* Stats Cards */}
                  <div className="grid grid-cols-2 gap-4 shrink-0">
                     <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 text-center w-full md:w-32 shadow-xl">
                        <p className="text-4xl font-black tracking-tight drop-shadow-md text-white">{recentBookings.length}</p>
                        <p className="text-indigo-200 text-[10px] font-bold uppercase tracking-widest mt-1.5">Active<br/>Bookings</p>
                     </div>
                     <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 text-center w-full md:w-32 shadow-xl">
                        <p className="text-4xl font-black tracking-tight drop-shadow-md text-white">12</p>
                        <p className="text-indigo-200 text-[10px] font-bold uppercase tracking-widest mt-1.5">Hours<br/>Logged</p>
                     </div>
                  </div>
                </div>
              </motion.section>
            )}

            {/* Resources */}
            <motion.section variants={sectionVariant}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-extrabold text-slate-800 tracking-tight">Available Resources</h3>
                <div className="flex gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-200" />
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-400" />
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {resources.map((res, idx) => (
                  <ResourceCard key={idx} {...res} onBook={(name) => { setSelectedResource(name); setIsModalOpen(true); }} />
                ))}
              </div>
            </motion.section>

            {/* Bookings + Activity */}
            <motion.section variants={sectionVariant} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-extrabold text-slate-800 tracking-tight">
                    {isAdmin ? 'All Recent Bookings' : 'Your Recent Bookings'}
                  </h3>
                  <button 
                    onClick={() => navigate('/bookings')}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-500 transition-colors"
                  >
                    View All
                  </button>
                </div>
                
                <div className="glass-card divide-y divide-slate-100 overflow-hidden">
                  {loadingBookings ? (
                    <div className="p-10 flex justify-center">
                      <div className="w-6 h-6 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                    </div>
                  ) : recentBookings.length === 0 ? (
                    <div className="p-12 text-center text-slate-400 font-medium">
                      No recent bookings found.
                    </div>
                  ) : (
                    recentBookings.map((booking) => (
                      <div 
                        key={booking.id} 
                        onClick={() => navigate('/bookings')}
                        className="p-6 flex items-center justify-between hover:bg-slate-50/50 transition-all cursor-pointer group"
                      >
                        <div className="flex items-center gap-5">
                          <div className="h-12 w-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
                            <Calendar className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 tracking-tight">{booking.resourceName}</p>
                            <p className="text-slate-400 font-medium mt-0.5 text-sm">
                              {new Date(booking.startTime).toLocaleDateString()} • {new Date(booking.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                            booking.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' :
                            booking.status === 'PENDING' ? 'bg-amber-100 text-amber-700' :
                            'bg-slate-100 text-slate-600'
                          }`}>
                            {booking.status}
                          </span>
                          <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-xl font-extrabold text-slate-800 tracking-tight mb-4">Activity Feed</h3>
                <div className="glass-card p-2 space-y-1.5">
                  <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-100">
                    <p className="text-sm font-bold text-indigo-900">System Maintenance</p>
                    <p className="text-xs text-indigo-700 mt-1 font-medium">Library Zone B closed for maintenance Sunday.</p>
                  </div>
                  <div className="p-4 rounded-xl hover:bg-slate-50 transition-colors">
                    <p className="text-sm font-bold text-slate-800">New Resource Added</p>
                    <p className="text-xs text-slate-500 mt-1 font-medium">Check out the new Study Room 05 in Block C.</p>
                  </div>
                  <div className="p-4 rounded-xl hover:bg-slate-50 transition-colors">
                    <p className="text-sm font-bold text-slate-800">Peak Hours Alert</p>
                    <p className="text-xs text-slate-500 mt-1 font-medium">IoT Lab is fully booked on Fridays 2–5 PM.</p>
                  </div>
                </div>
              </div>
            </motion.section>
          </motion.div>
        ) : (
          <motion.div key="users" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <UserManagementTab />
          </motion.div>
        )}
      </AnimatePresence>

      <BookingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        resourceName={selectedResource}
        onBookingSuccess={() => alert('Booking created successfully!')}
      />
    </motion.div>
  );
};

export default Dashboard;
