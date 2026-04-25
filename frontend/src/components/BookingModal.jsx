import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock, Loader2, ChevronDown, ShieldCheck } from 'lucide-react';
import api from '../utils/axiosConfig';

const BookingModal = ({ isOpen, onClose, selectedResource, onBookingSuccess, bookingToEdit }) => {
  const navigate = useNavigate();
  const [resources, setResources] = useState([]);
  const [loadingResources, setLoadingResources] = useState(false);
  const [resourceError, setResourceError] = useState('');
  const [resourceId, setResourceId] = useState('');
  
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [purpose, setPurpose] = useState('');
  const [attendees, setAttendees] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const activeResources = useMemo(() => resources.filter((resource) => resource.status === 'ACTIVE'), [resources]);

  useEffect(() => {
    if (!isOpen) return;

    const fetchActiveResources = async () => {
      setLoadingResources(true);
      setResourceError('');

      try {
        const response = await api.get('/api/resources', { params: { status: 'ACTIVE' } });
        const mapped = (response.data.content || response.data || []).map((resource) => ({
          id: String(resource.id),
          name: resource.name,
          type: resource.type,
          location: resource.location,
          status: resource.status
        }));

        setResources(mapped);
        
        if (bookingToEdit) {
          const start = new Date(bookingToEdit.startTime);
          const end = new Date(bookingToEdit.endTime);
          setDate(start.toISOString().split('T')[0]);
          setStartTime(start.toTimeString().split(' ')[0].substring(0, 5));
          setEndTime(end.toTimeString().split(' ')[0].substring(0, 5));
          setPurpose(bookingToEdit.purpose || '');
          setAttendees(bookingToEdit.attendeesCount || 1);
          
          // Try to match resource by name if ID isn't directly available in bookingToEdit
          const matchingRes = mapped.find(r => r.name === bookingToEdit.resourceName);
          if (matchingRes) setResourceId(matchingRes.id);
        } else {
          const initialId = selectedResource?.id ? String(selectedResource.id) : mapped[0]?.id || '';
          setResourceId(initialId);
          setDate('');
          setStartTime('');
          setEndTime('');
          setPurpose('');
          setAttendees(1);
        }
      } catch (err) {
        setResources([]);
        setResourceId('');
        setResourceError(err?.response?.data?.message || 'Failed to load active resources.');
      } finally {
        setLoadingResources(false);
      }
    };

    fetchActiveResources();
  }, [isOpen, selectedResource?.id, bookingToEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = {
        resourceId,
        purpose,
        attendees,
        startTime: `${date}T${startTime}:00`,
        endTime: `${date}T${endTime}:00`
      };

      if (bookingToEdit) {
        await api.put(`/api/bookings/${bookingToEdit.id}`, payload);
      } else {
        await api.post('/api/bookings', payload);
      }
      
      onBookingSuccess();
      onClose();
      if (!bookingToEdit) navigate('/bookings');
    } catch (err) {
      console.error('Booking failed:', err);
      setError(err?.response?.data?.message || err?.response?.data || 'Failed to process booking. Please check for scheduling conflicts.');
    } finally {
      setLoading(false);
    }
  };

  const selectedResourceName = activeResources.find((resource) => resource.id === resourceId)?.name || bookingToEdit?.resourceName || selectedResource?.title || 'Selected Resource';

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100]"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg glass-card p-10 z-[101] shadow-2xl maxHeight-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-2xl font-bold text-slate-900">{bookingToEdit ? `Edit ${selectedResourceName}` : `Book ${selectedResourceName}`}</h3>
                <p className="text-slate-500 text-sm mt-1">{bookingToEdit ? 'Modify your booking details.' : 'Select your preferred date and time slots.'}</p>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" /> Resource
                </label>
                {loadingResources ? (
                  <div className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 text-sm flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" /> Loading active resources...
                  </div>
                ) : (
                  <div className="relative">
                    <select
                      required
                      value={resourceId}
                      onChange={(e) => setResourceId(e.target.value)}
                      className="w-full appearance-none px-4 py-3 pr-11 rounded-xl border border-slate-200 bg-white/50 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      disabled={activeResources.length === 0}
                    >
                      {activeResources.length === 0 ? (
                        <option value="">No active resources available</option>
                      ) : (
                        activeResources.map((resource) => (
                          <option key={resource.id} value={resource.id}>
                            {resource.name} · {resource.type} · {resource.location}
                          </option>
                        ))
                      )}
                    </select>
                    <ChevronDown className="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                )}
                {resourceError && <p className="text-sm text-red-500 font-medium mt-2">{resourceError}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4" /> Date
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white/50 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                    <Clock className="w-4 h-4" /> Start Time
                  </label>
                  <input
                    type="time"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white/50 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                    <Clock className="w-4 h-4" /> End Time
                  </label>
                  <input
                    type="time"
                    required
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white/50 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Purpose</label>
                <textarea
                  required
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  placeholder="e.g. Group study session, project development"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white/50 focus:ring-2 focus:ring-indigo-500 outline-none transition-all h-24 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Expected Attendees</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  required
                  value={attendees}
                  onChange={(e) => setAttendees(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white/50 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                />
              </div>

              {error && <p className="text-sm text-red-500 font-medium text-center bg-red-50 p-3 rounded-xl">{error}</p>}

              <button
                type="submit"
                disabled={loading || loadingResources || activeResources.length === 0}
                className="w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95 flex items-center justify-center gap-3"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (bookingToEdit ? 'Save Changes' : 'Confirm Booking')}
              </button>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default BookingModal;
