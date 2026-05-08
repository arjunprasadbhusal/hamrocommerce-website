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
  Monitor
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
    // Notifications
    email_notifications: true,
    order_notifications: true,
    product_notifications: true,
    message_notifications: true,
    
    // Display
    items_per_page: 10,
    theme: 'light',
    language: 'en',
    timezone: 'Asia/Kathmandu',
    
    // Security
    two_factor_auth: false,
    session_timeout: 30,
    ip_whitelist: false,
  });
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = () => {
    // Load settings from localStorage
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
      // Save settings to localStorage (in real app, send to API)
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
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'display', label: 'Display', icon: Monitor },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        <div className="flex-1 overflow-auto p-8">
          {/* Notification */}
          {notification.show && (
            <div className={`mb-4 p-4 rounded-lg ${notification.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {notification.message}
            </div>
          )}

          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/admin/dashboard')}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Settings</h1>
                <p className="text-gray-600 mt-1">Manage your application preferences</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Tabs Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow p-4 space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                        activeTab === tab.id
                          ? 'bg-blue-50 text-blue-600 font-semibold'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Settings Content */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-lg shadow p-6">
                <form onSubmit={handleSubmit}>
                  {/* Notifications Tab */}
                  {activeTab === 'notifications' && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                          <Bell className="w-5 h-5" />
                          Notification Preferences
                        </h3>
                        <p className="text-gray-600 mb-6">Choose what notifications you want to receive</p>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <Mail className="w-5 h-5 text-gray-600" />
                            <div>
                              <p className="font-semibold text-gray-800">Email Notifications</p>
                              <p className="text-sm text-gray-600">Receive notifications via email</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleToggle('email_notifications')}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              settings.email_notifications ? 'bg-blue-600' : 'bg-gray-300'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                settings.email_notifications ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <Database className="w-5 h-5 text-gray-600" />
                            <div>
                              <p className="font-semibold text-gray-800">Order Notifications</p>
                              <p className="text-sm text-gray-600">Get notified about new orders</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleToggle('order_notifications')}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              settings.order_notifications ? 'bg-blue-600' : 'bg-gray-300'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                settings.order_notifications ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <Paintbrush className="w-5 h-5 text-gray-600" />
                            <div>
                              <p className="font-semibold text-gray-800">Product Notifications</p>
                              <p className="text-sm text-gray-600">Low stock and product updates</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleToggle('product_notifications')}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              settings.product_notifications ? 'bg-blue-600' : 'bg-gray-300'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                settings.product_notifications ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <Mail className="w-5 h-5 text-gray-600" />
                            <div>
                              <p className="font-semibold text-gray-800">Message Notifications</p>
                              <p className="text-sm text-gray-600">New customer messages</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleToggle('message_notifications')}
                            className={`relative inline-flex h-6 w-11 items-centers rounded-full transition-colors ${
                              settings.message_notifications ? 'bg-blue-600' : 'bg-gray-300'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                settings.message_notifications ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Display Tab */}
                  {activeTab === 'display' && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                          <Monitor className="w-5 h-5" />
                          Display Settings
                        </h3>
                        <p className="text-gray-600 mb-6">Customize your dashboard appearance</p>
                      </div>

                      <div className="space-y-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Items Per Page
                          </label>
                          <select
                            value={settings.items_per_page}
                            onChange={(e) => handleChange('items_per_page', parseInt(e.target.value))}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value={5}>5 items</option>
                            <option value={10}>10 items</option>
                            <option value={25}>25 items</option>
                            <option value={50}>50 items</option>
                            <option value={100}>100 items</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Theme
                          </label>
                          <select
                            value={settings.theme}
                            onChange={(e) => handleChange('theme', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="light">Light</option>
                            <option value="dark">Dark</option>
                            <option value="auto">Auto (System)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Language
                          </label>
                          <select
                            value={settings.language}
                            onChange={(e) => handleChange('language', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="en">English</option>
                            <option value="ne">Nepali (नेपाली)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Timezone
                          </label>
                          <select
                            value={settings.timezone}
                            onChange={(e) => handleChange('timezone', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="Asia/Kathmandu">Asia/Kathmandu (GMT+5:45)</option>
                            <option value="Asia/Kolkata">Asia/Kolkata (GMT+5:30)</option>
                            <option value="Asia/Dubai">Asia/Dubai (GMT+4:00)</option>
                            <option value="Europe/London">Europe/London (GMT+0:00)</option>
                            <option value="America/New_York">America/New York (GMT-5:00)</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Security Tab */}
                  {activeTab === 'security' && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                          <Shield className="w-5 h-5" />
                          Security Settings
                        </h3>
                        <p className="text-gray-600 mb-6">Manage your account security</p>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <Shield className="w-5 h-5 text-gray-600" />
                            <div>
                              <p className="font-semibold text-gray-800">Two-Factor Authentication</p>
                              <p className="text-sm text-gray-600">Add an extra layer of security</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleToggle('two_factor_auth')}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              settings.two_factor_auth ? 'bg-blue-600' : 'bg-gray-300'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                settings.two_factor_auth ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <Globe className="w-5 h-5 text-gray-600" />
                            <div>
                              <p className="font-semibold text-gray-800">IP Whitelist</p>
                              <p className="text-sm text-gray-600">Restrict access to specific IPs</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleToggle('ip_whitelist')}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              settings.ip_whitelist ? 'bg-blue-600' : 'bg-gray-300'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                settings.ip_whitelist ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Session Timeout (minutes)
                          </label>
                          <select
                            value={settings.session_timeout}
                            onChange={(e) => handleChange('session_timeout', parseInt(e.target.value))}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value={15}>15 minutes</option>
                            <option value={30}>30 minutes</option>
                            <option value={60}>1 hour</option>
                            <option value={120}>2 hours</option>
                            <option value={240}>4 hours</option>
                          </select>
                          <p className="text-sm text-gray-500 mt-2">
                            You will be automatically logged out after this period of inactivity
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Submit Button */}
                  <div className="flex gap-4 pt-6 border-t mt-8">
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Save className="w-4 h-4" />
                      {saving ? 'Saving...' : 'Save Settings'}
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate('/admin/dashboard')}
                      className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
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
