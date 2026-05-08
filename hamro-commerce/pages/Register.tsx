import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { API_ENDPOINTS } from '../src/constant/api';
import { useAlert } from '../context/AlertContext';

type RegisterFormData = {
  name: string;
  email: string;
  phone: string;
  role: 'User' | 'Company' | string;
  password: string;
  confirmPassword: string;
};

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { showAlert } = useAlert();
  const [formData, setFormData] = useState<RegisterFormData>({
    name: '',
    email: '',
    phone: '',
    role: 'User',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string[] | string>>({});
  const [loading, setLoading] = useState(false);

  const getFieldError = (field: keyof RegisterFormData) => {
    const value = errors[field as string];
    if (!value) return '';
    return Array.isArray(value) ? (value[0] ?? '') : value;
  };

  const normalizeErrors = (rawErrors: Record<string, string[] | string>) => {
    const normalized = { ...rawErrors };
    if (rawErrors.password_confirmation && !rawErrors.confirmPassword) {
      normalized.confirmPassword = rawErrors.password_confirmation;
    }
    return normalized;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev: RegisterFormData) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field
    if (errors[name] || (name === 'confirmPassword' && errors.password_confirmation)) {
      setErrors((prev: Record<string, string[] | string>) => ({
        ...prev,
        [name]: '',
        ...(name === 'confirmPassword' ? { password_confirmation: '' } : {}),
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});

    // Client-side validation
    if (formData.password !== formData.confirmPassword) {
      setErrors({ confirmPassword: 'Passwords do not match' });
      return;
    }

    if (formData.password.length < 8) {
      setErrors({ password: 'Password must be at least 8 characters' });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(API_ENDPOINTS.REGISTER, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          role: formData.role,
          password: formData.password,
          password_confirmation: formData.confirmPassword,
        }),
      });

      const data = await response.json();

      if (data.success) {
        if (data.token && data.user) {
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
          localStorage.setItem('userName', data.user.name || formData.name);
          localStorage.setItem('userEmail', data.user.email || formData.email);
          if (data.user.phone || formData.phone) {
            localStorage.setItem('userPhone', data.user.phone || formData.phone);
          }
          window.dispatchEvent(new Event('storage'));
        } else {
          localStorage.setItem('userName', formData.name);
          localStorage.setItem('userEmail', formData.email);
          localStorage.setItem('userPhone', formData.phone);
        }
        showAlert({
          type: 'success',
          title: 'Welcome!',
          message: 'Registration successful. Redirecting...'
        });
        setTimeout(() => {
          navigate('/');
        }, 1500);
      } else {
        if (data.errors) {
          setErrors(normalizeErrors(data.errors));
        }
        showAlert({
          type: 'error',
          title: 'Registration Failed',
          message: data.message || 'Registration failed'
        });
      }
    } catch (error) {
      console.error('Registration error:', error);
      showAlert({
        type: 'error',
        title: 'Connection Error',
        message: 'Cannot connect to server. Please make sure the backend is running.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-red-50">
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-lg">
          <div className="w-full bg-white rounded-3xl border border-slate-200 shadow-2xl shadow-slate-900/10 p-8 md:p-10">
            <div className="text-center mb-6">
              <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 flex items-center justify-center mx-auto mb-4 shadow-sm">
                <img
                  src="/image/logo.png"
                  alt="Hamro Commerce"
                  className="w-9 h-9 object-contain"
                  loading="eager"
                />
              </div>
              <h2 className="text-3xl font-black text-slate-900">Create account</h2>
              <p className="mt-2 text-sm text-slate-500">
                Join Hamro Commerce today
              </p>
            </div>

            {/* Registration Form */}
            <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Name */}
              <div className="sm:col-span-2">
                <label htmlFor="name" className="text-xs font-bold text-slate-700 uppercase tracking-wide">Full Name</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  autoComplete="name"
                  aria-invalid={Boolean(errors.name)}
                  aria-describedby={getFieldError('name') ? 'name-error' : undefined}
                  className={`mt-1 w-full px-4 py-3 border rounded-xl bg-white focus:outline-none focus:ring-4 focus:ring-red-500/15 focus:border-red-500 transition ${errors.name ? 'border-red-500' : 'border-slate-200'
                    }`}
                  placeholder="John Doe"
                />
                {getFieldError('name') && (
                  <p id="name-error" className="mt-1 text-sm text-red-600">{getFieldError('name')}</p>
                )}
              </div>

              {/* Email */}
              <div className="sm:col-span-2">
                <label htmlFor="email" className="text-xs font-bold text-slate-700 uppercase tracking-wide">Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
                  inputMode="email"
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={getFieldError('email') ? 'email-error' : undefined}
                  className={`mt-1 w-full px-4 py-3 border rounded-xl bg-white focus:outline-none focus:ring-4 focus:ring-red-500/15 focus:border-red-500 transition ${errors.email ? 'border-red-500' : 'border-slate-200'
                    }`}
                  placeholder="john@example.com"
                />
                {getFieldError('email') && (
                  <p id="email-error" className="mt-1 text-sm text-red-600">{getFieldError('email')}</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="phone" className="text-xs font-bold text-slate-700 uppercase tracking-wide">Phone Number</label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  autoComplete="tel"
                  inputMode="tel"
                  aria-invalid={Boolean(errors.phone)}
                  aria-describedby={getFieldError('phone') ? 'phone-error' : undefined}
                  className={`mt-1 w-full px-4 py-3 border rounded-xl bg-white focus:outline-none focus:ring-4 focus:ring-red-500/15 focus:border-red-500 transition ${errors.phone ? 'border-red-500' : 'border-slate-200'
                    }`}
                  placeholder="9801234567"
                />
                {getFieldError('phone') && (
                  <p id="phone-error" className="mt-1 text-sm text-red-600">{getFieldError('phone')}</p>
                )}
              </div>

              {/* Role */}
              <div>
                <label htmlFor="role" className="text-xs font-bold text-slate-700 uppercase tracking-wide">Register As</label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  aria-invalid={Boolean(errors.role)}
                  aria-describedby={getFieldError('role') ? 'role-error' : undefined}
                  className={`mt-1 w-full px-4 py-3 border rounded-xl bg-white focus:outline-none focus:ring-4 focus:ring-red-500/15 focus:border-red-500 transition ${errors.role ? 'border-red-500' : 'border-slate-200'
                    }`}
                >
                  <option value="User">Customer</option>
                  <option value="Company">Company/Seller</option>
                </select>
                {getFieldError('role') && (
                  <p id="role-error" className="mt-1 text-sm text-red-600">{getFieldError('role')}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="text-xs font-bold text-slate-700 uppercase tracking-wide">Password</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="new-password"
                  aria-invalid={Boolean(errors.password)}
                  aria-describedby={getFieldError('password') ? 'password-error' : undefined}
                  className={`mt-1 w-full px-4 py-3 border rounded-xl bg-white focus:outline-none focus:ring-4 focus:ring-red-500/15 focus:border-red-500 transition ${errors.password ? 'border-red-500' : 'border-slate-200'
                    }`}
                  placeholder="Minimum 8 characters"
                />
                {getFieldError('password') && (
                  <p id="password-error" className="mt-1 text-sm text-red-600">{getFieldError('password')}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="text-xs font-bold text-slate-700 uppercase tracking-wide">Confirm Password</label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  autoComplete="new-password"
                  aria-invalid={Boolean(errors.confirmPassword)}
                  aria-describedby={getFieldError('confirmPassword') ? 'confirmPassword-error' : undefined}
                  className={`mt-1 w-full px-4 py-3 border rounded-xl bg-white focus:outline-none focus:ring-4 focus:ring-red-500/15 focus:border-red-500 transition ${errors.confirmPassword ? 'border-red-500' : 'border-slate-200'
                    }`}
                  placeholder="Re-enter your password"
                />
                {getFieldError('confirmPassword') && (
                  <p id="confirmPassword-error" className="mt-1 text-sm text-red-600">{getFieldError('confirmPassword')}</p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="sm:col-span-2 w-full bg-red-600 text-white py-4 rounded-xl font-bold hover:bg-red-700 transition flex items-center justify-center shadow-lg shadow-red-600/20 mt-2 disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5 active:translate-y-0"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating Account...
                  </span>
                ) : (
                  'Create Account'
                )}
              </button>
            </form>

            {/* Login Link */}
            <div className="mt-8 text-center">
              <p className="text-sm text-slate-500">
                Already have an account?{' '}
                <Link to="/login" className="font-bold text-red-600 hover:underline">
                  Sign in
                </Link>
              </p>
            </div>

            {/* Back to Home */}
            <div className="mt-4 text-center">
              <Link to="/" className="text-sm text-slate-500 hover:text-slate-700">
                ← Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
