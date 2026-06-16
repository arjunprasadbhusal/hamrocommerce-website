import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  User, Mail, Phone, Lock, Eye, EyeOff, ArrowRight, 
  Sparkles, Shield, CheckCircle, Building, Users, 
  ChevronRight, AlertCircle, Star, Gift
} from 'lucide-react';
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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

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
    if (errors[name] || (name === 'confirmPassword' && errors.password_confirmation)) {
      setErrors((prev: Record<string, string[] | string>) => ({
        ...prev,
        [name]: '',
        ...(name === 'confirmPassword' ? { password_confirmation: '' } : {}),
      }));
    }
  };

  // Password strength checker
  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength++;
    if (password.match(/[0-9]/)) strength++;
    if (password.match(/[^a-zA-Z0-9]/)) strength++;
    return strength;
  };

  const passwordStrength = getPasswordStrength(formData.password);
  const strengthText = ['Weak', 'Fair', 'Good', 'Strong'][passwordStrength - 1] || '';
  const strengthColor = ['', 'blue', 'green', 'green', 'emerald'][passwordStrength] || '';

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});

    if (!acceptedTerms) {
      showAlert({
        type: 'error',
        title: 'Terms & Conditions',
        message: 'Please accept the terms and conditions to continue.'
      });
      return;
    }

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
          title: 'Welcome to Hamro Commerce!',
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
          message: data.message || 'Registration failed. Please try again.'
        });
      }
    } catch (error) {
      console.error('Registration error:', error);
      showAlert({
        type: 'error',
        title: 'Connection Error',
        message: 'Cannot connect to server. Please check your connection.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-green-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-blue-500/5 to-green-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-2xl">
          {/* Main Card */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl shadow-slate-900/10 overflow-hidden">
            {/* Header with Gradient */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6 text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-sm mb-4">
                <Sparkles className="w-4 h-4 text-green-300" />
                <span className="text-xs font-black text-white tracking-wider uppercase">Join Us Today</span>
              </div>
              <h2 className="text-3xl font-black text-white">Create Account</h2>
              <p className="text-green-100 mt-2 text-sm">
                Join Hamro Commerce and start your shopping journey
              </p>
            </div>

            <div className="p-8 md:p-10">
              {/* Role Selector Toggle */}
              <div className="flex gap-3 mb-8 p-1.5 bg-slate-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, role: 'User' }))}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-bold text-sm transition-all ${
                    formData.role === 'User'
                      ? 'bg-white text-green-600 shadow-md'
                      : 'text-slate-600 hover:text-green-600'
                  }`}
                >
                  <Users size={18} />
                  Customer
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, role: 'Company' }))}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-bold text-sm transition-all ${
                    formData.role === 'Company'
                      ? 'bg-white text-green-600 shadow-md'
                      : 'text-slate-600 hover:text-green-600'
                  }`}
                >
                  <Building size={18} />
                  Seller
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Full Name */}
                <div>
                  <label className="flex items-center gap-2 text-xs font-black text-slate-700 uppercase tracking-wider mb-2">
                    <User size={14} />
                    Full Name
                    <span className="text-green-500">*</span>
                  </label>
                  <input
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full px-4 py-3.5 rounded-xl bg-slate-50 border-2 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${
                      errors.name ? 'border-blue-500 bg-blue-50/30' : 'border-slate-200 hover:border-slate-300'
                    }`}
                    placeholder="John Doe"
                  />
                  {getFieldError('name') && (
                    <p className="mt-1 text-sm text-green-600 flex items-center gap-1">
                      <AlertCircle size={12} />
                      {getFieldError('name')}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="flex items-center gap-2 text-xs font-black text-slate-700 uppercase tracking-wider mb-2">
                    <Mail size={14} />
                    Email Address
                    <span className="text-green-500">*</span>
                  </label>
                  <input
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full px-4 py-3.5 rounded-xl bg-slate-50 border-2 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${
                      errors.email ? 'border-blue-500 bg-blue-50/30' : 'border-slate-200 hover:border-slate-300'
                    }`}
                    placeholder="john@example.com"
                  />
                  {getFieldError('email') && (
                    <p className="mt-1 text-sm text-green-600 flex items-center gap-1">
                      <AlertCircle size={12} />
                      {getFieldError('email')}
                    </p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label className="flex items-center gap-2 text-xs font-black text-slate-700 uppercase tracking-wider mb-2">
                    <Phone size={14} />
                    Phone Number
                    <span className="text-green-500">*</span>
                  </label>
                  <input
                    name="phone"
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    className={`w-full px-4 py-3.5 rounded-xl bg-slate-50 border-2 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${
                      errors.phone ? 'border-blue-500 bg-blue-50/30' : 'border-slate-200 hover:border-slate-300'
                    }`}
                    placeholder="9801234567"
                  />
                  {getFieldError('phone') && (
                    <p className="mt-1 text-sm text-green-600 flex items-center gap-1">
                      <AlertCircle size={12} />
                      {getFieldError('phone')}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label className="flex items-center gap-2 text-xs font-black text-slate-700 uppercase tracking-wider mb-2">
                    <Lock size={14} />
                    Password
                    <span className="text-green-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      name="password"
                      type={showPassword ? "text" : "password"}
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className={`w-full px-4 py-3.5 pr-12 rounded-xl bg-slate-50 border-2 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${
                        errors.password ? 'border-blue-500 bg-blue-50/30' : 'border-slate-200 hover:border-slate-300'
                      }`}
                      placeholder="Minimum 8 characters"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-green-500 transition-colors"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  
                  {/* Password Strength Indicator */}
                  {formData.password.length > 0 && (
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 rounded-full bg-slate-200 overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-300 bg-${strengthColor}-500`}
                            style={{ width: `${(passwordStrength / 4) * 100}%` }}
                          />
                        </div>
                        <span className={`text-xs font-medium text-${strengthColor}-600`}>
                          {strengthText}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">
                        Use 8+ chars with letters, numbers & symbols
                      </p>
                    </div>
                  )}
                  {getFieldError('password') && (
                    <p className="mt-1 text-sm text-green-600 flex items-center gap-1">
                      <AlertCircle size={12} />
                      {getFieldError('password')}
                    </p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="flex items-center gap-2 text-xs font-black text-slate-700 uppercase tracking-wider mb-2">
                    <Lock size={14} />
                    Confirm Password
                    <span className="text-green-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={`w-full px-4 py-3.5 pr-12 rounded-xl bg-slate-50 border-2 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${
                        errors.confirmPassword ? 'border-blue-500 bg-blue-50/30' : 'border-slate-200 hover:border-slate-300'
                      }`}
                      placeholder="Re-enter your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-green-500 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                    <p className="mt-1 text-sm text-green-600 flex items-center gap-1">
                      <AlertCircle size={12} />
                      Passwords do not match
                    </p>
                  )}
                  {getFieldError('confirmPassword') && (
                    <p className="mt-1 text-sm text-green-600 flex items-center gap-1">
                      <AlertCircle size={12} />
                      {getFieldError('confirmPassword')}
                    </p>
                  )}
                </div>

                {/* Terms & Conditions */}
                <div className="flex items-start gap-3 pt-2">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded border-slate-300 text-green-600 focus:ring-blue-500 focus:ring-2"
                  />
                  <label htmlFor="terms" className="text-sm text-slate-600">
                    I agree to the{' '}
                    <a href="#" className="text-green-600 font-semibold hover:underline">Terms of Service</a>
                    {' '}and{' '}
                    <a href="#" className="text-green-600 font-semibold hover:underline">Privacy Policy</a>
                  </label>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 rounded-xl font-black text-sm uppercase tracking-wider hover:from-blue-700 hover:to-blue-800 transition-all flex items-center justify-center gap-3 shadow-xl shadow-blue-500/30 mt-6 disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5 active:translate-y-0"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      CREATING ACCOUNT...
                    </>
                  ) : (
                    <>
                      CREATE ACCOUNT
                      <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>

              {/* Sign In Link */}
              <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                <p className="text-slate-600 text-sm">
                  Already have an account?{' '}
                  <Link to="/login" className="text-green-600 font-bold hover:text-green-700 hover:underline transition-all inline-flex items-center gap-1">
                    Sign In
                    <ChevronRight size={14} />
                  </Link>
                </p>
              </div>

              {/* Benefits Section */}
              <div className="mt-6 p-4 bg-gradient-to-r from-slate-50 to-blue-50/30 rounded-xl">
                <div className="flex items-center gap-2 mb-3">
                  <Gift size={16} className="text-green-500" />
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Member Benefits</span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle size={12} className="text-green-500" />
                    <span className="text-slate-600">Exclusive Deals</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle size={12} className="text-green-500" />
                    <span className="text-slate-600">Order Tracking</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle size={12} className="text-green-500" />
                    <span className="text-slate-600">Wishlist</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle size={12} className="text-green-500" />
                    <span className="text-slate-600">24/7 Support</span>
                  </div>
                </div>
              </div>

              {/* Security Note */}
              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-400">
                <Shield size={12} />
                <span>Your information is encrypted and secure</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
