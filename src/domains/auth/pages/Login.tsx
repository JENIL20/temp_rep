import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppDispatch } from '../../../store';
import { setCredentials } from '../store/authSlice';
import { authApi } from '../api/authApi';
// import { API } from '../../../shared/api/endpoints';

import { toast } from 'react-toastify';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    console.log("Login submit clicked");
    e.preventDefault();

    try {
      setLoading(true);
      const data = await authApi.login({ email, password });

      console.log('Login Response:', data);

      const user = data[0]?.user;
      const token = data[0]?.token;

      if (user && token) {
        dispatch(setCredentials({ user, token }));
        localStorage.setItem("token", token);
        toast.success("Login Successful!");
        navigate("/dashboard");
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-navy-dark via-primary-navy to-primary-navy-light px-3">
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-2xl shadow-md p-6 border border-secondary-gold/20">

          {/* Logo / Brand */}
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-secondary-gold to-secondary-gold-dark rounded-xl mx-auto mb-3 flex items-center justify-center shadow-sm">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
                />
              </svg>
            </div>
            <h1 className="text-lg font-bold text-primary-navy">LMS Login</h1>
            <p className="text-gray-500 text-xs mt-1">
              Access your learning dashboard
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-primary-navy mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary-gold focus:border-transparent text-sm"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-primary-navy mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary-gold focus:border-transparent text-sm"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-secondary-gold text-xs transition-colors"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  className="rounded text-secondary-gold focus:ring-secondary-gold"
                />
                <span className="text-gray-600">Remember me</span>
              </label>
              <Link
                to="/forgot-password"
                className="text-secondary-gold hover:text-secondary-gold-dark font-medium transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-secondary-gold to-secondary-gold-dark text-white py-2 rounded-lg text-sm font-medium hover:from-secondary-gold-dark hover:to-secondary-gold-dark focus:ring-2 focus:ring-secondary-gold focus:ring-offset-2 disabled:opacity-50 transition-all shadow-sm"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <div className="mt-5 text-center text-xs">
            <p className="text-gray-600">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="text-secondary-gold hover:text-secondary-gold-dark font-medium transition-colors"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );

};

export default Login;