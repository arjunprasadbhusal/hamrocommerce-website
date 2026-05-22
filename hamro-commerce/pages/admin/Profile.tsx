import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, MapPin, Calendar, Camera, Save, ArrowLeft, BadgeCheck, Shield, Edit3 } from 'lucide-react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { API_ENDPOINTS, BASE_URL } from '../../src/constant/api';

interface UserProfile {
  id: number;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  profile_image?: string;
  profile_image_url?: string;
  role: string;
  created_at: string;
}

const Profile = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(API_ENDPOINTS.USER, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      const data = await response.json();
      if (data.success) {
        setProfile(data.user);
        setProfileImagePreview(data.user.profile_image_url || data.user.profile_image || '');
        setFormData({
          name: data.user.name || '',
          email: data.user.email || '',
          phone: data.user.phone || '',
          address: data.user.address || ''
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      showNotification('Failed to load profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setProfileImageFile(file);
    setProfileImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const token = localStorage.getItem('token');
      const updateData = new FormData();
      updateData.append('name', formData.name);
      updateData.append('email', formData.email);
      updateData.append('phone', formData.phone || '');
      updateData.append('address', formData.address || '');
      updateData.append('_method', 'PUT');

      if (profileImageFile) {
        updateData.append('profile_image', profileImageFile);
      }

      const response = await fetch(`${API_ENDPOINTS.USER}/update`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        body: updateData
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('userName', formData.name);
        localStorage.setItem('userEmail', formData.email);
        
        showNotification('Profile updated successfully!', 'success');
        setProfileImageFile(null);
        fetchProfile();
      } else {
        showNotification(data.message || 'Failed to update profile', 'error');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      showNotification('An error occurred while updating profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 3000);
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-[#F8FAFC]">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Topbar />
          <div className="flex-1 flex items-center justify-center">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
              <div className="mt-4 text-slate-500 font-medium animate-pulse">Loading Profile...</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#F8FAFC]">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        <div className="flex-1 overflow-auto p-4 md:p-8">
          {/* Notification Toast */}
          {notification.show && (
            <div className={`fixed top-20 right-8 z-50 animate-fade-in-up p-4 rounded-xl shadow-2xl flex items-center gap-3 border ${
              notification.type === 'success' 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                notification.type === 'success' ? 'bg-emerald-200' : 'bg-rose-200'
              }`}>
                {notification.type === 'success' ? <BadgeCheck className="w-5 h-5" /> : <Shield className="w-5 h-5" />}
              </div>
              <p className="font-semibold">{notification.message}</p>
            </div>
          )}

          {/* Breadcrumbs / Back button */}
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="group p-2.5 bg-white border border-slate-200 hover:border-blue-300 hover:bg-blue-50 rounded-xl transition-all duration-300 shadow-sm"
            >
              <ArrowLeft className="w-5 h-5 text-slate-600 group-hover:text-blue-600 group-hover:-translate-x-1 transition-transform" />
            </button>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Account Settings</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-slate-500">Dashboard</span>
                <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                <span className="text-sm text-blue-600 font-semibold">My Profile</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
            {/* Left Column: Summary Card */}
            <div className="xl:col-span-4 space-y-6">
              <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden group">
                {/* Profile Header Background */}
                <div className="h-32 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 relative">
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
                </div>
                
                <div className="px-6 pb-8 text-center relative">
                  {/* Profile Avatar */}
                  <div className="relative -mt-16 mb-4 inline-block">
                    <div className="w-32 h-32 p-1.5 bg-white rounded-full shadow-2xl overflow-hidden ring-4 ring-white transition-transform duration-500 group-hover:scale-105">
                      <div className="w-full h-full rounded-full bg-slate-100 flex items-center justify-center overflow-hidden relative group/avatar">
                        {profileImagePreview ? (
                          <img
                            src={profileImagePreview}
                            alt="Profile"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="bg-gradient-to-br from-slate-200 to-slate-300 w-full h-full flex items-center justify-center">
                             <User className="w-12 h-12 text-slate-500" />
                          </div>
                        )}
                        
                        {/* Avatar Hover Overlay */}
                        <button 
                          onClick={() => fileInputRef.current?.click()}
                          className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-300 text-white cursor-pointer"
                        >
                          <Camera className="w-6 h-6 mb-1" />
                          <span className="text-[10px] font-bold uppercase tracking-wider">Change Photo</span>
                        </button>
                      </div>
                    </div>
                    
                    {/* Role Badge */}
                    <div className="absolute -bottom-1 -right-1 p-1 bg-white rounded-full shadow-lg">
                       <div className="bg-emerald-500 text-white p-1 rounded-full">
                         <BadgeCheck className="w-4 h-4" />
                       </div>
                    </div>
                  </div>

                  <h2 className="text-2xl font-bold text-slate-900 mb-1">{profile?.name}</h2>
                  <p className="text-slate-500 font-medium mb-4 flex items-center justify-center gap-1.5">
                    <Mail className="w-3.5 h-3.5" />
                    {profile?.email}
                  </p>
                  
                  <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-widest border border-blue-100 mb-6">
                    {profile?.role || 'Administrator'}
                  </div>

                  {/* Summary Details */}
                  <div className="grid grid-cols-1 gap-3 text-left border-t border-slate-50 pt-6 mt-2">
                    <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-transparent hover:border-slate-200 hover:bg-white transition-all duration-300 group/item">
                      <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-slate-400 group-hover/item:text-blue-500 transition-colors">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Joined On</p>
                        <p className="text-sm font-semibold text-slate-700">
                          {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'N/A'}
                        </p>
                      </div>
                    </div>

                    {profile?.phone && (
                      <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-transparent hover:border-slate-200 hover:bg-white transition-all duration-300 group/item">
                        <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-slate-400 group-hover/item:text-blue-500 transition-colors">
                          <Phone className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Contact Number</p>
                          <p className="text-sm font-semibold text-slate-700">{profile.phone}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

            </div>

            {/* Right Column: Edit Form */}
            <div className="xl:col-span-8">
              <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                      <Edit3 className="w-5 h-5" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">Personal Information</h3>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 ml-1">
                        Full Name <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                          <User className="w-4 h-4" />
                        </div>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 focus:bg-white outline-none transition-all duration-300 font-medium text-slate-700"
                          placeholder="Enter your full name"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 ml-1">
                        Email Address <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                          <Mail className="w-4 h-4" />
                        </div>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 focus:bg-white outline-none transition-all duration-300 font-medium text-slate-700"
                          placeholder="email@example.com"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 ml-1">
                        Phone Number
                      </label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                          <Phone className="w-4 h-4" />
                        </div>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 focus:bg-white outline-none transition-all duration-300 font-medium text-slate-700"
                          placeholder="+977 9800000000"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 ml-1">
                        Resident Address
                      </label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                          <MapPin className="w-4 h-4" />
                        </div>
                        <input
                          type="text"
                          name="address"
                          value={formData.address}
                          onChange={handleChange}
                          className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 focus:bg-white outline-none transition-all duration-300 font-medium text-slate-700"
                          placeholder="City, Street Name"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="hidden">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                  </div>

                  {/* Form Footer */}
                  <div className="pt-8 border-t border-slate-50 flex items-center justify-between">
                    <p className="text-sm text-slate-400 hidden md:block">
                      Fields marked with <span className="text-rose-500 font-bold">*</span> are required.
                    </p>
                    <div className="flex gap-4 w-full md:w-auto">
                      <button
                        type="button"
                        onClick={() => navigate('/admin/dashboard')}
                        className="flex-1 md:flex-none px-8 py-3 bg-white border border-slate-200 text-slate-600 font-bold rounded-2xl hover:bg-slate-50 transition-all duration-300"
                      >
                        Discard
                      </button>
                      <button
                        type="submit"
                        disabled={saving}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-3 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-200 transition-all duration-300"
                      >
                        {saving ? (
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                          <Save className="w-5 h-5" />
                        )}
                        {saving ? 'Updating...' : 'Save Profile'}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
