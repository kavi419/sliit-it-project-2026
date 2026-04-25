import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { User, Mail, Calendar, MapPin, Clock, ArrowRight, CheckCircle2, AlertCircle, Shield, Users, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import BookingModal from '../components/BookingModal';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../utils/axiosConfig';

// ─── Resource Card ────────────────────────────────────────────────────────────
const ResourceCard = ({ resource, onBook }) => (
  <div className="glass-card overflow-hidden group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
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
      <button
        onClick={() => onBook(resource)}
        disabled={resource.status !== 'Available'}
        className="w-full mt-6 py-3 bg-white border border-indigo-100 text-indigo-600 font-bold rounded-xl
          hover:bg-indigo-600 hover:text-white transition-all duration-300 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-indigo-600"
      >
        {resource.status === 'Available' ? 'Book Now' : 'Unavailable'}
      </button>
    </div>
  </div>
);

// ─── User Management Tab ──────────────────────────────────────────────────────
const UserManagementTab = () => {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [approvingId, setApprovingId]   = useState(null);
  const [toast, setToast]               = useState('');

  const fetchPending = () => {
    setLoadingUsers(true);
    axios.get('http://localhost:8080/api/admin/pending-users', { withCredentials: true })
      .then(res => setPendingUsers(res.data))
      .catch(() => setPendingUsers([]))
      .finally(() => setLoadingUsers(false));
  };

  useEffect(() => { fetchPending(); }, []);

  const handleApprove = async (id, email) => {
    setApprovingId(id);
    try {
      await axios.post(`http://localhost:8080/api/admin/approve/${id}`, {}, { withCredentials: true });
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
  const { user }                          = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab]         = useState('overview');
  const [selectedResource, setSelectedResource] = useState(null);
  const [isModalOpen, setIsModalOpen]     = useState(false);
  const [dateStr, setDateStr]             = useState('');
  const [resources, setResources]         = useState([]);
  const [loadingResources, setLoadingResources] = useState(true);
  const [resourcesError, setResourcesError] = useState('');

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
      MAINTENANCE: 'Occupied',
      OUT_OF_SERVICE: 'Occupied'
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
        const mapped = (res.data || []).map((resource, idx) => ({
          id: resource.id,
          title: resource.name,
          status: statusLabelMap[resource.status] || 'Occupied',
          image: resource.imageUrl || fallbackImages[idx % fallbackImages.length],
          location: resource.location,
          capacity: resource.capacity
        }));

        setResources(mapped);
      } catch (err) {
        setResourcesError(err?.response?.data?.message || 'Unable to load resources right now.');
        setResources([]);
      } finally {
        setLoadingResources(false);
      }
    };

    fetchResources();
  }, []);

  const tabs = [
    { id: 'overview', label: 'Overview' },
    ...(isAdmin ? [{ id: 'users', label: '👥 User Management' }] : []),
  ];

  return (
    <div className="space-y-10">
      {/* ── Header ── */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">
            Welcome back, {displayName.split(' ')[0]}!
          </h2>
          <p className="text-slate-500 mt-2 font-medium flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-500" /> {dateStr}
          </p>
        </div>
        <div className="flex items-center gap-3 bg-white/50 border border-indigo-100 p-2 pr-6 rounded-2xl shadow-sm glass">
          <div className={`h-12 w-12 rounded-xl flex items-center justify-center text-white
            ${isAdmin ? 'bg-rose-600' : 'bg-indigo-600'}`}>
            <User className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800">{displayName}</p>
            <p className={`text-xs font-semibold uppercase tracking-widest ${isAdmin ? 'text-rose-600' : 'text-indigo-600'}`}>
              {role}
            </p>
          </div>
        </div>
      </header>

      {/* ── Tab Navigation (admin only) ── */}
      {isAdmin && (
        <div className="flex gap-2 border-b border-slate-200 pb-0">
          {tabs.map(tab => (
            <button
              key={tab.id}
              id={`tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2.5 font-semibold text-sm rounded-t-xl border-b-2 transition-all
                ${activeTab === tab.id
                  ? 'border-indigo-600 text-indigo-700 bg-indigo-50/60'
                  : 'border-transparent text-slate-500 hover:text-indigo-600'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* ── Tab Content ── */}
      <AnimatePresence mode="wait">
        {activeTab === 'users' ? (
          <motion.div key="users" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <UserManagementTab />
          </motion.div>
        ) : (
          <motion.div key="overview" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="space-y-12">

            {/* Admin overview panel */}
            {isAdmin && (
              <section className="bg-indigo-50 border border-indigo-100 rounded-2xl p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <span className="p-2 bg-indigo-600 text-white rounded-xl shadow-sm">
                    <Shield className="w-5 h-5" />
                  </span>
                  <h3 className="text-2xl font-extrabold text-slate-800 tracking-tight">Admin Panel</h3>
                </div>
                <p className="text-indigo-900/70 font-medium mb-6">
                  You have administrative access to manage campus resources and view all system-wide bookings.
                </p>
                <div className="flex flex-wrap gap-4">
                  <button
                    onClick={() => navigate('/resources')}
                    className="px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-xl shadow-sm hover:bg-indigo-700 transition"
                  >
                    Manage Resources
                  </button>
                  <button className="px-6 py-2.5 bg-white text-indigo-600 border border-indigo-200 font-bold rounded-xl shadow-sm hover:bg-indigo-50 transition">
                    View All Bookings
                  </button>
                  <button
                    onClick={() => setActiveTab('users')}
                    className="px-6 py-2.5 bg-rose-600 text-white font-bold rounded-xl shadow-sm hover:bg-rose-700 transition flex items-center gap-2"
                  >
                    <Users className="w-4 h-4" /> Manage Users
                  </button>
                </div>
              </section>
            )}

            {/* Resources grid */}
            <section>
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-extrabold text-slate-800 tracking-tight">Available Resources</h3>
                <div className="flex gap-2">
                  <span className="w-3 h-3 rounded-full bg-indigo-200" />
                  <span className="w-3 h-3 rounded-full bg-indigo-400" />
                  <span className="w-3 h-3 rounded-full bg-indigo-600" />
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
                  <ResourceCard key={res.id || res.title} resource={res} onBook={(resource) => { setSelectedResource(resource); setIsModalOpen(true); }} />
                ))}
              </div>
            </section>

            {/* Recent bookings + activity */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              <div className="lg:col-span-2 space-y-6">
                <h3 className="text-2xl font-extrabold text-slate-800 tracking-tight">
                  {isAdmin ? 'All Recent Bookings' : 'Your Recent Bookings'}
                </h3>
                <div className="glass-card divide-y divide-slate-100 overflow-hidden">
                  {[1, 2].map((i) => (
                    <div key={i} className="p-8 flex items-center justify-between hover:bg-slate-50/50 transition-all cursor-pointer group">
                      <div className="flex items-center gap-6">
                        <div className="h-16 w-16 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
                          <Calendar className="w-8 h-8" />
                        </div>
                        <div>
                          <p className="font-bold text-xl text-slate-900 tracking-tight">IoT Lab Session</p>
                          <p className="text-slate-500 font-medium mt-1">Apr 10, 2026 • 09:00 AM - 11:00 AM</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-indigo-600 font-bold group-hover:gap-4 transition-all pr-4">
                        View <ArrowRight className="w-5 h-5" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-2xl font-extrabold text-slate-800 tracking-tight mb-6">Activity Feed</h3>
                <div className="glass-card p-2 space-y-2">
                  <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-100">
                    <p className="text-sm font-bold text-indigo-900">System Maintenance</p>
                    <p className="text-xs text-indigo-700 mt-1">The Library Zone B will be closed for maintenance on Sunday.</p>
                  </div>
                  <div className="p-4 rounded-xl hover:bg-slate-50 transition-colors">
                    <p className="text-sm font-bold text-slate-800">New Resource Added</p>
                    <p className="text-xs text-slate-500 mt-1">Check out the new Study Room 05 in Block C.</p>
                  </div>
                </div>
              </div>
            </section>
          </motion.div>
        )}
      </AnimatePresence>

      <BookingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedResource={selectedResource}
        onBookingSuccess={() => alert('Booking created successfully!')}
      />
    </div>
  );
};

export default Dashboard;
