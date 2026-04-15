import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

// ─── Animation Variants ───────────────────────────────────────────────────────
const slideVariants = {
  enter: (dir) => ({ x: dir > 0 ? 56 : -56, opacity: 0 }),
  center: { x: 0, opacity: 1, transition: { duration: 0.38, ease: [0.4, 0, 0.2, 1] } },
  exit:   (dir) => ({ x: dir > 0 ? -56 : 56, opacity: 0, transition: { duration: 0.25, ease: [0.4, 0, 0.2, 1] } }),
};

const STEP_EMAIL  = 'email';
const STEP_SIGNIN = 'signin';
const STEP_SIGNUP = 'signup';

// ─── Sub-components ───────────────────────────────────────────────────────────
const GlassInput = ({ id, type = 'text', placeholder, value, onChange, autoFocus }) => (
  <input
    id={id}
    type={type}
    autoFocus={autoFocus}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    className="w-full px-4 py-3.5 bg-white/60 border border-slate-200/80 rounded-xl outline-none
      focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all duration-200
      text-slate-800 placeholder-slate-400 text-sm font-medium shadow-sm"
  />
);

const PrimaryBtn = ({ id, type = 'submit', onClick, disabled, loading, children, gradient = 'from-indigo-600 to-violet-600' }) => (
  <button
    id={id}
    type={type}
    onClick={onClick}
    disabled={disabled}
    className={`w-full py-3.5 px-4 flex items-center justify-center gap-2
      bg-gradient-to-r ${gradient} hover:brightness-110
      text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-500/25 hover:shadow-xl
      transition-all duration-200 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed`}
  >
    {loading ? <Spinner /> : children}
  </button>
);

const Spinner = () => (
  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
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
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
    {label}
  </button>
);

// ─── Floating 3D Illustration Panel ──────────────────────────────────────────
const IllustrationPanel = () => (
  <div className="hidden lg:flex flex-col items-center justify-center relative p-12 overflow-hidden">
    {/* Soft gradient backdrop blobs */}
    <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700" />
    <div className="absolute top-[-20%] right-[-15%] w-80 h-80 bg-blue-400/30 rounded-full blur-3xl" />
    <div className="absolute bottom-[-10%] left-[-10%] w-80 h-80 bg-purple-400/30 rounded-full blur-3xl" />

    {/* Grid pattern overlay */}
    <div className="absolute inset-0 opacity-10"
      style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '28px 28px' }}
    />

    <div className="relative z-10 flex flex-col items-center text-center">
      {/* Floating illustration */}
      <motion.div
        animate={{ y: [0, -18, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        className="w-80 h-80 drop-shadow-2xl"
      >
        <img
          src="/login-illustration.png"
          alt="Smart Campus 3D Illustration"
          className="w-full h-full object-contain"
        />
      </motion.div>

      {/* Badge chips floating around */}
      <motion.div
        animate={{ y: [0, -8, 0], rotate: [-2, 2, -2] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
        className="absolute top-16 left-8 bg-white/20 backdrop-blur-sm border border-white/30
          rounded-xl px-3 py-2 flex items-center gap-2 shadow-lg"
      >
        <span className="text-lg">📅</span>
        <span className="text-white text-xs font-semibold">Room Booked!</span>
      </motion.div>
      <motion.div
        animate={{ y: [0, -10, 0], rotate: [2, -2, 2] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        className="absolute top-24 right-6 bg-white/20 backdrop-blur-sm border border-white/30
          rounded-xl px-3 py-2 flex items-center gap-2 shadow-lg"
      >
        <span className="text-lg">🎓</span>
        <span className="text-white text-xs font-semibold">12 Students</span>
      </motion.div>
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
        className="absolute bottom-40 right-4 bg-emerald-400/30 backdrop-blur-sm border border-white/30
          rounded-xl px-3 py-2 flex items-center gap-2 shadow-lg"
      >
        <span className="text-lg">✅</span>
        <span className="text-white text-xs font-semibold">Access Granted</span>
      </motion.div>

      {/* Text below illustration */}
      <div className="mt-4">
        <h2 className="text-3xl font-black text-white tracking-tight leading-tight">
          Smart Campus Hub
        </h2>
        <p className="text-indigo-200 font-medium text-sm mt-2 max-w-xs">
          Book resources, manage spaces, and collaborate — all in one beautifully designed platform.
        </p>
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-6 mt-8">
        {[['500+', 'Students'], ['24/7', 'Access'], ['50+', 'Resources']].map(([num, label]) => (
          <div key={label} className="text-center">
            <p className="text-white font-black text-lg">{num}</p>
            <p className="text-indigo-300 text-xs font-medium">{label}</p>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const ModernLogin = () => {
  const navigate   = useNavigate();
  const { login }  = useAuth();

  const [step, setStep]         = useState(STEP_EMAIL);
  const [direction, setDirection] = useState(1);
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole]         = useState('STUDENT');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const goTo  = (next, dir = 1) => { setDirection(dir); setError(''); setStep(next); };
  const goBack = () => { setPassword(''); goTo(STEP_EMAIL, -1); };

  const handleEmailNext = async (e) => {
    e.preventDefault();
    if (!email.trim()) { setError('Please enter your email address.'); return; }
    setLoading(true); setError('');
    try {
      const { data: exists } = await axios.post('http://localhost:8080/api/auth/check-email', { email: email.trim().toLowerCase() });
      goTo(exists ? STEP_SIGNIN : STEP_SIGNUP);
    } catch { setError('Could not reach the server. Please try again.'); }
    finally { setLoading(false); }
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    if (!password.trim()) { setError('Please enter your password.'); return; }
    setLoading(true); setError('');
    try {
      const { data } = await axios.post('http://localhost:8080/api/auth/login', { email: email.trim().toLowerCase(), password });
      login({ email: email.trim().toLowerCase(), name: email.split('@')[0], role: data.role, status: data.status });
      navigate(data.role === 'ADMIN' && data.status === 'PENDING_ADMIN' ? '/waiting' : '/dashboard');
    } catch (err) { setError(err.response?.data?.error || 'Invalid email or password.'); }
    finally { setLoading(false); }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (!password.trim()) { setError('Please create a password.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true); setError('');
    try {
      const { data } = await axios.post('http://localhost:8080/api/auth/register', { email: email.trim().toLowerCase(), password, role });
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
            <div className="flex items-center gap-2.5 mb-8">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
                </svg>
              </div>
              <span className="text-sm font-bold text-slate-700 tracking-tight">Smart Campus Hub</span>
            </div>

            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Welcome back 👋</h2>
            <p className="text-sm text-slate-500 font-medium mt-1 mb-7">Enter your email to continue</p>

            <form className="space-y-4" onSubmit={handleEmailNext}>
              <div>
                <label htmlFor="input-email" className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
                  Email Address
                </label>
                <GlassInput id="input-email" type="email" placeholder="you@university.edu"
                  value={email} onChange={(e) => setEmail(e.target.value)} autoFocus />
              </div>
              {error && <ErrorMsg msg={error} />}
              <PrimaryBtn id="btn-next" loading={loading} gradient="from-indigo-600 to-violet-600">
                Continue →
              </PrimaryBtn>
            </form>

            <Divider />
            <GoogleBtn onClick={handleGoogle} />

            <p className="text-center text-xs text-slate-400 mt-6">
              By continuing you agree to our{' '}
              <a href="#" className="text-indigo-500 hover:underline font-semibold">Terms</a> &{' '}
              <a href="#" className="text-indigo-500 hover:underline font-semibold">Privacy Policy</a>
            </p>
          </motion.div>
        );

      case STEP_SIGNIN:
        return (
          <motion.div key="signin" custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit">
            <BackBtn onClick={goBack} />

            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mb-5 shadow-lg shadow-emerald-500/30">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Welcome back!</h2>
            <p className="text-sm text-slate-500 mt-1 mb-7 font-medium">
              Signing in as <span className="font-bold text-indigo-600">{email}</span>
            </p>

            <form className="space-y-4" onSubmit={handleSignIn}>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="password-signin" className="text-xs font-bold text-slate-600 uppercase tracking-wider">Password</label>
                  <a href="#" className="text-xs font-semibold text-indigo-500 hover:text-indigo-700 transition-colors">Forgot password?</a>
                </div>
                <GlassInput id="password-signin" type="password" placeholder="Enter your password"
                  value={password} onChange={(e) => setPassword(e.target.value)} autoFocus />
              </div>
              {error && <ErrorMsg msg={error} />}
              <PrimaryBtn id="btn-signin" loading={loading} gradient="from-emerald-500 to-teal-600">
                Sign In
              </PrimaryBtn>
            </form>
          </motion.div>
        );

      case STEP_SIGNUP:
        return (
          <motion.div key="signup" custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit">
            <BackBtn onClick={goBack} />

            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center mb-5 shadow-lg shadow-violet-500/30">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/>
              </svg>
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Create account</h2>
            <p className="text-sm text-slate-500 mt-1 mb-7 font-medium">
              Registering <span className="font-bold text-indigo-600">{email}</span>
            </p>

            <form className="space-y-4" onSubmit={handleSignUp}>
              <div>
                <label htmlFor="password-signup" className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
                  Create Password
                </label>
                <GlassInput id="password-signup" type="password" placeholder="Min. 6 characters"
                  value={password} onChange={(e) => setPassword(e.target.value)} autoFocus />
              </div>

              {/* Role Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wider">I am a...</label>
                <div className="grid grid-cols-2 gap-2.5">
                  {[['STUDENT', '🎓', 'Student', 'from-indigo-500 to-blue-600'], ['ADMIN', '🛡️', 'Admin', 'from-violet-500 to-purple-600']].map(([r, emoji, label, grad]) => (
                    <button key={r} type="button" id={`role-${r.toLowerCase()}`} onClick={() => setRole(r)}
                      className={`py-3 px-3 rounded-xl border-2 font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2
                        ${role === r
                          ? `bg-gradient-to-br ${grad} border-transparent text-white shadow-lg`
                          : 'bg-white/60 border-slate-200 text-slate-600 hover:border-indigo-300 hover:bg-indigo-50/50'}`}
                    >
                      <span>{emoji}</span> {label}
                    </button>
                  ))}
                </div>
                {role === 'ADMIN' && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                    className="mt-2 text-xs text-amber-600 font-medium bg-amber-50 border border-amber-200 rounded-lg px-3 py-2"
                  >
                    ⏳ Admin accounts require approval before accessing the dashboard.
                  </motion.p>
                )}
              </div>

              {error && <ErrorMsg msg={error} />}
              <PrimaryBtn id="btn-create-account" loading={loading} gradient="from-violet-600 to-purple-700">
                Create Account
              </PrimaryBtn>
            </form>

            <Divider />
            <GoogleBtn onClick={handleGoogle} label="Sign up with Google" />
          </motion.div>
        );

      default: return null;
    }
  };

  return (
    <div 
      className="relative min-h-screen flex items-center justify-center p-4 lg:p-0 overflow-hidden bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50 animate-gradient"
      style={{ backgroundSize: '400% 400%' }}
    >
      
      {/* Interactive Floating Blurred Circles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{ x: [0, 80, 0], y: [0, -80, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-[-10%] left-[-5%] w-[45vw] h-[45vw] bg-indigo-300/30 rounded-full blur-[100px]"
        />
        <motion.div
          animate={{ x: [0, -80, 0], y: [0, 80, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-[-10%] right-[-5%] w-[55vw] h-[55vw] bg-purple-300/30 rounded-full blur-[120px]"
        />
        <motion.div
          animate={{ x: [0, 50, -50, 0], y: [0, 50, -50, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-[20%] right-[20%] w-[35vw] h-[35vw] bg-blue-300/30 rounded-full blur-[90px]"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        className="relative z-10 w-full max-w-5xl bg-white/70 backdrop-blur-2xl border border-white/60 
          rounded-3xl shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] overflow-hidden
          grid grid-cols-1 lg:grid-cols-2"
        style={{ minHeight: '600px' }}
      >
        {/* Left — Illustration (desktop only) */}
        <IllustrationPanel />

        {/* Right — Form panel */}
        <div className="flex flex-col justify-center px-8 sm:px-12 py-12 lg:py-16 bg-white/40">
          <AnimatePresence mode="wait" custom={direction}>
            {renderStep()}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default ModernLogin;
