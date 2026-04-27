import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, Trash2, MessageSquare, AlertTriangle, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../context/NotificationContext';

const NotificationDropdown = () => {
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification, 
    fetchNotifications 
  } = useNotifications();
  
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = (id, e) => {
    if (e) e.stopPropagation();
    markAsRead(id);
  };

  const handleDelete = (id, e) => {
    if (e) e.stopPropagation();
    deleteNotification(id);
  };

  const handleNotificationClick = (notification) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
    setIsOpen(false);
    
    // Navigate based on type
    if (notification.type.includes('BOOKING')) {
      navigate('/bookings');
    } else if (notification.type.includes('TICKET') || notification.type.includes('COMMENT')) {
      if (notification.relatedEntityId) {
        navigate(`/tickets/${notification.relatedEntityId}`);
      } else {
        navigate('/tickets');
      }
    } else if (notification.type === 'USER_REGISTRATION') {
      navigate('/dashboard', { state: { tab: 'users' } });
    }
  };

  const getIconForType = (type) => {
    switch (type) {
      case 'BOOKING_APPROVED': return <ShieldCheck className="w-4 h-4 text-emerald-500" />;
      case 'BOOKING_REJECTED': return <AlertTriangle className="w-4 h-4 text-rose-500" />;
      case 'NEW_COMMENT':      return <MessageSquare className="w-4 h-4 text-blue-500" />;
      case 'TICKET_UPDATE':    return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case 'USER_REGISTRATION': return <ShieldCheck className="w-4 h-4 text-rose-500" />;
      default:                 return <Bell className="w-4 h-4 text-indigo-500" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen && notifications.length === 0) fetchNotifications();
        }}
        className="relative p-2 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white shadow-sm" />
        )}
      </button>

      {/* Dropdown Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-12 right-0 w-80 bg-white/90 backdrop-blur-2xl border border-slate-200/60 rounded-2xl shadow-2xl z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-bold text-slate-800 text-sm">Notifications</h3>
              {unreadCount > 0 && (
                <button onClick={markAllAsRead} className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 hover:text-indigo-800 transition-colors">
                  Mark all read
                </button>
              )}
            </div>

            {/* List */}
            <div className="max-h-80 overflow-y-auto">
              {loading && notifications.length === 0 ? (
                <div className="p-8 flex justify-center">
                  <div className="w-5 h-5 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-sm font-medium">
                  <Bell className="w-8 h-8 mx-auto mb-2 opacity-20" />
                  No new notifications
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => handleNotificationClick(n)}
                      className={`p-4 hover:bg-slate-50 transition-colors cursor-pointer flex gap-3 group relative
                        ${!n.isRead ? 'bg-indigo-50/30' : ''}`}
                    >
                      <div className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center shrink-0
                        ${!n.isRead ? 'bg-white shadow-sm border border-slate-100' : 'bg-slate-100'}`}>
                        {getIconForType(n.type)}
                      </div>
                      <div className="flex-1 min-w-0 pr-6">
                        <p className={`text-sm ${!n.isRead ? 'font-bold text-slate-800' : 'font-medium text-slate-600'}`}>
                          {n.message}
                        </p>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">
                          {new Date(n.createdAt).toLocaleDateString()}
                        </p>
                      </div>

                      {/* Hover Actions */}
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {!n.isRead && (
                          <button onClick={(e) => handleMarkAsRead(n.id, e)} className="p-1.5 text-slate-400 hover:text-emerald-500 bg-white rounded-lg shadow-sm border border-slate-100" title="Mark as read">
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button onClick={(e) => handleDelete(n.id, e)} className="p-1.5 text-slate-400 hover:text-rose-500 bg-white rounded-lg shadow-sm border border-slate-100" title="Delete">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="px-4 py-2 border-t border-slate-100 bg-slate-50/50 text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">End of notifications</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationDropdown;
