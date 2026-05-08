import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight } from 'lucide-react';
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
        
        showAlert({
          type: 'success',
          title: 'Welcome Back!',
          message: `Successfully logged in as ${data.user.name}`
        });
        
        // Trigger storage event for cart refresh
        window.dispatchEvent(new Event('storage'));
        
        // Check if user is admin
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-red-50">
      <div className="min-h-screen flex items-center justify-center p-4 py-12">
        <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-8 lg:gap-10">
          <div className="hidden lg:flex flex-col justify-center rounded-3xl border border-slate-200 bg-white p-10 shadow-xl shadow-slate-900/5">
            <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center shadow-sm">
              <img
                src="/image/logo.png"
                alt="Hamro Commerce"
                className="w-8 h-8 object-contain"
                loading="eager"
              />
            </div>
            <h1 className="mt-6 text-4xl font-black tracking-tight text-slate-900">
              Welcome back
            </h1>
            <p className="mt-3 text-slate-600 leading-relaxed">
              Sign in to continue shopping, track orders, and manage your wishlist.
            </p>

            <div className="mt-8 space-y-3">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-900">Fast checkout</p>
                <p className="mt-1 text-sm text-slate-600">Saved address and quick reorders.</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-900">Order updates</p>
                <p className="mt-1 text-sm text-slate-600">See status and delivery progress.</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center">
            <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 shadow-2xl shadow-slate-900/10 p-8 md:p-10">
              <div className="text-center mb-8">
                <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <img
                    src="/image/logo.png"
                    alt="Hamro Commerce"
                    className="w-9 h-9 object-contain"
                    loading="eager"
                  />
                </div>
                <h1 className="text-3xl font-black text-slate-900">Sign in</h1>
                <p className="text-slate-500 mt-2 text-sm">
                  Enter your details to access your account
                </p>
              </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1">
                    <label htmlFor="email" className="text-xs font-bold text-slate-700 uppercase tracking-wide">Email</label>
                    <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                          id="email"
                          type="email" 
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          autoComplete="email"
                          inputMode="email"
                          aria-invalid={Boolean(errors.email)}
                          aria-describedby={errors.email ? 'email-error' : undefined}
                          className={`w-full pl-11 pr-4 py-3 rounded-xl bg-white border focus:outline-none focus:ring-4 focus:ring-red-500/15 focus:border-red-500 transition-all ${
                            errors.email ? 'border-red-500' : 'border-slate-200'
                          }`}
                          placeholder="name@example.com" 
                        />
                    </div>
                    {getFieldError('email') && (
                      <p id="email-error" className="mt-1 text-sm text-red-600">{getFieldError('email')}</p>
                    )}
                </div>

                <div className="space-y-1">
                     <div className="flex justify-between">
                        <label htmlFor="password" className="text-xs font-bold text-slate-700 uppercase tracking-wide">Password</label>
                        <a
                          href="#"
                          onClick={(e) => e.preventDefault()}
                          className="text-xs text-red-600 hover:underline"
                        >
                          Forgot?
                        </a>
                     </div>
                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                          id="password"
                          type="password" 
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          required
                          autoComplete="current-password"
                          aria-invalid={Boolean(errors.password)}
                          aria-describedby={errors.password ? 'password-error' : undefined}
                          className={`w-full pl-11 pr-4 py-3 rounded-xl bg-white border focus:outline-none focus:ring-4 focus:ring-red-500/15 focus:border-red-500 transition-all ${
                            errors.password ? 'border-red-500' : 'border-slate-200'
                          }`}
                          placeholder="••••••••" 
                        />
                    </div>
                    {getFieldError('password') && (
                      <p id="password-error" className="mt-1 text-sm text-red-600">{getFieldError('password')}</p>
                    )}
                </div>

                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full bg-red-600 text-white py-4 rounded-xl font-bold hover:bg-red-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-600/20 mt-4 disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5 active:translate-y-0"
                >
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Signing In...
                      </span>
                    ) : (
                      <>Sign In <ArrowRight size={20} /></>
                    )}
                </button>
            </form>

            <div className="mt-8 text-center">
                <p className="text-slate-500 text-sm">
                    Don't have an account?{' '}
                    <Link 
                        to="/register" 
                        className="text-red-600 font-bold hover:underline"
                    >
                        Sign Up
                    </Link>
                </p>
            </div>
                </div>
                </div>
              </div>
              </div>
    </div>
  );
}

export default Login;