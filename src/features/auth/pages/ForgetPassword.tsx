import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../../api/axios';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post('/auth/forgot-password', { email });
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Success State
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-navy-dark via-primary-navy to-primary-navy-light px-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 text-center border border-secondary-gold/20">
            <div className="w-14 h-14 bg-secondary-gold/10 rounded-full mx-auto mb-4 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-secondary-gold"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-primary-navy mb-2">
              Check Your Email
            </h2>
            <p className="text-sm text-gray-600 mb-5">
              We've sent a password reset link to <strong className="text-primary-navy">{email}</strong>
            </p>
            <Link
              to="/login"
              className="inline-block bg-gradient-to-r from-secondary-gold to-secondary-gold-dark text-white px-5 py-2.5 rounded-md font-medium hover:from-secondary-gold-dark hover:to-secondary-gold-dark transition text-sm shadow-sm"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ✅ Default Form
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-navy-dark via-primary-navy to-primary-navy-light px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 border border-secondary-gold/20">
          {/* ---------- Header ---------- */}
          <div className="text-center mb-6">
            <div className="w-14 h-14 bg-gradient-to-br from-secondary-gold to-secondary-gold-dark rounded-xl mx-auto mb-3 flex items-center justify-center shadow-sm">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-primary-navy">
              Forgot Password?
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Don't worry — we'll send you reset instructions.
            </p>
          </div>

          {/* ---------- Error ---------- */}
          {error && (
            <div className="mb-5 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md text-sm">
              {error}
            </div>
          )}

          {/* ---------- Form ---------- */}
          <form onSubmit={handleSubmit} className="space-y-4 text-sm">
            <div>
              <label className="block text-primary-navy mb-1 font-medium">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-secondary-gold focus:border-transparent text-sm"
                placeholder="you@example.com"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-secondary-gold to-secondary-gold-dark text-white py-2.5 rounded-md font-medium hover:from-secondary-gold-dark hover:to-secondary-gold-dark focus:outline-none focus:ring-2 focus:ring-secondary-gold focus:ring-offset-1 disabled:opacity-60 transition text-sm shadow-sm"
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>

          {/* ---------- Footer ---------- */}
          <div className="mt-5 text-center">
            <Link
              to="/login"
              className="text-xs text-gray-600 hover:text-secondary-gold inline-flex items-center transition-colors"
            >
              <svg
                className="w-3.5 h-3.5 mr-1.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Back to login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;