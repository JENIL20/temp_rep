import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAppDispatch } from "../../../store";
import { setCredentials } from "../store/authSlice";
import { authApi } from "../api/authApi";

const Register = () => {
  const [formData, setFormData] = useState({
    userName: "",
    firstName: "",
    lastName: "",
    email: "",
    mobile: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: "" });
    }
  };

  const validate = () => {
    const newErrors: any = {};
    if (!formData.userName.trim()) newErrors.userName = "First name is required";
    if (!formData.firstName.trim()) newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Email is invalid";
    if (!formData.mobile.trim()) newErrors.mobile = "Phone number is required";
    else if (!/^[0-9]{10}$/.test(formData.mobile))
      newErrors.mobile = "Phone number must be 10 digits";
    if (formData.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";
    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const { confirmPassword, ...data } = formData;
      const response = await authApi.register(data);
      if (response && response.user && response.token) {
        const { user, token, tenantId } = response;
        dispatch(setCredentials({ user, token, tenantId: tenantId || user.tenantId }));
        localStorage.setItem("token", token);
        const finalTenantId = tenantId || user.tenantId;
        if (finalTenantId) localStorage.setItem("tenantId", finalTenantId.toString());
        navigate("/dashboard");
      }
    } catch (err: any) {
      setErrors({
        general: err.message || "Registration failed",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-navy-dark via-primary-navy to-primary-navy-light px-3">
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-2xl shadow-md p-6 border border-secondary-gold/20">
          {/* Brand */}
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
            <h1 className="text-lg font-bold text-primary-navy">Create LMS Account</h1>
            <p className="text-gray-500 text-xs mt-1">Join the platform to start learning</p>
          </div>

          {errors.general && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-3 py-1 rounded-md text-xs">
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            {/* User Name */}
            <div>
              <label className="block text-xs font-medium text-primary-navy mb-1">
                User Name
              </label>
              <input
                type="text"
                name="userName"
                value={formData.userName}
                onChange={handleChange}
                className={`w-full px-3 py-1 border rounded-lg text-sm focus:ring-2 focus:ring-secondary-gold focus:border-transparent ${errors.firstName ? "border-red-500" : "border-gray-300"}`}
                placeholder="John"
              />
              {errors.userName && (
                <p className="text-red-600 text-xs mt-1">{errors.userName}</p>
              )}
            </div>

            {/* First Name */}
            <div>
              <label className="block text-xs font-medium text-primary-navy mb-1">
                First Name
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className={`w-full px-3 py-1 border rounded-lg text-sm focus:ring-2 focus:ring-secondary-gold focus:border-transparent ${errors.firstName ? "border-red-500" : "border-gray-300"}`}
                placeholder="John"
              />
              {errors.firstName && (
                <p className="text-red-600 text-xs mt-1">{errors.firstName}</p>
              )}
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-xs font-medium text-primary-navy mb-1">
                Last Name
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className={`w-full px-3 py-1 border rounded-lg text-sm focus:ring-2 focus:ring-secondary-gold focus:border-transparent ${errors.lastName ? "border-red-500" : "border-gray-300"}`}
                placeholder="Doe"
              />
              {errors.lastName && (
                <p className="text-red-600 text-xs mt-1">{errors.lastName}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-primary-navy mb-1">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-3 py-1 border rounded-lg text-sm focus:ring-2 focus:ring-secondary-gold focus:border-transparent ${errors.email ? "border-red-500" : "border-gray-300"}`}
                placeholder="you@example.com"
              />
              {errors.email && (
                <p className="text-red-600 text-xs mt-1">{errors.email}</p>
              )}
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-xs font-medium text-primary-navy mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
                className={`w-full px-3 py-1 border rounded-lg text-sm focus:ring-2 focus:ring-secondary-gold focus:border-transparent ${errors.mobile ? "border-red-500" : "border-gray-300"}`}
                placeholder="9876543210"
              />
              {errors.mobile && (
                <p className="text-red-600 text-xs mt-1">{errors.mobile}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-medium text-primary-navy mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full px-3 py-1 border rounded-lg text-sm focus:ring-2 focus:ring-secondary-gold focus:border-transparent ${errors.password ? "border-red-500" : "border-gray-300"}`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-secondary-gold text-xs transition-colors"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-600 text-xs mt-1">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-medium text-primary-navy mb-1">
                Confirm Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`w-full px-3 py-1 border rounded-lg text-sm focus:ring-2 focus:ring-secondary-gold focus:border-transparent ${errors.confirmPassword ? "border-red-500" : "border-gray-300"}`}
                placeholder="••••••••"
              />
              {errors.confirmPassword && (
                <p className="text-red-600 text-xs mt-1">{errors.confirmPassword}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-secondary-gold to-secondary-gold-dark text-white py-2 rounded-lg text-sm font-medium hover:from-secondary-gold-dark hover:to-secondary-gold-dark focus:ring-2 focus:ring-secondary-gold focus:ring-offset-2 disabled:opacity-50 transition-all shadow-sm"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <div className="mt-5 text-center text-xs">
            <p className="text-gray-600">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-secondary-gold hover:text-secondary-gold-dark font-medium transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
