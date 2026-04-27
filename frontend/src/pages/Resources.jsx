import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Filter, MapPin, Users, Edit3, Trash2, RefreshCcw, Clock3 } from 'lucide-react';
import { useNavigate, Navigate } from 'react-router-dom';
import api from '../utils/axiosConfig';
import { useAuth } from '../context/AuthContext';

const defaultForm = {
  name: '',
  type: '',
  capacity: 1,
  location: '',
  status: 'ACTIVE',
  availableFrom: '',
  availableTo: '',
  imageUrl: '',
  description: ''
};

const fieldClass = 'w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100';

const statusStyles = {
  ACTIVE: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  MAINTENANCE: 'bg-amber-100 text-amber-700 border-amber-200',
  OUT_OF_SERVICE: 'bg-rose-100 text-rose-700 border-rose-200'
};

const Field = ({ label, children }) => (
  <label className="block space-y-2">
    <span className="text-xs font-bold uppercase tracking-[0.24em] text-slate-500">{label}</span>
    {children}
  </label>
);

const StatCard = ({ label, value, tone }) => (
  <div className={`rounded-3xl p-6 border border-white/60 shadow-sm ${tone}`}>
    <p className="text-xs uppercase tracking-[0.25em] font-bold opacity-70">{label}</p>
    <p className="text-4xl font-black mt-2">{value}</p>
  </div>
);

const FilterInput = ({ label, value, onChange, placeholder, icon: Icon }) => (
  <label className="block space-y-2">
    <span className="text-xs font-bold uppercase tracking-[0.24em] text-slate-500">{label}</span>
    <div className="relative">
      <Icon className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`${fieldClass} pl-11`}
      />
    </div>
  </label>
);

const ResourceFormModal = ({ open, onClose, form, setForm, onSubmit, editingId, saving }) => {
  if (!open) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
          onClick={onClose}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 16 }}
          className="relative w-full max-w-3xl glass-card rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
        >
          <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-indigo-500">Campus Resource</p>
              <h2 className="text-2xl font-black text-slate-900">{editingId ? 'Edit Resource' : 'Add Resource'}</h2>
            </div>
            <button onClick={onClose} className="px-3 py-2 rounded-xl text-slate-500 hover:bg-slate-100">
              Close
            </button>
          </div>

          <form
            onSubmit={onSubmit}
            className="p-8 grid grid-cols-1 md:grid-cols-2 gap-5 bg-gradient-to-b from-white to-slate-50/80"
          >
            <Field label="Resource Name">
              <input name="name" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} className={fieldClass} required />
            </Field>
            <Field label="Type">
              <input name="type" value={form.type} onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))} className={fieldClass} required />
            </Field>
            <Field label="Capacity">
              <input type="number" min="1" name="capacity" value={form.capacity} onChange={(e) => setForm((p) => ({ ...p, capacity: e.target.value }))} className={fieldClass} required />
            </Field>
            <Field label="Location">
              <input name="location" value={form.location} onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))} className={fieldClass} required />
            </Field>
            <Field label="Status">
              <select name="status" value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))} className={fieldClass}>
                <option value="ACTIVE">ACTIVE</option>
                <option value="MAINTENANCE">MAINTENANCE</option>
                <option value="OUT_OF_SERVICE">OUT_OF_SERVICE</option>
              </select>
            </Field>
            <Field label="Image URL">
              <input name="imageUrl" value={form.imageUrl} onChange={(e) => setForm((p) => ({ ...p, imageUrl: e.target.value }))} className={fieldClass} />
            </Field>
            <Field label="Available From">
              <input type="time" name="availableFrom" value={form.availableFrom} onChange={(e) => setForm((p) => ({ ...p, availableFrom: e.target.value }))} className={fieldClass} />
            </Field>
            <Field label="Available To">
              <input type="time" name="availableTo" value={form.availableTo} onChange={(e) => setForm((p) => ({ ...p, availableTo: e.target.value }))} className={fieldClass} />
            </Field>
            <div className="md:col-span-2">
              <Field label="Description">
                <textarea name="description" rows="4" value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} className={`${fieldClass} resize-none`} />
              </Field>
            </div>

            <div className="md:col-span-2 flex items-center justify-end gap-3 pt-2">
              <button type="button" onClick={onClose} className="px-5 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-white">
                Cancel
              </button>
              <button disabled={saving} type="submit" className="px-6 py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 disabled:opacity-70 flex items-center gap-2">
                {saving ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                {editingId ? 'Update Resource' : 'Create Resource'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

const ResourceCard = ({ resource, onEdit, onDelete, onStatusChange }) => {
  const image = resource.imageUrl || 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&q=80&w=800';

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card overflow-hidden group hover:shadow-2xl transition-all duration-300"
    >
      <div className="h-44 relative overflow-hidden bg-slate-100">
        <img src={image} alt={resource.name} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute top-4 right-4 flex gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-black border ${statusStyles[resource.status] || statusStyles.ACTIVE}`}>
            {resource.status}
          </span>
        </div>
      </div>

      <div className="p-6 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight">{resource.name}</h3>
            <p className="text-sm text-slate-500 font-medium mt-1">{resource.type}</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold text-slate-700 flex items-center gap-1 justify-end"><Users className="w-4 h-4" /> {resource.capacity}</p>
            <p className="text-xs text-slate-500">Capacity</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 text-sm text-slate-600 font-medium">
          <span className="inline-flex items-center gap-1.5"><MapPin className="w-4 h-4 text-indigo-500" /> {resource.location}</span>
          <span className="inline-flex items-center gap-1.5"><Clock3 className="w-4 h-4 text-indigo-500" /> {resource.availableFrom || '—'} to {resource.availableTo || '—'}</span>
        </div>

        {resource.description && <p className="text-sm text-slate-500 leading-relaxed line-clamp-3">{resource.description}</p>}

        <div className="flex flex-wrap gap-2 pt-2">
          {onEdit ? (
            <>
              <button onClick={() => onEdit(resource)} className="flex-1 min-w-[110px] px-4 py-2.5 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 flex items-center justify-center gap-2">
                <Edit3 className="w-4 h-4" /> Edit
              </button>
              <button onClick={() => onStatusChange(resource)} className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50">
                Toggle Status
              </button>
              <button onClick={() => onDelete(resource.id)} className="px-4 py-2.5 rounded-xl border border-rose-200 text-rose-600 font-bold hover:bg-rose-50">
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          ) : (
            <button 
              onClick={() => onBookNow && onBookNow(resource.id)}
              className="flex-1 px-6 py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 shadow-sm transition-all active:scale-95"
            >
              Book Now
            </button>
          )}
          {/* Always show a small Book button for Admin testing too */}
          {onEdit && (
            <button 
              onClick={() => onEdit.onQuickBook(resource)}
              className="px-4 py-2.5 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800"
            >
              Book
            </button>
          )}
        </div>
      </div>
    </motion.article>
  );
};

const Resources = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [filters, setFilters] = useState({ query: '', type: '', location: '', status: '' });

  const fetchResources = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (filters.query) params.query = filters.query;
      if (filters.type) params.type = filters.type;
      if (filters.location) params.location = filters.location;
      if (filters.status) params.status = filters.status;

      const res = await api.get('/api/resources', { params });
      setResources(res.data.content || []);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load resources');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, [filters]);

  const stats = useMemo(() => {
    const active = resources.filter((resource) => resource.status === 'ACTIVE').length;
    const maintenance = resources.filter((resource) => resource.status === 'MAINTENANCE').length;
    const out = resources.filter((resource) => resource.status === 'OUT_OF_SERVICE').length;
    return { active, maintenance, out };
  }, [resources]);

  const openCreate = () => {
    setEditingId(null);
    setForm(defaultForm);
    setFormOpen(true);
  };

  const openEdit = (resource) => {
    setEditingId(resource.id);
    setForm({
      name: resource.name || '',
      type: resource.type || '',
      capacity: resource.capacity || 1,
      location: resource.location || '',
      status: resource.status || 'ACTIVE',
      availableFrom: resource.availableFrom || '',
      availableTo: resource.availableTo || '',
      imageUrl: resource.imageUrl || '',
      description: resource.description || ''
    });
    setFormOpen(true);
  };

  const submitForm = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = {
        ...form,
        capacity: Number(form.capacity),
        availableFrom: form.availableFrom || null,
        availableTo: form.availableTo || null
      };

      if (editingId) {
        await api.put(`/api/resources/${editingId}`, payload);
      } else {
        await api.post('/api/resources', payload);
      }

      setFormOpen(false);
      await fetchResources();
    } catch (err) {
      setError(err?.response?.data?.message || err?.response?.data?.errors?.name || 'Unable to save resource');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this resource?')) return;
    try {
      await api.delete(`/api/resources/${id}`);
      await fetchResources();
    } catch (err) {
      setError(err?.response?.data?.message || 'Delete failed');
    }
  };

  const handleStatusToggle = async (resource) => {
    const nextStatus = resource.status === 'ACTIVE' ? 'MAINTENANCE' : 'ACTIVE';
    try {
      await api.patch(`/api/resources/${resource.id}/status`, { status: nextStatus });
      await fetchResources();
    } catch (err) {
      setError(err?.response?.data?.message || 'Status update failed');
    }
  };

  const handleQuickBook = async (resource) => {
    try {
      const start = new Date();
      start.setDate(start.getDate() + 1); // Tomorrow
      start.setHours(10, 0, 0, 0); // 10:00 AM
      const end = new Date(start);
      end.setHours(12, 0, 0, 0); // 12:00 PM

      const payload = {
        resourceId: resource.id,
        purpose: "Testing Notification System",
        attendees: 5,
        startTime: start.toISOString().split('.')[0], // Remove ms and Z
        endTime: end.toISOString().split('.')[0]
      };

      await api.post('/api/bookings', payload);
      alert('Booking created successfully! Check your notifications. 🔔');
      fetchResources();
    } catch (err) {
      alert(err?.response?.data?.message || 'Booking failed');
    }
  };

  // Remove strict admin redirect to allow everyone to browse resources
  // if (!isAdmin) {
  //   return <Navigate to="/dashboard" replace />;
  // }

  return (
    <div className="space-y-8">
      <header className="flex flex-col xl:flex-row xl:items-end justify-between gap-6">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-indigo-500 font-bold">Resource Management</p>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mt-2">Facilities Catalogue</h1>
          <p className="text-slate-500 font-medium mt-2 max-w-2xl">Manage lecture halls, labs, meeting rooms, and equipment from one place. Search, filter, update status, and keep the booking flow consistent.</p>
        </div>

        {isAdmin && (
          <button onClick={openCreate} className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 shadow-sm">
            <Plus className="w-4 h-4" /> Add Resource
          </button>
        )}
      </header>

      {isAdmin && (
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard label="Active" value={stats.active} tone="bg-emerald-50 text-emerald-700" />
          <StatCard label="Maintenance" value={stats.maintenance} tone="bg-amber-50 text-amber-700" />
          <StatCard label="Out of Service" value={stats.out} tone="bg-rose-50 text-rose-700" />
        </section>
      )}

      <section className="glass-card p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <FilterInput label="Search" value={filters.query} onChange={(value) => setFilters((prev) => ({ ...prev, query: value }))} placeholder="Name, type, location" icon={Search} />
          <FilterInput label="Type" value={filters.type} onChange={(value) => setFilters((prev) => ({ ...prev, type: value }))} placeholder="Lab / Hall / Equipment" icon={Filter} />
          <FilterInput label="Location" value={filters.location} onChange={(value) => setFilters((prev) => ({ ...prev, location: value }))} placeholder="Block A / Main Campus" icon={MapPin} />
          <label className="block space-y-2">
            <span className="text-xs font-bold uppercase tracking-[0.24em] text-slate-500">Status</span>
            <select value={filters.status} onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))} className={fieldClass}>
              <option value="">All</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="MAINTENANCE">MAINTENANCE</option>
              <option value="OUT_OF_SERVICE">OUT_OF_SERVICE</option>
            </select>
          </label>
        </div>

        {error && <div className="rounded-2xl border border-rose-200 bg-rose-50 text-rose-700 px-4 py-3 font-medium">{error}</div>}

        {loading ? (
          <div className="py-20 flex justify-center">
            <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
          </div>
        ) : resources.length === 0 ? (
          <div className="py-16 text-center text-slate-500 font-medium">No resources found for the current filter set.</div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {resources.map((resource) => (
              <ResourceCard
                key={resource.id}
                resource={resource}
                onBookNow={(id) => navigate(`/bookings?resourceId=${id}`)}
                onEdit={isAdmin ? { ...openEdit, onQuickBook: handleQuickBook } : null}
                onDelete={isAdmin ? handleDelete : null}
                onStatusChange={isAdmin ? handleStatusToggle : null}
              />
            ))}
          </div>
        )}
      </section>

      <ResourceFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        form={form}
        setForm={setForm}
        onSubmit={submitForm}
        editingId={editingId}
        saving={saving}
      />
    </div>
  );
};

export default Resources;