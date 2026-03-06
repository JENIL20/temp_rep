import { useNavigate } from 'react-router-dom';
import { ShieldX, Home, ArrowLeft } from 'lucide-react';

/**
 * Unauthorized — shown when the user is authenticated but lacks
 * the permission to access a specific route.
 */
const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-primary-navy-dark via-primary-navy to-primary-navy-light px-4">
      {/* Glassmorphism card */}
      <div className="relative w-full max-w-md rounded-3xl border border-white/10 bg-white/10 backdrop-blur-xl shadow-2xl p-10 text-center overflow-hidden">

        {/* Background decorative rings */}
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-red-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-secondary-gold/10 blur-3xl pointer-events-none" />

        {/* Icon */}
        <div className="relative mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 shadow-xl shadow-red-500/30">
          <ShieldX className="h-12 w-12 text-white" strokeWidth={1.5} />
          {/* Pulse ring */}
          <span className="absolute inset-0 rounded-2xl border-2 border-red-400 animate-ping opacity-30" />
        </div>

        {/* Code badge */}
        <span className="inline-block px-4 py-1 rounded-full bg-red-500/20 border border-red-400/30 text-red-300 text-xs font-black tracking-widest uppercase mb-4">
          403 — Access Denied
        </span>

        <h1 className="text-3xl font-black text-white mb-3 leading-tight">
          Permission Required
        </h1>

        <p className="text-white/60 text-sm leading-relaxed mb-8">
          You don't have the necessary permissions to view this page.
          Please contact your administrator if you believe this is a mistake.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-white/20 text-white/80 hover:bg-white/10 transition-all font-semibold text-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-secondary-gold hover:bg-secondary-gold-dark text-primary-navy font-black transition-all text-sm shadow-lg shadow-secondary-gold/20"
          >
            <Home className="h-4 w-4" />
            Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
