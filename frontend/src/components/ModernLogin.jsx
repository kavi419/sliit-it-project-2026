import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// ─── Animation Variants ───────────────────────────────────────────────────────
const slideVariants = {
  enter: (direction) => ({
    x: direction > 0 ? 60 : -60,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.35, ease: [0.4, 0, 0.2, 1] },
  },
  exit: (direction) => ({
    x: direction > 0 ? -60 : 60,
    opacity: 0,
    transition: { duration: 0.25, ease: [0.4, 0, 0.2, 1] },
  }),
};

// ─── Step identifiers ─────────────────────────────────────────────────────────
const STEP_EMAIL   = 'email';
const STEP_SIGNIN  = 'signin';
const STEP_SIGNUP  = 'signup';

// ─── Reusable Input ───────────────────────────────────────────────────────────
const GlassInput = ({ id, type = 'text', placeholder, value, onChange, autoFocus }) => (
  <input
    id={id}
    type={type}
    autoFocus={autoFocus}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    className="w-full px-5 py-4 bg-white/50 border border-slate-300/40 rounded-2xl outline-none
      focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500/50 transition-all
      text-slate-800 placeholder-slate-400 font-medium"
  />
);

// ─── Spinner ──────────────────────────────────────────────────────────────────
const Spinner = () => (
  <svg
    className="animate-spin h-5 w-5 text-white"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
    />
  </svg>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const ModernLogin = () => {
  const navigate = useNavigate();

  const [step, setStep]         = useState(STEP_EMAIL);
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = back

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole]         = useState('STUDENT');

  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  // ── Navigation helpers ──────────────────────────────────────────────────────
  const goTo = (nextStep, dir = 1) => {
    setDirection(dir);
    setError('');
    setStep(nextStep);
  };

  const goBack = () => {
    setPassword('');
    goTo(STEP_EMAIL, -1);
  };

  // ── Email check ─────────────────────────────────────────────────────────────
  const handleEmailNext = async (e) => {
    e.preventDefault();
    if (!email.trim()) { setError('Please enter your email address.'); return; }

    setLoading(true);
    setError('');

    try {
      const { data: exists } = await axios.post(
        'http://localhost:8080/api/auth/check-email',
        { email: email.trim().toLowerCase() }
      );
      goTo(exists ? STEP_SIGNIN : STEP_SIGNUP, 1);
    } catch (err) {
      setError('Could not reach the server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Sign In submit ──────────────────────────────────────────────────────────
  const handleSignIn = async (e) => {
    e.preventDefault();
    if (!password.trim()) { setError('Please enter your password.'); return; }

    setLoading(true);
    setError('');

    try {
      const { data } = await axios.post(
        'http://localhost:8080/api/auth/login',
        { email: email.trim().toLowerCase(), password }
      );

      // Redirect based on role and status
      if (data.role === 'ADMIN' && data.status === 'PENDING_ADMIN') {
        navigate('/waiting');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      const msg = err.response?.data?.error || 'Invalid email or password.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // ── Sign Up submit ──────────────────────────────────────────────────────────
  const handleSignUp = async (e) => {
    e.preventDefault();
    if (!password.trim()) { setError('Please create a password.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }

    setLoading(true);
    setError('');

    try {
      const { data } = await axios.post(
        'http://localhost:8080/api/auth/register',
        { email: email.trim().toLowerCase(), password, role }
      );

      // Admin accounts need approval before accessing dashboard
      if (data.status === 'PENDING_ADMIN') {
        navigate('/waiting');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      const msg = err.response?.data?.error || 'Registration failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // ── Google OAuth ────────────────────────────────────────────────────────────
  const handleGoogle = () => {
    window.location.href = 'http://localhost:8080/oauth2/authorization/google';
  };

  // ── Rendered steps ──────────────────────────────────────────────────────────
  const renderStep = () => {
    switch (step) {

      // ── STEP 1: Email ───────────────────────────────────────────────────────
      case STEP_EMAIL:
        return (
          <motion.div
            key="email"
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
          >
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 shadow-lg mb-4">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
              </div>
              <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Welcome</h2>
              <p className="text-sm text-slate-500 mt-1 font-medium">Enter your email to get started</p>
            </div>

            <form className="space-y-5" onSubmit={handleEmailNext}>
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-slate-700 ml-1 mb-2">
                  Email Address
                </label>
                <GlassInput
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoFocus
                />
              </div>

              {error && <ErrorMsg msg={error} />}

              <button
                id="btn-next"
                type="submit"
                disabled={loading}
                className="w-full py-4 px-4 flex items-center justify-center gap-2
                  bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-700 hover:to-slate-800
                  text-white font-semibold rounded-2xl shadow-xl hover:shadow-2xl
                  transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? <Spinner /> : 'Continue →'}
              </button>
            </form>

            {/* Divider */}
            <div className="mt-6 flex items-center gap-3">
              <div className="flex-1 h-px bg-slate-300/50" />
              <span className="text-xs text-slate-400 font-medium">or</span>
              <div className="flex-1 h-px bg-slate-300/50" />
            </div>

            {/* Google Button */}
            <GoogleButton onClick={handleGoogle} />
          </motion.div>
        );

      // ── STEP 2: Sign In ───────────────────────────────────────────────────────
      case STEP_SIGNIN:
        return (
          <motion.div
            key="signin"
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
          >
            <BackButton onClick={goBack} />

            <div className="text-center mb-8 mt-2">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 shadow-lg mb-4">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Welcome back!</h2>
              <p className="text-sm text-slate-500 mt-1 font-medium">
                Signing in as&nbsp;
                <span className="font-semibold text-purple-700">{email}</span>
              </p>
            </div>

            <form className="space-y-5" onSubmit={handleSignIn}>
              <div>
                <label htmlFor="password-signin" className="block text-sm font-semibold text-slate-700 ml-1 mb-2">
                  Password
                </label>
                <GlassInput
                  id="password-signin"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoFocus
                />
              </div>

              {error && <ErrorMsg msg={error} />}

              <div className="text-right">
                <a href="#" className="text-xs font-semibold text-purple-600 hover:text-purple-800 transition-colors">
                  Forgot password?
                </a>
              </div>

              <button
                id="btn-signin"
                type="submit"
                disabled={loading}
                className="w-full py-4 px-4 flex items-center justify-center gap-2
                  bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500
                  text-white font-semibold rounded-2xl shadow-xl hover:shadow-2xl
                  transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? <Spinner /> : 'Sign In'}
              </button>
            </form>
          </motion.div>
        );

      // ── STEP 3: Sign Up ───────────────────────────────────────────────────────
      case STEP_SIGNUP:
        return (
          <motion.div
            key="signup"
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
          >
            <BackButton onClick={goBack} />

            <div className="text-center mb-8 mt-2">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-700 shadow-lg mb-4">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Create account</h2>
              <p className="text-sm text-slate-500 mt-1 font-medium">
                Registering&nbsp;
                <span className="font-semibold text-purple-700">{email}</span>
              </p>
            </div>

            <form className="space-y-5" onSubmit={handleSignUp}>
              {/* Password */}
              <div>
                <label htmlFor="password-signup" className="block text-sm font-semibold text-slate-700 ml-1 mb-2">
                  Create Password
                </label>
                <GlassInput
                  id="password-signup"
                  type="password"
                  placeholder="Choose a strong password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoFocus
                />
              </div>

              {/* Role Selector */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 ml-1 mb-2">I am a...</label>
                <div className="grid grid-cols-2 gap-3">
                  {['STUDENT', 'ADMIN'].map((r) => (
                    <button
                      key={r}
                      type="button"
                      id={`role-${r.toLowerCase()}`}
                      onClick={() => setRole(r)}
                      className={`py-3 px-4 rounded-2xl border-2 font-semibold text-sm transition-all
                        ${role === r
                          ? 'bg-purple-600 border-purple-600 text-white shadow-lg shadow-purple-500/30'
                          : 'bg-white/50 border-slate-300/40 text-slate-600 hover:border-purple-400'
                        }`}
                    >
                      {r === 'STUDENT' ? '🎓 Student' : '🛡️ Admin'}
                    </button>
                  ))}
                </div>
              </div>

              {error && <ErrorMsg msg={error} />}

              <button
                id="btn-create-account"
                type="submit"
                disabled={loading}
                className="w-full py-4 px-4 flex items-center justify-center gap-2
                  bg-gradient-to-r from-violet-600 to-purple-700 hover:from-violet-500 hover:to-purple-600
                  text-white font-semibold rounded-2xl shadow-xl hover:shadow-2xl
                  transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? <Spinner /> : 'Create Account'}
              </button>
            </form>

            {/* Divider */}
            <div className="mt-6 flex items-center gap-3">
              <div className="flex-1 h-px bg-slate-300/50" />
              <span className="text-xs text-slate-400 font-medium">or</span>
              <div className="flex-1 h-px bg-slate-300/50" />
            </div>

            <GoogleButton onClick={handleGoogle} label="Sign up with Google" />
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden
      bg-gradient-to-br from-blue-900 via-purple-800 to-slate-900 bg-[length:400%_400%] animate-gradient">

      {/* Background blobs */}
      <div className="absolute top-0 left-[-10%] w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-40 animate-blob" />
      <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-40 animate-blob animation-delay-2000" />
      <div className="absolute bottom-[-10%] left-[20%] w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-40 animate-blob animation-delay-4000" />

      {/* Glassmorphism Card */}
      <div className="relative z-10 w-full max-w-md p-10 bg-white/60 backdrop-blur-2xl border border-white/40 rounded-[2rem] shadow-2xl overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          {renderStep()}
        </AnimatePresence>
      </div>
    </div>
  );
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const BackButton = ({ onClick }) => (
  <button
    type="button"
    id="btn-back"
    onClick={onClick}
    className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-800
      transition-colors mb-2 group"
  >
    <span className="group-hover:-translate-x-0.5 transition-transform">←</span>
    Back
  </button>
);

const ErrorMsg = ({ msg }) => (
  <motion.p
    initial={{ opacity: 0, y: -6 }}
    animate={{ opacity: 1, y: 0 }}
    className="text-sm text-red-500 font-medium px-1"
  >
    {msg}
  </motion.p>
);

const GoogleButton = ({ onClick, label = 'Continue with Google' }) => (
  <button
    type="button"
    id="btn-google"
    onClick={onClick}
    className="mt-4 w-full py-3.5 px-4 flex items-center justify-center gap-3
      bg-white/70 hover:bg-white/90 border border-white/60 hover:border-white
      text-slate-700 font-semibold rounded-2xl shadow-md hover:shadow-lg
      transition-all active:scale-[0.98]"
  >
    {/* Google SVG logo */}
    <svg className="w-5 h-5" viewBox="0 0 24 24">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
    {label}
  </button>
);

export default ModernLogin;
