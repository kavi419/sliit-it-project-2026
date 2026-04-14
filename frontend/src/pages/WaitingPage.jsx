import React from 'react';
import { motion } from 'framer-motion';

/**
 * Shown to ADMIN users whose accounts are in PENDING_ADMIN status.
 * They cannot access the dashboard until a super-admin approves them.
 */
const WaitingPage = () => {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden
      bg-gradient-to-br from-blue-900 via-purple-800 to-slate-900">

      {/* Background blobs */}
      <div className="absolute top-0 left-[-10%] w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-30 animate-blob" />
      <div className="absolute bottom-[-10%] right-[-5%] w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-30 animate-blob animation-delay-2000" />

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        className="relative z-10 w-full max-w-md p-10 bg-white/60 backdrop-blur-2xl
          border border-white/40 rounded-[2rem] shadow-2xl text-center"
      >
        {/* Animated clock icon */}
        <motion.div
          animate={{ rotate: [0, 10, -10, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          className="inline-flex items-center justify-center w-20 h-20 rounded-2xl
            bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg mb-6"
        >
          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </motion.div>

        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight mb-3">
          Pending Approval
        </h1>
        <p className="text-slate-600 font-medium leading-relaxed mb-6">
          Your <span className="font-bold text-purple-700">Admin</span> account has been created
          successfully. A super-admin will review and activate your account shortly.
        </p>

        {/* Progress dots */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.4 }}
              className="w-2.5 h-2.5 rounded-full bg-purple-500"
            />
          ))}
        </div>

        <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 text-sm text-amber-800 font-medium">
          📧 You'll receive an email notification once your account is activated.
        </div>

        <button
          id="btn-back-to-login"
          onClick={() => window.location.href = '/login'}
          className="mt-6 text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          ← Back to Login
        </button>
      </motion.div>
    </div>
  );
};

export default WaitingPage;
