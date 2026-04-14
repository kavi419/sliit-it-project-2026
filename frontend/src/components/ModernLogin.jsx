import React from 'react';

const ModernLogin = () => {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-900 via-purple-800 to-slate-900 bg-[length:400%_400%] animate-gradient">
      {/* Background blobs for extra modern feel */}
      <div className="absolute top-0 left-[-10%] w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-40 animate-blob"></div>
      <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-40 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-[-10%] left-[20%] w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-40 animate-blob animation-delay-4000"></div>

      {/* Glassmorphism Card */}
      <div className="relative z-10 w-full max-w-md p-10 bg-white/60 backdrop-blur-2xl border border-white/40 rounded-[2rem] shadow-2xl">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Welcome back</h2>
          <p className="text-sm text-slate-600 mt-2 font-medium">Please enter your details to sign in</p>
        </div>

        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-slate-700 ml-1 mb-2">
              Email Address
            </label>
            <div className="relative">
              <input
                id="email"
                type="email"
                className="w-full px-5 py-4 bg-white/50 border border-slate-300/40 rounded-2xl outline-none focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500/50 transition-all text-slate-800 placeholder-slate-400 font-medium"
                placeholder="you@example.com"
                required
              />
            </div>
          </div>

          <button
            type="button"
            className="w-full py-4 px-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-2xl shadow-xl hover:shadow-2xl transition-all active:scale-[0.98] mt-8"
          >
            Next
          </button>
        </form>
        
        <div className="mt-8 text-center text-sm font-medium text-slate-600">
          Don't have an account?{' '}
          <a href="#" className="font-bold text-purple-700 hover:text-purple-800 transition-colors">
            Sign up
          </a>
        </div>
      </div>
    </div>
  );
};

export default ModernLogin;
