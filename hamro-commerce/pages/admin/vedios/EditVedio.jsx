import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Video, Edit, Upload, Save, X, AlertCircle, ArrowUpDown, Eye } from 'lucide-react';
import Sidebar from '../Sidebar';
import Topbar from '../Topbar';
import LoadingSpinner from '../../../components/LoadingSpinner';
import { API_ENDPOINTS } from '../../../src/constant/api';

const initialFormData = {
  vedio_file: null,
  existing_vedio_url: '',
  priority: '0',
  status: 'show',
};

const initialNotification = { show: false, message: '', type: 'success' };

export default function EditVedio() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState(initialFormData);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState(initialNotification);

  useEffect(() => {
    loadVideo();
  }, [id]);

  useEffect(() => {
    if (notification.show) {
      const timer = setTimeout(() => setNotification(initialNotification), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification.show]);

  const loadVideo = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(API_ENDPOINTS.VEDIO_BY_ID(id), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        }
      });
      const data = await response.json();

      if (data.success) {
        const vedio = data.data;
        setFormData({
          vedio_file: null,
          existing_vedio_url: vedio.vedio_url || '',
          priority: vedio.priority || '0',
          status: vedio.status || 'show',
        });
      } else {
        setNotification({ show: true, message: 'Failed to load video', type: 'error' });
      }
    } catch (err) {
      setNotification({ show: true, message: 'Failed to load video', type: 'error' });
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'vedio_file') {
      setFormData({ ...formData, [name]: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSubmitting(true);

    try {
      const token = localStorage.getItem('token');

      const formDataToSend = new FormData();
      if (formData.vedio_file) {
        formDataToSend.append('vedio_file', formData.vedio_file);
      }
      formDataToSend.append('priority', formData.priority);
      formDataToSend.append('status', formData.status);
      formDataToSend.append('_method', 'PUT');

      const response = await fetch(API_ENDPOINTS.VEDIO_BY_ID(id), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        body: formDataToSend
      });

      const data = await response.json();

      if (data.success) {
        navigate('/admin/vedios', {
          state: { message: 'Video updated successfully!', type: 'success' }
        });
      } else {
        throw new Error(data.message || 'Failed to update video');
      }
    } catch (err) {
      setNotification({ show: true, message: err.message || 'Failed to update video', type: 'error' });
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        <div className="flex-1 overflow-auto p-8">
          <div className="max-w-3xl mx-auto">
            {notification.show && (
              <div className={`mb-4 p-4 rounded-lg border shadow-sm animate-fadeIn ${
                notification.type === 'success' 
                  ? 'bg-green-50 text-green-800 border-green-200' 
                  : 'bg-red-50 text-red-800 border-red-200'
              }`}>
                <div className="flex items-center gap-2">
                  {notification.type === 'success' ? (
                    <div className="w-5 h-5 bg-green-600 text-white rounded-full flex items-center justify-center text-xs">✓</div>
                  ) : (
                    <AlertCircle size={20} className="text-red-600" />
                  )}
                  <span className="font-medium">{notification.message}</span>
                </div>
              </div>
            )}

            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-green-600 rounded-lg">
                <Edit className="text-white" size={28} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Edit Video</h1>
                <p className="text-gray-500 text-sm">Update video information</p>
              </div>
            </div>

            {/* Form Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Current Video Section */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Video size={20} className="text-green-600" />
                    <h3 className="text-lg font-semibold text-gray-800">Current Video</h3>
                  </div>
                  
                  {formData.existing_vedio_url ? (
                    <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-sm font-medium text-gray-700 mb-1">Video URL:</p>
                      <p className="text-sm text-gray-600 break-all">{formData.existing_vedio_url}</p>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">No video uploaded</p>
                  )}
                </div>

                {/* Upload New Video Section */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Upload size={20} className="text-green-600" />
                    <h3 className="text-lg font-semibold text-gray-800">Upload New Video</h3>
                  </div>
                  
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <span>New Video File (Optional)</span>
                    </label>
                    <input
                      type="file"
                      name="vedio_file"
                      onChange={handleChange}
                      accept="video/mp4,video/mov,video/avi,video/wmv,video/x-flv,video/x-matroska"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                    />
                    <p className="text-xs text-gray-500 mt-2 flex items-center gap-1.5">
                      <AlertCircle size={14} />
                      Leave empty to keep existing video. Supported formats: MP4, MOV, AVI, WMV, FLV, MKV (Max: 100MB)
                    </p>
                  </div>
                </div>

                {/* Settings Section */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <ArrowUpDown size={20} className="text-green-600" />
                    <h3 className="text-lg font-semibold text-gray-800">Video Settings</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <span>Priority</span>
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        name="priority"
                        value={formData.priority}
                        onChange={handleChange}
                        required
                        min="0"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                        placeholder="0"
                      />
                      <p className="text-xs text-gray-500 mt-1">Lower number = higher priority</p>
                    </div>

                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <Eye size={16} />
                        <span>Status</span>
                        <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                      >
                        <option value="show">Visible</option>
                        <option value="hide">Hidden</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Info Note */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
                    <div className="text-sm text-green-800">
                      <p className="font-medium mb-1">Update Guidelines</p>
                      <p className="text-green-700">Only upload a new video if you want to replace the existing one. Settings changes will be saved regardless.</p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => navigate('/admin/vedios')}
                    className="flex items-center gap-2 px-5 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-medium"
                  >
                    <X size={18} />
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium shadow-lg shadow-green-200"
                  >
                    <Save size={18} />
                    {submitting ? 'Updating...' : 'Update Video'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
