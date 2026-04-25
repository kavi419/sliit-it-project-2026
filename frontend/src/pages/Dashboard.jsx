import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  User, Mail, Calendar, MapPin, ArrowRight, CheckCircle2, AlertCircle, 
  Shield, Users, Check, Clock, TrendingUp, BarChart3, Activity, PieChart as PieIcon 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, Cell 
} from 'recharts';
import BookingModal from '../components/BookingModal';
import { useAuth } from '../context/AuthContext';
import api from '../utils/axiosConfig';

// Shared animation variant for staggered section reveal
const sectionVariant = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] } },
};

// ─── Resource Card ────────────────────────────────────────────────────────────
const ResourceCard = ({ resource, onBook }) => (
  <motion.div
    variants={sectionVariant}
    className="glass-card overflow-hidden group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
  >
    <div className="h-48 w-full bg-slate-200 relative overflow-hidden">
      <div className="absolute inset-0 bg-indigo-600/10 group-hover:bg-indigo-600/0 transition-colors duration-500" />
      <img src={resource.image} alt={resource.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
      <div className="absolute top-4 right-4">
        <span className={`px-3 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-1.5 ${
          resource.status === 'Available' ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'
        }`}>
          {resource.status === 'Available' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
          {resource.status}
        </span>
      </div>
    </div>
    <div className="p-6">
      <h3 className="text-xl font-bold text-slate-800 tracking-tight">{resource.title}</h3>
      <div className="flex items-center gap-4 mt-4 text-sm text-slate-500 font-medium">
        <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" />{resource.location || 'Campus'}</span>
        <span className="flex items-center gap-1.5"><User className="w-4 h-4" />{resource.capacity ? `${resource.capacity} Pax` : 'N/A'}</span>
      </div>

      {resource.status !== 'Available' && resource.nextSlot && (
        <div className="mt-4 p-3 bg-amber-50 border border-amber-100 rounded-xl flex items-center gap-2">
          <Clock className="w-4 h-4 text-amber-600" />
          <p className="text-[11px] font-bold text-amber-700 uppercase tracking-wide">
            Next Slot: {new Date(resource.nextSlot).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      )}

      <button
        onClick={() => onBook(resource)}
        disabled={resource.status !== 'Available'}
        className="w-full mt-6 py-3 bg-white border border-indigo-100 text-indigo-600 font-bold rounded-xl
          hover:bg-indigo-600 hover:text-white transition-all duration-300 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-indigo-600"
      >
        {resource.status === 'Available' ? 'Book Now' : 'Currently In Use'}
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
    api.get('/api/admin/pending-users')
      .then(res => setPendingUsers(res.data))
      .catch(() => setPendingUsers([]))
      .finally(() => setLoadingUsers(false));
  };

  useEffect(() => { fetchPending(); }, []);

  const handleApprove = async (id, email) => {
    setApprovingId(id);
    try {
      await api.post(`/api/admin/approve/${id}`, {});
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

// ─── Analytics Tab ────────────────────────────────────────────────────────────
const AnalyticsTab = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/analytics/resource-usage')
      .then(res => setData(res.data))
      .catch(err => console.error('Analytics failed:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
    </div>
  );

  const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b'];

  return (
    <div className="space-y-8">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Total Resources', value: data?.totalResources, icon: MapPin, color: 'bg-blue-500' },
          { label: 'Total Bookings', value: data?.totalBookings, icon: Calendar, color: 'bg-indigo-500' },
          { label: 'Active Users', value: '24+', icon: Users, color: 'bg-emerald-500' }
        ].map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className="glass-card p-6 flex items-center gap-4">
            <div className={`p-3 rounded-2xl ${stat.color} text-white shadow-lg`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">{stat.label}</p>
              <p className="text-3xl font-black text-slate-900">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Resources Chart */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="glass-card p-8">
          <div className="flex items-center gap-3 mb-8">
            <BarChart3 className="w-5 h-5 text-indigo-600" />
            <h3 className="text-xl font-bold text-slate-800">Most Booked Resources</h3>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.topResources}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                  cursor={{ fill: '#f8fafc' }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} barSize={40}>
                  {data?.topResources?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Weekly Trends Chart */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass-card p-8">
          <div className="flex items-center gap-3 mb-8">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            <h3 className="text-xl font-bold text-slate-800">Peak Usage Days</h3>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.weeklyTrends}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }} />
                <Area type="monotone" dataKey="count" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#colorCount)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Utilization Summary */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-8 bg-slate-900 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Activity className="w-32 h-32" />
        </div>
        <div className="relative z-10">
          <h3 className="text-2xl font-black mb-2">Optimization Insight</h3>
          <p className="text-slate-400 max-w-2xl font-medium">
            Based on current data, your campus resources are reaching <span className="text-emerald-400">84% peak utilization</span> on 
            <span className="text-white"> {data?.weeklyTrends?.[0]?.day || 'Tuesdays'}</span>. 
            Consider increasing maintenance staff availability during these periods.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

// ─── Dashboard ────────────────────────────────────────────────────────────────
const Dashboard = () => {
  const { user }                          = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab]         = useState('overview');
  const [selectedResource, setSelectedResource] = useState(null);
  const [isModalOpen, setIsModalOpen]     = useState(false);
  const [dateStr, setDateStr]             = useState('');
  const [resources, setResources]         = useState([]);
  const [loadingResources, setLoadingResources] = useState(true);
  const [resourcesError, setResourcesError] = useState('');
  const [bookings, setBookings]           = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(true);

  const displayName = user?.name || 'Campus User';
  const role        = user?.role || 'STUDENT';
  const isAdmin     = role === 'ADMIN';

  useEffect(() => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    setDateStr(new Date().toLocaleDateString('en-US', options));
  }, []);

  useEffect(() => {
    const statusLabelMap = {
      ACTIVE: 'Available',
      MAINTENANCE: 'Maintenance',
      OUT_OF_SERVICE: 'Out of Service'
    };

    const fallbackImages = [
      'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1505373633560-eb0a6f2a5100?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&q=80&w=800'
    ];

    const fetchResources = async () => {
      setLoadingResources(true);
      setResourcesError('');

      try {
        const res = await api.get('/api/resources');
        const mapped = (res.data.content || []).map((resource, idx) => ({
          id: resource.id,
          title: resource.name,
          status: statusLabelMap[resource.status] || 'Unavailable',
          image: resource.imageUrl || fallbackImages[idx % fallbackImages.length],
          location: resource.location,
          capacity: resource.capacity,
          nextSlot: resource.nextAvailableSlot
        }));

        setResources(mapped);
      } catch (err) {
        setResourcesError(err?.response?.data?.message || 'Unable to load resources right now.');
        setResources([]);
      } finally {
        setLoadingResources(false);
      }
    };

    const fetchBookings = async () => {
      setLoadingBookings(true);
      try {
        // Always fetch the current user's own bookings for the personal dashboard view.
        // Admins can see all bookings on the /bookings page.
        const res = await api.get('/api/bookings/my');
        setBookings(res.data || []);
      } catch (err) {
        console.error('Failed to load bookings:', err);
      } finally {
        setLoadingBookings(false);
      }
    };

    fetchResources();
    fetchBookings();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
            ${isAdmin ? 'bg-gradient-to-br from-rose-500 to-pink-600 shadow-rose-500/30' : 'bg-gradient-to-br from-indigo-50 to-violet-600 shadow-indigo-500/30'}`}>
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
          {[
            { id: 'overview', label: 'Overview' }, 
            { id: 'analytics', label: '📊 Analytics' },
            { id: 'users', label: '👥 Users' }
          ].map(tab => (
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
            {/* ... rest of the overview content ... */}

            {/* Admin or Student Panel */}
            {isAdmin ? (
              <motion.section variants={sectionVariant}
                className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-700 p-8 text-white shadow-xl shadow-indigo-500/20">
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
                        <p className="text-4xl font-black tracking-tight drop-shadow-md text-white">{bookings.length}</p>
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {loadingResources && (
                  <div className="md:col-span-2 lg:col-span-4 py-12 text-center text-slate-500 font-medium">
                    Loading resources...
                  </div>
                )}

                {!loadingResources && resourcesError && (
                  <div className="md:col-span-2 lg:col-span-4 py-6 px-5 rounded-2xl border border-rose-200 bg-rose-50 text-rose-700 font-medium">
                    {resourcesError}
                  </div>
                )}

                {!loadingResources && !resourcesError && resources.length === 0 && (
                  <div className="md:col-span-2 lg:col-span-4 py-12 text-center text-slate-500 font-medium">
                    No resources available.
                  </div>
                )}

                {!loadingResources && !resourcesError && resources.map((res) => (
                  <ResourceCard key={res.id} resource={res} onBook={(resource) => { setSelectedResource(resource); setIsModalOpen(true); }} />
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
                  ) : bookings.length === 0 ? (
                    <div className="p-12 text-center text-slate-400 font-medium">
                      No recent bookings found.
                    </div>
                  ) : (
                    bookings.slice(0, 5).map((booking) => (
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
        ) : activeTab === 'analytics' ? (
          <motion.div key="analytics" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <AnalyticsTab />
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
        selectedResource={selectedResource}
        onBookingSuccess={() => alert('Booking created successfully!')}
      />
    </motion.div>
  );
};

export default Dashboard;
