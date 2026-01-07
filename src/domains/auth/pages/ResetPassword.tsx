import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import api from '../../../shared/api/axios';
import { API } from '../../../shared/api/endpoints';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await api.post(API.AUTH.RESET_PASSWORD, {
        token,
        password: formData.password,
      });
      navigate('/login', {
        state: { message: 'Password reset successful! Please login.' },
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

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
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-primary-navy">Reset Password</h2>
            <p className="text-sm text-gray-600 mt-1">
              Please enter your new password below
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
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-secondary-gold focus:border-transparent text-sm"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-gray-500 hover:text-secondary-gold transition-colors"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    {showPassword ? (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                      />
                    ) : (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    )}
                  </svg>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-primary-navy mb-1 font-medium">
                Confirm Password
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({ ...formData, confirmPassword: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-secondary-gold focus:border-transparent text-sm"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-secondary-gold to-secondary-gold-dark text-white py-2.5 rounded-md font-medium hover:from-secondary-gold-dark hover:to-secondary-gold-dark focus:outline-none focus:ring-2 focus:ring-secondary-gold focus:ring-offset-1 disabled:opacity-60 transition text-sm shadow-sm"
            >
              {loading ? 'Resetting...' : 'Reset Password'}
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

export default ResetPassword;
