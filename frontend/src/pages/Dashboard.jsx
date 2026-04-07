import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { User, Mail, Calendar, MapPin, Clock, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import BookingModal from '../components/BookingModal';

const ResourceCard = ({ title, status, image, onBook }) => (
  <div className="glass-card overflow-hidden group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
    <div className="h-48 w-full bg-slate-200 relative overflow-hidden">
      <div className="absolute inset-0 bg-indigo-600/10 group-hover:bg-indigo-600/0 transition-colors duration-500" />
      <img src={image} alt={title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
      <div className="absolute top-4 right-4">
        <span className={`px-3 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-1.5 ${
          status === 'Available' ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'
        }`}>
          {status === 'Available' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
          {status}
        </span>
      </div>
    </div>
    <div className="p-6">
      <h3 className="text-xl font-bold text-slate-800 tracking-tight">{title}</h3>
      <div className="flex items-center gap-4 mt-4 text-sm text-slate-500 font-medium">
        <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> Main Campus</span>
        <span className="flex items-center gap-1.5"><User className="w-4 h-4" /> 20-50 Pax</span>
      </div>
      <button
        onClick={() => onBook(title)}
        className="w-full mt-6 py-3 bg-white border border-indigo-100 text-indigo-600 font-bold rounded-xl hover:bg-indigo-600 hover:text-white transition-all duration-300 shadow-sm"
      >
        Book Now
      </button>
    </div>
  </div>
);

const Dashboard = () => {
  const [user, setUser] = useState({ name: 'Kavindu Nethmina', email: 'kavindu@gmail.com' });
  const [selectedResource, setSelectedResource] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dateStr, setDateStr] = useState('');

  useEffect(() => {
    // Set current date string
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    setDateStr(new Date().toLocaleDateString('en-US', options));
    
    // Fetch user details
    axios.get('/api/dashboard')
      .then(res => {
        // Manually setting based on user info if available
        setUser({ name: 'Kavindu Nethmina', email: 'kavindu@gmail.com' });
      })
      .catch(err => console.error('User fetch error:', err));
  }, []);

  const resources = [
    { title: 'IoT Lab', status: 'Available', image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=800' },
    { title: 'Study Room 01', status: 'Available', image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800' },
    { title: 'Auditorium', status: 'Occupied', image: 'https://images.unsplash.com/photo-1505373633560-eb0a6f2a5100?auto=format&fit=crop&q=80&w=800' },
    { title: 'Library Zone B', status: 'Available', image: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&q=80&w=800' }
  ];

  const handleBookClick = (resourceName) => {
    setSelectedResource(resourceName);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-12">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">Welcome back, {user.name.split(' ')[0]}!</h2>
          <p className="text-slate-500 mt-2 font-medium flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-500" /> {dateStr}
          </p>
        </div>
        <div className="flex items-center gap-3 bg-white/50 border border-indigo-100 p-2 pr-6 rounded-2xl shadow-sm glass">
          <div className="h-12 w-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
            <User className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800">{user.name}</p>
            <p className="text-xs font-semibold text-indigo-600 uppercase tracking-widest">Student</p>
          </div>
        </div>
      </header>

      <section>
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-2xl font-extrabold text-slate-800 tracking-tight">Available Resources</h3>
          <div className="flex gap-2">
            <span className="w-3 h-3 rounded-full bg-indigo-200"></span>
            <span className="w-3 h-3 rounded-full bg-indigo-400"></span>
            <span className="w-3 h-3 rounded-full bg-indigo-600"></span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {resources.map((res, idx) => (
            <ResourceCard key={idx} {...res} onBook={handleBookClick} />
          ))}
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-2xl font-extrabold text-slate-800 tracking-tight">Recent Bookings</h3>
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

      <BookingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        resourceName={selectedResource}
        onBookingSuccess={() => alert('Booking created successfully!')}
      />
    </div>
  );
};

export default Dashboard;
