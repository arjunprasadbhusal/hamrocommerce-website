import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Save, 
  Bell, 
  Mail, 
  Shield, 
  Globe, 
  Database,
  Paintbrush,
  Clock,
  Monitor,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

interface SettingsData {
  // Notifications
  email_notifications: boolean;
  order_notifications: boolean;
  product_notifications: boolean;
  message_notifications: boolean;
  
  // Display
  items_per_page: number;
  theme: 'light' | 'dark' | 'auto';
  language: string;
  timezone: string;
  
  // Security
  two_factor_auth: boolean;
  session_timeout: number;
  ip_whitelist: boolean;
}

const Settings = () => {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('notifications');
  const [settings, setSettings] = useState<SettingsData>({
    email_notifications: true,
    order_notifications: true,
    product_notifications: true,
    message_notifications: true,
    items_per_page: 10,
    theme: 'light',
    language: 'en',
    timezone: 'Asia/Kathmandu',
    two_factor_auth: false,
    session_timeout: 30,
    ip_whitelist: false,
  });
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = () => {
    const savedSettings = localStorage.getItem('adminSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  };

  const handleToggle = (key: keyof SettingsData) => {
    setSettings({
      ...settings,
      [key]: !settings[key]
    });
  };

  const handleChange = (key: keyof SettingsData, value: any) => {
    setSettings({
      ...settings,
      [key]: value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      localStorage.setItem('adminSettings', JSON.stringify(settings));
      showNotification('Settings saved successfully!', 'success');
    } catch (error) {
      console.error('Error saving settings:', error);
      showNotification('Failed to save settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 3000);
  };

  const tabs = [
    { id: 'notifications', label: 'Notifications', icon: Bell, description: 'Choose how you receive updates' },
    { id: 'display', label: 'Appearance', icon: Monitor, description: 'Customize your dashboard view' },
    { id: 'security', label: 'Security', icon: Shield, description: 'Protect your account data' },
  ];

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
                {notification.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
              </div>
              <p className="font-semibold">{notification.message}</p>
            </div>
          )}

          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="group p-2.5 bg-white border border-slate-200 hover:border-blue-300 hover:bg-blue-50 rounded-xl transition-all duration-300 shadow-sm"
            >
              <ArrowLeft className="w-5 h-5 text-slate-600 group-hover:text-blue-600 group-hover:-translate-x-1 transition-transform" />
            </button>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">System Settings</h1>
              <p className="text-slate-500 text-sm mt-1 font-medium">Configure and personalize your administrative environment</p>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
            {/* Sidebar Tabs */}
            <div className="xl:col-span-3 space-y-3">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full text-left p-4 rounded-2xl transition-all duration-300 group ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 translate-x-2'
                      : 'bg-white border border-slate-100 text-slate-600 hover:bg-slate-50 hover:border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl transition-colors ${
                      activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500'
                    }`}>
                      <tab.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-sm leading-tight">{tab.label}</p>
                      <p className={`text-[10px] mt-0.5 leading-tight ${activeTab === tab.id ? 'text-blue-100' : 'text-slate-400'}`}>
                        {tab.description}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Main Content Card */}
            <div className="xl:col-span-9">
              <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                <form onSubmit={handleSubmit}>
                  <div className="p-8 md:p-10">
                    {activeTab === 'notifications' && (
                      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div>
                          <h3 className="text-xl font-bold text-slate-900">Notifications</h3>
                          <p className="text-slate-500 text-sm">Manage how you want to be alerted about store activities</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {[
                            { id: 'email_notifications', label: 'Email Alerts', sub: 'Receive daily summary via email', icon: Mail },
                            { id: 'order_notifications', label: 'New Orders', sub: 'Instant alerts for every new order', icon: Database },
                            { id: 'product_notifications', label: 'Inventory', sub: 'Low stock and restocking alerts', icon: Paintbrush },
                            { id: 'message_notifications', label: 'Messages', sub: 'Notification for customer inquiries', icon: Mail },
                          ].map((item) => (
                            <div key={item.id} className="flex items-center justify-between p-5 rounded-2xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-all group">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-slate-400 group-hover:text-blue-500 transition-colors">
                                  <item.icon className="w-5 h-5" />
                                </div>
                                <div>
                                  <p className="font-bold text-slate-700 text-sm">{item.label}</p>
                                  <p className="text-[11px] text-slate-400 font-medium">{item.sub}</p>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleToggle(item.id as keyof SettingsData)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 ${
                                  settings[item.id as keyof SettingsData] ? 'bg-blue-600' : 'bg-slate-300'
                                }`}
                              >
                                <span
                                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${
                                    settings[item.id as keyof SettingsData] ? 'translate-x-6' : 'translate-x-1'
                                  }`}
                                />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {activeTab === 'display' && (
                      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div>
                          <h3 className="text-xl font-bold text-slate-900">Appearance</h3>
                          <p className="text-slate-500 text-sm">Control how the dashboard looks and feels to you</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 ml-1">Items Per Page</label>
                            <select
                              value={settings.items_per_page}
                              onChange={(e) => handleChange('items_per_page', parseInt(e.target.value))}
                              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-medium text-slate-700 appearance-none cursor-pointer"
                            >
                              <option value={10}>10 Items</option>
                              <option value={25}>25 Items</option>
                              <option value={50}>50 Items</option>
                              <option value={100}>100 Items</option>
                            </select>
                          </div>

                          <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 ml-1">UI Theme</label>
                            <select
                              value={settings.theme}
                              onChange={(e) => handleChange('theme', e.target.value)}
                              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-medium text-slate-700 appearance-none cursor-pointer"
                            >
                              <option value="light">☀️ Light Mode</option>
                              <option value="dark">🌙 Dark Mode</option>
                              <option value="auto">💻 System Default</option>
                            </select>
                          </div>

                          <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 ml-1">Language</label>
                            <select
                              value={settings.language}
                              onChange={(e) => handleChange('language', e.target.value)}
                              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-medium text-slate-700 appearance-none cursor-pointer"
                            >
                              <option value="en">🇺🇸 English (US)</option>
                              <option value="ne">🇳🇵 Nepali (नेपाली)</option>
                            </select>
                          </div>

                          <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 ml-1">Timezone</label>
                            <select
                              value={settings.timezone}
                              onChange={(e) => handleChange('timezone', e.target.value)}
                              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-medium text-slate-700 appearance-none cursor-pointer"
                            >
                              <option value="Asia/Kathmandu">Kathmandu (GMT+5:45)</option>
                              <option value="Asia/Kolkata">New Delhi (GMT+5:30)</option>
                              <option value="Europe/London">London (GMT+0:00)</option>
                              <option value="America/New_York">New York (GMT-5:00)</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === 'security' && (
                      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div>
                          <h3 className="text-xl font-bold text-slate-900">Security</h3>
                          <p className="text-slate-500 text-sm">Enhance your administrative account protection</p>
                        </div>

                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-6 rounded-3xl bg-slate-900 text-white shadow-xl shadow-slate-200/50 group">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-blue-400">
                                <Shield className="w-6 h-6" />
                              </div>
                              <div>
                                <p className="font-bold text-lg">Two-Factor Authentication</p>
                                <p className="text-xs text-slate-400 font-medium">Add an extra layer of security to your logins</p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleToggle('two_factor_auth')}
                              className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all duration-300 ${
                                settings.two_factor_auth ? 'bg-blue-500' : 'bg-white/20'
                              }`}
                            >
                              <span
                                className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-300 ${
                                  settings.two_factor_auth ? 'translate-x-6' : 'translate-x-1'
                                }`}
                              />
                            </button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100">
                               <div className="flex items-center justify-between mb-4">
                                  <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-slate-400">
                                     <Globe className="w-5 h-5" />
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => handleToggle('ip_whitelist')}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 ${
                                      settings.ip_whitelist ? 'bg-blue-600' : 'bg-slate-300'
                                    }`}
                                  >
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${settings.ip_whitelist ? 'translate-x-6' : 'translate-x-1'}`} />
                                  </button>
                               </div>
                               <p className="font-bold text-slate-700 text-sm">IP Restriction</p>
                               <p className="text-[11px] text-slate-400 font-medium">Only allow access from specific IP addresses</p>
                            </div>

                            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100">
                               <div className="flex items-center justify-between mb-4">
                                  <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-slate-400">
                                     <Clock className="w-5 h-5" />
                                  </div>
                               </div>
                               <p className="font-bold text-slate-700 text-sm mb-2">Session Timeout</p>
                               <select
                                  value={settings.session_timeout}
                                  onChange={(e) => handleChange('session_timeout', parseInt(e.target.value))}
                                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl outline-none text-xs font-bold text-slate-600 appearance-none cursor-pointer"
                                >
                                  <option value={15}>15 Minutes</option>
                                  <option value={30}>30 Minutes</option>
                                  <option value={60}>1 Hour</option>
                                  <option value={120}>2 Hours</option>
                                </select>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="p-8 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
                    <p className="text-xs text-slate-400 font-medium hidden md:block">
                      Changes will be saved locally to your browser profile.
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
                        {saving ? 'Saving...' : 'Apply Changes'}
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

export default Settings;