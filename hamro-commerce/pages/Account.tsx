import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  BadgeCheck,
  Camera,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  Mail,
  MapPin,
  Phone,
  Save,
  ShieldCheck,
  User,
} from 'lucide-react';
import { API_ENDPOINTS, resolveImageUrl } from '../src/constant/api';
import { useAlert } from '../context/AlertContext';

interface AccountProfile {
  id: number;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  role?: string;
  profile_image?: string;
  profile_image_url?: string;
  created_at?: string;
}

const Account: React.FC = () => {
  const navigate = useNavigate();
  const { showAlert } = useAlert();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<AccountProfile | null>(null);
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    current_password: '',
    password: '',
    password_confirmation: '',
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    fetchProfile();
  }, [navigate]);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(API_ENDPOINTS.USER, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to load account');
      }

      const user = data.user as AccountProfile;
      setProfile(user);
      setProfileImagePreview(resolveImageUrl(user.profile_image_url || user.profile_image || ''));
      setFormData((current) => ({
        ...current,
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
      }));
    } catch (error) {
      showAlert({
        type: 'error',
        title: 'Account Error',
        message: error instanceof Error ? error.message : 'Failed to load account',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setProfileImageFile(file);
    setProfileImagePreview(URL.createObjectURL(file));
  };

  const updateStoredUser = (user: AccountProfile) => {
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('userName', user.name || '');
    localStorage.setItem('userEmail', user.email || '');

    if (user.phone) {
      localStorage.setItem('userPhone', user.phone);
    } else {
      localStorage.removeItem('userPhone');
    }

    window.dispatchEvent(new Event('storage'));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const wantsPasswordChange = Boolean(
      formData.current_password || formData.password || formData.password_confirmation
    );

    if (wantsPasswordChange && formData.password !== formData.password_confirmation) {
      showAlert({
        type: 'error',
        title: 'Password Mismatch',
        message: 'New password and confirmation must match.',
      });
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const updateData = new FormData();
      updateData.append('_method', 'PUT');
      updateData.append('name', formData.name);
      updateData.append('email', formData.email);
      updateData.append('phone', formData.phone);
      updateData.append('address', formData.address);

      if (profileImageFile) {
        updateData.append('profile_image', profileImageFile);
      }

      if (wantsPasswordChange) {
        updateData.append('current_password', formData.current_password);
        updateData.append('password', formData.password);
        updateData.append('password_confirmation', formData.password_confirmation);
      }

      const response = await fetch(API_ENDPOINTS.USER_UPDATE, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
        body: updateData,
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        const firstError = data.errors ? Object.values(data.errors).flat()[0] : null;
        throw new Error(String(firstError || data.message || 'Failed to update account'));
      }

      const updatedUser = data.user as AccountProfile;
      setProfile(updatedUser);
      setProfileImageFile(null);
      setProfileImagePreview(resolveImageUrl(updatedUser.profile_image_url || updatedUser.profile_image || ''));
      setFormData({
        name: updatedUser.name || '',
        email: updatedUser.email || '',
        phone: updatedUser.phone || '',
        address: updatedUser.address || '',
        current_password: '',
        password: '',
        password_confirmation: '',
      });
      updateStoredUser(updatedUser);

      showAlert({
        type: 'success',
        title: 'Account Updated',
        message: wantsPasswordChange
          ? 'Your profile and password were updated successfully.'
          : 'Your profile was updated successfully.',
      });
    } catch (error) {
      showAlert({
        type: 'error',
        title: 'Update Failed',
        message: error instanceof Error ? error.message : 'Failed to update account',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm font-semibold text-slate-600">Loading your account...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <section className="border-b border-blue-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-4">
            <Link to="/" className="p-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-blue-50">
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-slate-900">My Account</h1>
              <p className="text-sm text-slate-600 mt-1">Edit your profile and keep your password secure.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          <aside className="lg:col-span-4">
            <div className="bg-white border border-blue-100 rounded-2xl shadow-sm overflow-hidden">
              <div className="h-28 bg-gradient-to-r from-[#0a56bd] to-[#22c55e]"></div>
              <div className="px-6 pb-6 -mt-14 text-center">
                <div className="relative inline-block">
                  <div className="w-28 h-28 rounded-full border-4 border-white bg-slate-100 overflow-hidden shadow-xl">
                    {profileImagePreview ? (
                      <img src={profileImagePreview} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-blue-50">
                        <User size={42} className="text-blue-600" />
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-1 right-1 w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg hover:bg-blue-700"
                    aria-label="Change profile photo"
                  >
                    <Camera size={18} />
                  </button>
                </div>

                <h2 className="mt-4 text-2xl font-bold text-slate-900">{profile?.name}</h2>
                <p className="mt-1 text-sm text-slate-500 break-all">{profile?.email}</p>
                <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-green-50 px-4 py-2 text-xs font-bold uppercase tracking-wide text-green-700 border border-green-100">
                  <BadgeCheck size={15} />
                  {profile?.role || 'User'}
                </div>

                <div className="mt-6 grid grid-cols-1 gap-3 text-left">
                  <div className="flex items-center gap-3 rounded-xl bg-blue-50/70 p-3">
                    <ShieldCheck className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-semibold text-slate-700">Authenticated account</span>
                  </div>
                  {profile?.created_at && (
                    <div className="rounded-xl bg-slate-50 p-3">
                      <p className="text-xs font-bold uppercase text-slate-400">Member since</p>
                      <p className="text-sm font-semibold text-slate-700">
                        {new Date(profile.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </aside>

          <div className="lg:col-span-8">
            <form onSubmit={handleSubmit} className="bg-white border border-blue-100 rounded-2xl shadow-sm">
              <div className="p-5 sm:p-6 border-b border-slate-100">
                <h3 className="text-xl font-bold text-slate-900">Profile Details</h3>
              </div>

              <div className="p-5 sm:p-6 space-y-8">
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <Field icon={User} label="Full Name" name="name" value={formData.name} onChange={handleChange} required />
                  <Field icon={Mail} label="Email Address" name="email" type="email" value={formData.email} onChange={handleChange} required />
                  <Field icon={Phone} label="Phone Number" name="phone" type="tel" value={formData.phone} onChange={handleChange} />
                  <Field icon={MapPin} label="Address" name="address" value={formData.address} onChange={handleChange} />
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 sm:p-5">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-xl bg-white text-blue-600 flex items-center justify-center border border-blue-100">
                      <KeyRound size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">Change Password</h3>
                      <p className="text-xs text-slate-500">Leave these fields blank to keep your current password.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowPasswords((show) => !show)}
                      className="ml-auto p-2 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-white"
                      aria-label={showPasswords ? 'Hide passwords' : 'Show passwords'}
                    >
                      {showPasswords ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Field icon={Lock} label="Current Password" name="current_password" type={showPasswords ? 'text' : 'password'} value={formData.current_password} onChange={handleChange} autoComplete="current-password" />
                    <Field icon={KeyRound} label="New Password" name="password" type={showPasswords ? 'text' : 'password'} value={formData.password} onChange={handleChange} autoComplete="new-password" />
                    <Field icon={KeyRound} label="Confirm Password" name="password_confirmation" type={showPasswords ? 'text' : 'password'} value={formData.password_confirmation} onChange={handleChange} autoComplete="new-password" />
                  </div>
                </div>
              </div>

              <div className="px-5 sm:px-6 py-5 border-t border-slate-100 flex flex-col sm:flex-row gap-3 sm:justify-end">
                <Link
                  to="/"
                  className="inline-flex justify-center px-6 py-3 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex justify-center items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#0a56bd] to-[#22c55e] text-white font-bold shadow-lg shadow-blue-100 disabled:opacity-60"
                >
                  {saving ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> : <Save size={18} />}
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

interface FieldProps {
  icon: React.ElementType;
  label: string;
  name: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  required?: boolean;
  autoComplete?: string;
}

const Field: React.FC<FieldProps> = ({
  icon: Icon,
  label,
  name,
  value,
  onChange,
  type = 'text',
  required = false,
  autoComplete,
}) => (
  <label className="block">
    <span className="text-xs font-bold uppercase tracking-wide text-slate-600">
      {label} {required && <span className="text-rose-500">*</span>}
    </span>
    <span className="relative mt-2 block">
      <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        autoComplete={autoComplete}
        className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm font-semibold text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
      />
    </span>
  </label>
);

export default Account;
