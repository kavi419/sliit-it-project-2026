import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UploadCloud, File, XCircle } from 'lucide-react';
import api from '../../utils/axiosConfig';

const isValidPreferredContact = (contact) => {
  const value = contact.trim();
  if (!value) return true;

  const normalized = value.replace(/[\s-]/g, '');
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const sriLankaPhoneRegex = /^(?:0\d{9}|\+94\d{9}|94\d{9})$/;
  const startsWithUppercase = /^[A-Z]/.test(value);

  if (emailRegex.test(value)) {
    return !startsWithUppercase;
  }

  return sriLankaPhoneRegex.test(normalized);
};

const CreateTicketModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'OTHER',
    priority: 'MEDIUM',
    location: '',
    resourceName: '',
    preferredContact: ''
  });
  
  const [files, setFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (files.length + selectedFiles.length > 3) {
      setError('You can only upload a maximum of 3 files.');
      return;
    }
    setError('');
    setFiles(prev => [...prev, ...selectedFiles]);
  };

  const removeFile = (indexToRemove) => {
    setFiles(files.filter((_, index) => index !== indexToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const contact = formData.preferredContact.trim();
    if (contact && !isValidPreferredContact(contact)) {
      setError('Enter a valid email (must not start with a capital letter) or Sri Lankan phone number (e.g. 0771234567 or +94771234567).');
      return;
    }

    setIsSubmitting(true);

    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        data.append(key, formData[key]);
      });
      
      files.forEach(file => {
        data.append('files', file);
      });

      await api.post('/api/tickets', data);
      
      onSuccess();
      onClose();
      // Reset form
      setFormData({
        title: '', description: '', category: 'OTHER', priority: 'MEDIUM', location: '', resourceName: '', preferredContact: ''
      });
      setFiles([]);
      
    } catch (err) {
      setError(err.response?.data?.message || 'Error submitting ticket');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           exit={{ opacity: 0 }}
           className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
           onClick={onClose}
        />
        
        <motion.div
             initial={{ opacity: 0, scale: 0.95, y: 20 }}
             animate={{ opacity: 1, scale: 1, y: 0 }}
             exit={{ opacity: 0, scale: 0.95, y: 20 }}
             className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden glass-card flex flex-col max-h-[90vh]"
        >
          <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
            <div>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">Report an Issue</h2>
              <p className="text-slate-500 font-medium text-sm mt-1">Submit a new maintenance ticket</p>
            </div>
            <button onClick={onClose} className="p-2 bg-slate-50 hover:bg-slate-100 rounded-full text-slate-500 transition-colors">
               <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-8 overflow-y-auto">
            {error && (
              <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-bold flex items-center gap-2 border border-red-100">
                 <XCircle className="w-5 h-5" /> {error}
              </div>
            )}
            
            <form id="create-ticket-form" onSubmit={handleSubmit} className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Issue Title *</label>
                  <input required name="title" value={formData.title} onChange={handleInputChange} 
                         className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                         placeholder="e.g. Broken Projector" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Category *</label>
                  <select required name="category" value={formData.category} onChange={handleInputChange}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all appearance-none cursor-pointer">
                    <option value="ELECTRICAL">Electrical</option>
                    <option value="NETWORK">Network / Internet</option>
                    <option value="EQUIPMENT">Equipment</option>
                    <option value="AIR_CONDITIONING">Air Conditioning</option>
                    <option value="ROOM_DAMAGE">Room Damage</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Priority *</label>
                    <select required name="priority" value={formData.priority} onChange={handleInputChange}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all appearance-none cursor-pointer">
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                      <option value="CRITICAL">Critical</option>
                    </select>
                 </div>
                 <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Location *</label>
                    <input required name="location" value={formData.location} onChange={handleInputChange}
                           className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                           placeholder="e.g. Lab 03" />
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Resource Name/ID (optional)</label>
                    <input name="resourceName" value={formData.resourceName} onChange={handleInputChange}
                           className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                           placeholder="e.g. Projector P-12" />
                 </div>
                 <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Preferred Contact</label>
                    <input name="preferredContact" value={formData.preferredContact} onChange={handleInputChange}
                           className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                           placeholder="Phone number or email" />
                    <p className="text-xs text-slate-500 font-medium">Use a valid email or Sri Lankan number (0771234567, 0112345678, +94771234567).</p>
                 </div>
              </div>

              <div className="space-y-2">
                 <label className="text-sm font-bold text-slate-700">Description *</label>
                 <textarea required name="description" value={formData.description} onChange={handleInputChange} rows={3}
                           className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none"
                           placeholder="Please describe the issue in detail..." />
              </div>

              <div className="space-y-3">
                 <label className="text-sm font-bold text-slate-700">Attachments (Max 3)</label>
                 <div className="w-full border-2 border-dashed border-slate-300 rounded-2xl p-6 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer relative">
                    <input type="file" multiple accept="image/*" onChange={handleFileChange} disabled={files.length >= 3} 
                           className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed" />
                    <UploadCloud className="w-8 h-8 text-indigo-400 mb-2" />
                    <p className="text-sm font-medium text-slate-600">Click or drag images to upload</p>
                    <p className="text-xs text-slate-400 mt-1">PNG, JPG up to 5MB</p>
                 </div>
                 
                 {files.length > 0 && (
                   <ul className="space-y-2 mt-4">
                     {files.map((file, idx) => (
                       <li key={idx} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl shadow-sm">
                          <div className="flex items-center gap-3 overflow-hidden">
                             <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                                <File className="w-4 h-4" />
                             </div>
                             <span className="text-sm font-medium text-slate-700 truncate max-w-[200px]">{file.name}</span>
                          </div>
                          <button type="button" onClick={() => removeFile(idx)} className="p-1 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded transition-colors">
                             <X className="w-4 h-4" />
                          </button>
                       </li>
                     ))}
                   </ul>
                 )}
              </div>
            </form>
          </div>
          
          <div className="px-8 py-5 border-t border-slate-100 bg-slate-50 sticky bottom-0 z-10 flex gap-4 justify-end">
             <button type="button" onClick={onClose} disabled={isSubmitting} className="px-6 py-2.5 font-bold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors">
                Cancel
             </button>
             <button type="submit" form="create-ticket-form" disabled={isSubmitting} className="px-8 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-md shadow-indigo-600/20 disabled:opacity-70 flex items-center justify-center min-w-[120px]">
                {isSubmitting ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Submit Ticket'}
             </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CreateTicketModal;
