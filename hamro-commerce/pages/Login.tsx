import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Eye, EyeOff, Sparkles, Shield, ShoppingBag, Clock, ChevronRight, Fingerprint } from 'lucide-react';
import { useAlert } from '../context/AlertContext';
import { API_ENDPOINTS } from '../src/constant/api';

type LoginFormData = {
  email: string;
  password: string;
};

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { showAlert } = useAlert();
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Record<string, string[] | string>>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const getFieldError = (field: keyof LoginFormData) => {
    const value = errors[field as string];
    if (!value) return '';
    return Array.isArray(value) ? (value[0] ?? '') : value;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev: LoginFormData) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev: Record<string, string[] | string>) => ({
        ...prev,
        [name]: '',
      }));
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      const response = await fetch(API_ENDPOINTS.LOGIN, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (data.success && data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('userEmail', data.user.email);
        localStorage.setItem('userName', data.user.name);
        if (data.user.phone) {
          localStorage.setItem('userPhone', data.user.phone);
        }
        if (rememberMe) {
          localStorage.setItem('rememberMe', 'true');
        }
        
        showAlert({
          type: 'success',
          title: 'Welcome Back!',
          message: `Successfully logged in as ${data.user.name}`
        });
        
        window.dispatchEvent(new Event('storage'));
        
        if (data.user && data.user.role === 'Admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/');
        }
      } else {
        if (data.errors) {
          setErrors(data.errors);
        }
        showAlert({
          type: 'error',
          title: 'Login Failed',
          message: data.message || 'Invalid credentials. Please try again.'
        });
      }
    } catch (error) {
      showAlert({
        type: 'error',
        title: 'Error',
        message: 'An error occurred. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  }

  // Demo credentials for quick testing
  const fillDemoCredentials = () => {
    setFormData({
      email: 'demo@hamro.com',
      password: 'password123'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-red-50/30 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-red-500/5 to-orange-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative min-h-screen flex items-center justify-center p-4 py-12">
        <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 lg:gap-12">
          
          {/* Left Side - Brand Section */}
          <div className="hidden lg:flex flex-col justify-center relative">
            <div className="relative z-10 bg-gradient-to-br from-white via-white to-red-50/50 rounded-3xl border border-slate-200/50 p-10 shadow-2xl shadow-slate-900/5 backdrop-blur-sm">
              {/* Decorative Badge */}
              <div className="absolute -top-3 -right-3 bg-gradient-to-r from-red-500 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-black shadow-lg">
                NEW
              </div>
              
              <div className="flex items-center gap-3 mb-8">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg shadow-red-500/30">
                  <img
                    src="/image/logo.png"
                    alt="Hamro Commerce"
                    className="w-9 h-9 object-contain brightness-0 invert"
                    loading="eager"
                  />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-900">Hamro Commerce</h2>
                  <p className="text-xs text-slate-500">Nepal's Trusted Marketplace</p>
                </div>
              </div>

              <h1 className="text-4xl font-black tracking-tight text-slate-900 leading-tight">
                Welcome back to
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-500"> your world</span>
              </h1>
              
              <p className="mt-4 text-slate-600 leading-relaxed">
                Sign in to continue shopping, track orders, manage your wishlist, and enjoy personalized recommendations.
              </p>

              {/* Feature List */}
              <div className="mt-8 space-y-4">
                {[
                  { icon: ShoppingBag, title: "Fast Checkout", desc: "Saved addresses and quick reorders" },
                  { icon: Clock, title: "Order Updates", desc: "Real-time tracking and notifications" },
                  { icon: Shield, title: "Secure Shopping", desc: "Your data is always protected" },
                ].map((feature, idx) => (
                  <div key={idx} className="group flex items-start gap-4 p-4 rounded-2xl bg-gradient-to-r from-slate-50 to-transparent hover:from-red-50/50 transition-all duration-300">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center text-red-600 group-hover:scale-110 transition-transform">
                      <feature.icon size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800">{feature.title}</h3>
                      <p className="text-sm text-slate-500">{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Trust Badges */}
              <div className="mt-8 pt-6 border-t border-slate-100">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                      {[1, 2, 3, 4].map(i => (
                        <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 border-2 border-white flex items-center justify-center text-xs font-bold text-slate-600">
                          ★
                        </div>
                      ))}
                    </div>
                    <span className="text-sm font-semibold text-slate-700">10K+ Happy Customers</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Shield size={14} className="text-green-500" />
                    <span className="text-xs text-slate-500">100% Secure</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Elements */}
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-gradient-to-r from-red-500/10 to-orange-500/10 rounded-full blur-2xl animate-pulse" />
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full blur-2xl animate-pulse delay-700" />
          </div>

          {/* Right Side - Login Form */}
          <div className="flex items-center justify-center">
            <div className="w-full max-w-md">
              {/* Mobile Logo */}
              <div className="lg:hidden text-center mb-8">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center mx-auto mb-4 shadow-xl shadow-red-500/30">
                  <img
                    src="/image/logo.png"
                    alt="Hamro Commerce"
                    className="w-10 h-10 object-contain brightness-0 invert"
                    loading="eager"
                  />
                </div>
                <h1 className="text-2xl font-black text-slate-900">Welcome Back</h1>
                <p className="text-slate-500 text-sm mt-1">Sign in to continue</p>
              </div>

              {/* Form Card */}
              <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl shadow-slate-900/10 p-8 md:p-10">
                {/* Header */}
                <div className="hidden lg:block text-center mb-8">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center mx-auto mb-4 shadow-xl shadow-red-500/30">
                    <Sparkles className="w-8 h-8 text-white" />
                  </div>
                  <h1 className="text-3xl font-black text-slate-900">Sign In</h1>
                  <p className="text-slate-500 mt-2 text-sm">
                    Enter your credentials to access your account
                  </p>
                </div>

                {/* Demo Button */}
                <button
                  type="button"
                  onClick={fillDemoCredentials}
                  className="w-full mb-6 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-slate-100 to-slate-50 rounded-xl text-sm font-medium text-slate-600 hover:from-slate-200 hover:to-slate-100 transition-all border border-slate-200"
                >
                  <Fingerprint size={16} />
                  Try Demo Account
                </button>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Email Field */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-xs font-black text-slate-700 uppercase tracking-wider">
                      <Mail size={14} />
                      Email Address
                      <span className="text-red-500">*</span>
                    </label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-red-500 transition-colors" size={18} />
                      <input 
                        id="email"
                        type="email" 
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        autoComplete="email"
                        className={`w-full pl-11 pr-4 py-3.5 rounded-xl bg-slate-50 border-2 focus:bg-white focus:outline-none focus:ring-4 focus:ring-red-500/20 focus:border-red-500 transition-all ${
                          errors.email ? 'border-red-500 bg-red-50/30' : 'border-slate-200 group-hover:border-slate-300'
                        }`}
                        placeholder="name@example.com" 
                      />
                    </div>
                    {getFieldError('email') && (
                      <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                        <span className="w-1 h-1 rounded-full bg-red-600"></span>
                        {getFieldError('email')}
                      </p>
                    )}
                  </div>

                  {/* Password Field */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="flex items-center gap-2 text-xs font-black text-slate-700 uppercase tracking-wider">
                        <Lock size={14} />
                        Password
                        <span className="text-red-500">*</span>
                      </label>
                      <a
                        href="#"
                        onClick={(e) => e.preventDefault()}
                        className="text-xs text-red-600 hover:text-red-700 font-semibold hover:underline transition-all"
                      >
                        Forgot Password?
                      </a>
                    </div>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-red-500 transition-colors" size={18} />
                      <input 
                        id="password"
                        type={showPassword ? "text" : "password"} 
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        autoComplete="current-password"
                        className={`w-full pl-11 pr-12 py-3.5 rounded-xl bg-slate-50 border-2 focus:bg-white focus:outline-none focus:ring-4 focus:ring-red-500/20 focus:border-red-500 transition-all ${
                          errors.password ? 'border-red-500 bg-red-50/30' : 'border-slate-200 group-hover:border-slate-300'
                        }`}
                        placeholder="••••••••" 
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-500 transition-colors"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {getFieldError('password') && (
                      <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                        <span className="w-1 h-1 rounded-full bg-red-600"></span>
                        {getFieldError('password')}
                      </p>
                    )}
                  </div>

                  {/* Remember Me Checkbox */}
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          className="peer sr-only"
                        />
                        <div className="w-5 h-5 rounded-md border-2 border-slate-300 peer-checked:border-red-500 peer-checked:bg-red-500 transition-all group-hover:border-red-400">
                          {rememberMe && (
                            <svg className="w-4 h-4 text-white absolute top-0.5 left-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                      </div>
                      <span className="text-sm text-slate-600 group-hover:text-slate-800 transition-colors">Remember me</span>
                    </label>
                  </div>

                  {/* Submit Button */}
                  <button 
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-3.5 rounded-xl font-black text-sm uppercase tracking-wider hover:from-red-700 hover:to-red-800 transition-all flex items-center justify-center gap-3 shadow-xl shadow-red-500/30 mt-6 disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5 active:translate-y-0"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        SIGNING IN...
                      </>
                    ) : (
                      <>
                        SIGN IN
                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </form>

                {/* Divider */}
                <div className="relative my-8">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-slate-400">or</span>
                  </div>
                </div>

                {/* Sign Up Link */}
                <div className="text-center">
                  <p className="text-slate-600 text-sm">
                    Don't have an account?{' '}
                    <Link 
                      to="/register" 
                      className="text-red-600 font-bold hover:text-red-700 hover:underline transition-all inline-flex items-center gap-1"
                    >
                      Create Account
                      <ChevronRight size={14} />
                    </Link>
                  </p>
                </div>

                {/* Security Note */}
                <div className="mt-6 pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
                    <Shield size={12} />
                    <span>Your information is encrypted and secure</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;