import { useNavigate } from 'react-router-dom';
import { ShieldAlert, LockKeyhole } from 'lucide-react';

const PermissionDenied = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 flex items-center justify-center px-4">
      <div className="relative w-full max-w-lg">
        {/* Glow / Accent */}
        <div className="absolute inset-0 -z-10 blur-3xl bg-gradient-to-tr from-primary-navy/20 via-secondary-gold/20 to-slate-400/10 opacity-80" />

        <div className="rounded-3xl bg-white/90 shadow-2xl border border-slate-200/80 backdrop-blur-sm px-8 py-10 sm:px-10 sm:py-12">
          {/* Icon stack */}
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-navy/10 text-primary-navy shadow-md shadow-primary-navy/20">
            <div className="relative">
              <ShieldAlert className="h-10 w-10" />
              <LockKeyhole className="absolute -bottom-1 -right-1 h-5 w-5 text-secondary-gold drop-shadow-sm" />
            </div>
          </div>

          <div className="text-center space-y-3">
            <p className="text-[11px] font-black tracking-[0.3em] uppercase text-primary-navy/60">
              Access Restricted
            </p>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              You don’t have permission
            </h1>
            <p className="text-sm sm:text-base text-slate-600 max-w-md mx-auto">
              Your account is signed in, but it doesn’t have the required role or
              permission to view this page. If you believe this is a mistake, please
              contact your administrator.
            </p>
          </div>

          {/* Pill badges */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-[11px] font-semibold text-slate-600">
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-3 py-1 border border-slate-200">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
              Permission required
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-primary-navy/5 px-3 py-1 border border-primary-navy/15 text-primary-navy">
              Role based access
            </span>
          </div>

          {/* Actions */}
          <div className="mt-8 flex flex-col sm:flex-row sm:items-center sm:justify-center gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex justify-center rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors"
            >
              Go back
            </button>
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="inline-flex justify-center rounded-xl bg-primary-navy px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary-navy/25 hover:bg-primary-navy-dark active:scale-95 transition-all"
            >
              Go to dashboard
            </button>
          </div>

          {/* Small hint */}
          <p className="mt-4 text-[11px] text-center text-slate-400">
            This page will be shown automatically whenever a route fails a permission check.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PermissionDenied;

