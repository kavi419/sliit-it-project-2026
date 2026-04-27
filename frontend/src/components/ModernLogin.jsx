import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Mail, Lock, User, Shield } from 'lucide-react';
const slideVariants = {
  enter: (dir) => ({ x: dir > 0 ? 56 : -56, opacity: 0 }),
  center: { x: 0, opacity: 1, transition: { duration: 0.38, ease: [0.4, 0, 0.2, 1] } },
  exit: (dir) => ({ x: dir > 0 ? -56 : 56, opacity: 0, transition: { duration: 0.25, ease: [0.4, 0, 0.2, 1] } }),
};

const STEP_EMAIL = 'email';
const STEP_SIGNIN = 'signin';
const STEP_SIGNUP = 'signup';

const CleanInput = ({ id, type = 'text', placeholder, value, onChange, autoFocus }) => (
  <input
    id={id}
    type={type}
    autoFocus={autoFocus}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    className="w-full py-3 px-4 bg-white border border-slate-200 rounded-lg outline-none
      focus:ring-2 focus:ring-[#3b522b]/20 focus:border-[#3b522b] transition-all duration-200
      text-slate-900 placeholder-slate-400 text-sm font-medium shadow-sm"
  />
);

const SolidBtn = ({ id, type = 'submit', onClick, disabled, loading, children }) => (
  <button
    id={id}
    type={type}
    onClick={onClick}
    disabled={disabled}
    className={`w-full py-3.5 px-4 flex items-center justify-center gap-2
      bg-[#3b522b] hover:bg-[#2c3d20]
      text-white text-sm font-bold rounded-lg shadow-md hover:shadow-lg
      transition-all duration-300 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed`}
  >
    {loading ? <Spinner /> : children}
  </button>
);

const Spinner = () => (
  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
  </svg>
);

const BackBtn = ({ onClick }) => (
  <button
    type="button" id="btn-back" onClick={onClick}
    className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-slate-700
      transition-colors mb-4 group"
  >
    <span className="group-hover:-translate-x-0.5 transition-transform inline-block">←</span>
    Back
  </button>
);

const ErrorMsg = ({ msg }) => (
  <motion.p
    initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
    className="text-xs text-red-500 font-semibold px-1 py-1.5 bg-red-50 rounded-lg border border-red-100"
  >
    ⚠ {msg}
  </motion.p>
);

const Divider = () => (
  <div className="flex items-center gap-3 my-4">
    <div className="flex-1 h-px bg-slate-200" />
    <span className="text-xs text-slate-400 font-medium">or</span>
    <div className="flex-1 h-px bg-slate-200" />
  </div>
);

const GoogleBtn = ({ onClick, label = 'Continue with Google' }) => (
  <button
    type="button" id="btn-google" onClick={onClick}
    className="w-full py-3 px-4 flex items-center justify-center gap-3
      bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300
      text-slate-700 text-sm font-semibold rounded-xl shadow-sm hover:shadow-md
      transition-all duration-200 active:scale-[0.98]"
  >
    <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
    {label}
  </button>
);

// ─── Premium Connectivity Animation ──────────────────────────────────────────
const ConnectivityAnimation = () => {
  return (
    <div className="absolute inset-0 bg-[#0a0a1a] overflow-hidden">
      {/* Dynamic Gradient Background */}
      <motion.div
        animate={{
          background: [
            'radial-gradient(circle at 20% 30%, #1e1b4b 0%, #0a0a1a 100%)',
            'radial-gradient(circle at 80% 70%, #1e1b4b 0%, #0a0a1a 100%)',
            'radial-gradient(circle at 20% 30%, #1e1b4b 0%, #0a0a1a 100%)'
          ]
        }}
        transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
        className="absolute inset-0"
      />

      {/* Floating Connectivity Nodes */}
      <div className="absolute inset-0 opacity-40">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ x: Math.random() * 800, y: Math.random() * 800, opacity: 0 }}
            animate={{
              x: [null, Math.random() * 800, Math.random() * 800],
              y: [null, Math.random() * 800, Math.random() * 800],
              opacity: [0, 0.6, 0]
            }}
            transition={{ duration: 20 + Math.random() * 10, repeat: Infinity, ease: 'linear' }}
            className="absolute w-1.5 h-1.5 bg-indigo-400 rounded-full shadow-[0_0_12px_#6366f1]"
          />
        ))}
        {/* SVG Lines Connecting Nodes (Animated) */}
        <svg className="absolute inset-0 w-full h-full">
          {[...Array(10)].map((_, i) => (
            <motion.line
              key={i}
              x1={Math.random() * 100 + '%'}
              y1={Math.random() * 100 + '%'}
              x2={Math.random() * 100 + '%'}
              y2={Math.random() * 100 + '%'}
              stroke="rgba(99, 102, 241, 0.1)"
              strokeWidth="1"
              animate={{ opacity: [0, 0.2, 0] }}
              transition={{ duration: 10 + Math.random() * 10, repeat: Infinity, delay: i * 2 }}
            />
          ))}
        </svg>
      </div>

      {/* Glowing Orbs */}
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px]"
      />
      <motion.div
        animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
        className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-violet-600/20 rounded-full blur-[100px]"
      />

      {/* Premium Centered Logo & Text */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-12">
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="relative mb-10 group cursor-default"
        >
          <div className="absolute inset-0 bg-indigo-500 blur-3xl opacity-20 group-hover:opacity-40 transition-opacity rounded-full" />
          <div className="relative w-48 h-48 bg-white/5 backdrop-blur-2xl rounded-[2.5rem] border border-white/10 flex items-center justify-center shadow-2xl overflow-hidden">
            {/* Scanning effect */}
            <motion.div
              animate={{ y: [-100, 200] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-400 to-transparent opacity-50"
            />
            <svg className="w-24 h-24 text-indigo-400 drop-shadow-[0_0_15px_rgba(129,140,248,0.5)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
        </motion.div>

        <h2 className="text-4xl font-black text-white tracking-tight mb-4">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-200 to-indigo-400">
            Smart Campus Hub
          </span>
        </h2>
        <p className="text-indigo-200/60 font-medium text-lg max-w-sm mx-auto leading-relaxed">
          The central pulse of your academic journey.
          Connected, intelligent, and designed for you.
        </p>

        {/* Floating Stats Or Badges */}
        <div className="flex gap-4 mt-12">
          {[{ label: 'Fast', icon: '⚡' }, { label: 'Secure', icon: '🔒' }, { label: 'Smart', icon: '🧠' }].map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + idx * 0.1 }}
              className="px-4 py-2 bg-white/5 backdrop-blur-md rounded-full border border-white/5 text-[10px] font-bold text-indigo-300 uppercase tracking-widest flex items-center gap-2"
            >
              <span>{item.icon}</span> {item.label}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const ModernLogin = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [step, setStep] = useState(STEP_EMAIL);
  const [direction, setDirection] = useState(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('STUDENT');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const goTo = (next, dir = 1) => { setDirection(dir); setError(''); setStep(next); };
  const goBack = () => { setPassword(''); goTo(STEP_EMAIL, -1); };

  const handleEmailNext = async (e) => {
    e.preventDefault();
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail) {
      setError('Please enter your email address.');
      return;
    }

    //Email Format Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setError('Please enter a valid email address (e.g., you@university.edu).');
      return;
    }

    setLoading(true); setError('');
    try {
      const { data: exists } = await axios.post('/api/auth/check-email', { email: trimmedEmail });
      goTo(exists ? STEP_SIGNIN : STEP_SIGNUP);
    } catch { setError('Could not reach the server. Please try again.'); }
    finally { setLoading(false); }
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    if (!password.trim()) { setError('Please enter your password.'); return; }
    setLoading(true); setError('');
    try {
      const { data } = await axios.post('/api/auth/login', { email: email.trim().toLowerCase(), password }, { withCredentials: true });
      login({ email: email.trim().toLowerCase(), name: email.split('@')[0], role: data.role, status: data.status });
      navigate(data.role === 'ADMIN' && data.status === 'PENDING_ADMIN' ? '/waiting' : '/dashboard');
    } catch (err) { setError(err.response?.data?.error || 'Invalid email or password.'); }
    finally { setLoading(false); }
  };

  //Password Length Validation
  const handleSignUp = async (e) => {
    e.preventDefault();
    if (!password.trim()) { setError('Please create a password.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true); setError('');
    try {
      const { data } = await axios.post('/api/auth/register', { email: email.trim().toLowerCase(), password, role }, { withCredentials: true });
      login({ email: email.trim().toLowerCase(), name: email.split('@')[0], role: data.role, status: data.status });
      navigate(data.status === 'PENDING_ADMIN' ? '/waiting' : '/dashboard');
    } catch (err) { setError(err.response?.data?.error || 'Registration failed. Please try again.'); }
    finally { setLoading(false); }
  };

  const handleGoogle = () => { window.location.href = 'http://localhost:8080/oauth2/authorization/google'; };

  // ── Step renders ────────────────────────────────────────────────────────────
  const renderStep = () => {
    switch (step) {

      case STEP_EMAIL:
        return (
          <motion.div key="email" custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit">
            {/* Logo mark */}
            <div className="flex items-center gap-3 mb-12">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-xl shadow-indigo-500/20">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <span className="text-lg font-black text-slate-900 tracking-tight">Smart Campus Hub</span>
            </div>

            <h2 className="text-[32px] font-black text-slate-900 tracking-tight mb-2">Get Started Now</h2>
            <p className="text-slate-500 font-medium mb-10">Enter your university email to join the hub.</p>

            <form className="space-y-6" onSubmit={handleEmailNext}>
              <div>
                <label htmlFor="input-email" className="block text-xs font-bold text-slate-800 mb-2 uppercase tracking-widest">
                  Email Address
                </label>
                <input
                  id="input-email" type="email" placeholder="you@university.edu"
                  value={email} onChange={(e) => setEmail(e.target.value)} autoFocus
                  className="w-full py-4 px-5 bg-white border border-slate-200 rounded-xl outline-none
                    focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all duration-200
                    text-slate-900 placeholder-slate-400 text-sm font-semibold shadow-sm"
                />
              </div>
              {error && <ErrorMsg msg={error} />}
              <button
                id="btn-next" type="submit" disabled={loading}
                className="w-full py-4 px-6 flex items-center justify-center gap-2
                  bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl shadow-lg
                  shadow-indigo-500/25 transition-all duration-300 active:scale-[0.98] disabled:opacity-60"
              >
                {loading ? <Spinner /> : 'Continue'}
              </button>
            </form>

            <Divider />
            <GoogleBtn onClick={handleGoogle} />

            <p className="text-center text-xs text-slate-400 mt-8 font-medium">
              By continuing you agree to our{' '}
              <a href="#" className="text-indigo-600 hover:underline font-bold">Terms</a> &{' '}
              <a href="#" className="text-indigo-600 hover:underline font-bold">Privacy Policy</a>
            </p>
          </motion.div>
        );

      case STEP_SIGNIN:
        return (
          <motion.div key="signin" custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit">
            <BackBtn onClick={goBack} />

            <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center mb-6">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-[32px] font-black text-slate-900 tracking-tight">Sign In</h2>
            <p className="text-slate-500 font-medium mb-10">
              Welcome back, <span className="text-indigo-600 font-bold">{email}</span>
            </p>

            <form className="space-y-6" onSubmit={handleSignIn}>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="password-signin" className="text-xs font-bold text-slate-800 uppercase tracking-widest">Password</label>
                  <a href="#" className="text-xs font-bold text-indigo-600 hover:text-indigo-800">Forgot?</a>
                </div>
                <input
                  id="password-signin" type="password" placeholder="••••••••"
                  value={password} onChange={(e) => setPassword(e.target.value)} autoFocus
                  className="w-full py-4 px-5 bg-white border border-slate-200 rounded-xl outline-none
                    focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all duration-200
                    text-slate-900 text-sm font-semibold shadow-sm"
                />
              </div>
              {error && <ErrorMsg msg={error} />}
              <button
                id="btn-signin" type="submit" disabled={loading}
                className="w-full py-4 px-6 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl shadow-lg
                  shadow-indigo-500/25 transition-all duration-300 active:scale-[0.98]"
              >
                {loading ? <Spinner /> : 'Sign In'}
              </button>
            </form>
          </motion.div>
        );

      case STEP_SIGNUP:
        return (
          <motion.div key="signup" custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit">
            <BackBtn onClick={goBack} />

            <h2 className="text-[32px] font-black text-slate-900 tracking-tight mb-2">Join the Hub</h2>
            <p className="text-slate-500 font-medium mb-10">
              Creating account for <span className="text-indigo-600 font-bold">{email}</span>
            </p>

            <form className="space-y-6" onSubmit={handleSignUp}>
              <div>
                <label htmlFor="password-signup" className="block text-xs font-bold text-slate-800 mb-2 uppercase tracking-widest">
                  Create Password
                </label>
                <input
                  id="password-signup" type="password" placeholder="Min. 6 characters"
                  value={password} onChange={(e) => setPassword(e.target.value)} autoFocus
                  className="w-full py-4 px-5 bg-white border border-slate-200 rounded-xl outline-none
                    focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all duration-200
                    text-slate-900 text-sm font-semibold shadow-sm"
                />
              </div>

              {/* Role Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-2 uppercase tracking-widest">Select Role</label>
                <div className="grid grid-cols-2 gap-4">
                  {[['STUDENT', <User className="w-5 h-5" />, 'Student'], ['ADMIN', <Shield className="w-5 h-5" />, 'Admin']].map(([r, iconNode, label]) => (
                    <button key={r} type="button" id={`role-${r.toLowerCase()}`} onClick={() => setRole(r)}
                      className={`py-4 px-4 rounded-xl border-2 font-bold text-sm transition-all duration-200 flex flex-col items-center gap-2
                        ${role === r
                          ? `border-indigo-600 bg-indigo-50 text-indigo-700 shadow-inner`
                          : 'border-slate-100 bg-slate-50 text-slate-400 hover:border-indigo-200 hover:bg-white'}`}
                    >
                      <div className={role === r ? 'text-indigo-600' : 'text-slate-300'}>{iconNode}</div>
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              //Terms and Conditions Checkbox validation
              <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-xl">
                <input type="checkbox" id="terms" className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" required />
                <label htmlFor="terms" className="text-xs text-slate-600 font-semibold leading-relaxed">
                  I agree to the <a href="#" className="text-indigo-600 hover:underline">Terms of Service</a> and <a href="#" className="text-indigo-600 hover:underline">Privacy Policy</a>
                </label>
              </div>

              {error && <ErrorMsg msg={error} />}
              <button
                id="btn-create-account" type="submit" disabled={loading}
                className="w-full py-4 px-6 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl shadow-lg
                  shadow-indigo-500/25 transition-all duration-300 active:scale-[0.98]"
              >
                {loading ? <Spinner /> : 'Complete Registration'}
              </button>
            </form>
          </motion.div>
        );

      default: return null;
    }
  };

  return (
    <div className="w-full h-screen flex flex-col-reverse lg:flex-row overflow-hidden bg-white">
      {/* Left — Premium Form panel */}
      <div className="w-full lg:w-[42%] h-full flex flex-col justify-center px-8 sm:px-16 lg:px-24 bg-white overflow-y-auto z-20 relative">
        <div className="w-full max-w-[420px] mx-auto py-16">
          <AnimatePresence mode="wait" custom={direction}>
            {renderStep()}
          </AnimatePresence>
        </div>
      </div>

      {/* Right — Premium Animation panel */}
      <div className="hidden lg:block lg:w-[58%] h-full relative z-10 shadow-[-20px_0_40px_rgba(0,0,0,0.1)]">
        <ConnectivityAnimation />
      </div>
    </div>
  );
};

export default ModernLogin;
