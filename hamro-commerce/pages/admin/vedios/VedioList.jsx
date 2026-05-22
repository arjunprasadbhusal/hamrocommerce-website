import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Video, Edit2, Trash2, Plus, Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react';
import Sidebar from '../Sidebar';
import Topbar from '../Topbar';
import LoadingSpinner from '../../../components/LoadingSpinner';
import { API_ENDPOINTS } from '../../../src/constant/api';

const initialNotification = { show: false, message: '', type: 'success' };
const initialDeleteState = { show: false, id: null, title: '' };

export default function VedioList() {
  const [vedios, setVedios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(initialNotification);
  const [deleteConfirm, setDeleteConfirm] = useState(initialDeleteState);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetchVedios();
  }, []);

  useEffect(() => {
    if (notification.show) {
      const timer = setTimeout(() => setNotification(initialNotification), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification.show]);

  useEffect(() => {
    if (location.state?.message) {
      setNotification({
        show: true,
        message: location.state.message,
        type: location.state.type || 'success',
      });
      navigate(location.pathname, { replace: true });
    }
  }, [location.pathname, location.state, navigate]);

  const fetchVedios = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(API_ENDPOINTS.VEDIOS, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        }
      });

      const data = await response.json();
      const sortedVedios = (data.data || []).sort((a, b) => a.id - b.id);
      setVedios(sortedVedios);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to load videos');
      console.error('Error fetching videos:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = async (id, currentStatus) => {
    try {
      const token = localStorage.getItem('token');
      const newStatus = currentStatus === 'show' ? 'hide' : 'show';
      
      const response = await fetch(API_ENDPOINTS.VEDIO_UPDATE_STATUS(id), {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await response.json();

      if (data.success) {
        setNotification({ show: true, message: 'Video status updated successfully!', type: 'success' });
        fetchVedios();
      } else {
        throw new Error(data.message || 'Failed to update status');
      }
    } catch (err) {
      setNotification({
        show: true,
        message: err.message || 'Failed to update status',
        type: 'error',
      });
    }
  };

  const handleDeleteRequest = (id, title) => {
    setDeleteConfirm({ show: true, id, title });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm.id) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(API_ENDPOINTS.VEDIO_BY_ID(deleteConfirm.id), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        }
      });

      const data = await response.json();

      if (data.success) {
        setNotification({ show: true, message: 'Video deleted successfully!', type: 'success' });
        fetchVedios();
      } else {
        throw new Error(data.message || 'Failed to delete video');
      }
    } catch (err) {
      setNotification({
        show: true,
        message: err.message || 'Failed to delete video',
        type: 'error',
      });
      console.error('Error deleting video:', err);
    } finally {
      setDeleteConfirm(initialDeleteState);
    }
  };

  const cancelDelete = () => {
    setDeleteConfirm(initialDeleteState);
  };

  const handleAddNew = () => {
    navigate('/admin/vedios/add');
  };

  const handleEdit = (id) => {
    navigate(`/admin/vedios/${id}/edit`);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Sidebar />
        <div className="flex-1 overflow-auto p-8">
          <div className="max-w-2xl mx-auto">
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 shadow-sm">
              <div className="flex items-start gap-3">
                <XCircle className="text-red-600 flex-shrink-0 mt-0.5" size={24} />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-red-800 mb-1">Error Loading Videos</h3>
                  <p className="text-red-700">{error}</p>
                </div>
              </div>
              <button 
                className="mt-4 flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all font-medium shadow-lg shadow-red-200" 
                onClick={fetchVedios}
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        <div className="flex-1 overflow-auto p-8">
          <div className="max-w-7xl mx-auto">
            {notification.show && (
              <div className={`mb-4 p-4 rounded-lg border shadow-sm animate-fadeIn ${
                notification.type === 'success' 
                  ? 'bg-green-50 text-green-800 border-green-200' 
                  : 'bg-red-50 text-red-800 border-red-200'
              }`}>
                <div className="flex items-center gap-2">
                  {notification.type === 'success' ? (
                    <CheckCircle size={20} className="text-green-600" />
                  ) : (
                    <XCircle size={20} className="text-red-600" />
                  )}
                  <span className="font-medium">{notification.message}</span>
                </div>
              </div>
            )}

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-600 rounded-lg">
                  <Video className="text-white" size={28} />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-800">Video Management</h1>
                  <p className="text-gray-500 text-sm">Manage promotional videos</p>
                </div>
              </div>
              <button 
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all font-medium shadow-lg shadow-purple-200" 
                onClick={handleAddNew}
              >
                <Plus size={20} />
                Add Video
              </button>
            </div>

            {/* Table Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Video Preview</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">File Path</th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Priority</th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200">
                  {vedios.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-16">
                        <div className="text-center">
                          <Video size={48} className="mx-auto text-gray-400 mb-3" />
                          <p className="text-gray-600 text-lg font-medium">No videos found</p>
                          <p className="text-gray-400 text-sm mt-1">Upload your first video to get started</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    vedios.map((vedio) => (
                      <tr key={vedio.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          {vedio.vedio_full_url ? (
                            <video width="150" height="90" controls className="rounded-lg border border-gray-200 shadow-sm">
                              <source src={vedio.vedio_full_url} type="video/mp4" />
                              Your browser does not support the video tag.
                            </video>
                          ) : (
                            <div className="w-32 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center border border-gray-200">
                              <Video className="text-gray-400" size={32} />
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 truncate max-w-xs font-medium">{vedio.vedio_url || 'N/A'}</div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="inline-block px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-semibold">
                            {vedio.priority}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => handleStatusToggle(vedio.id, vedio.status)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full transition-colors ${
                              vedio.status === 'show'
                                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {vedio.status === 'show' ? (
                              <><Eye size={14} /> Visible</>
                            ) : (
                              <><EyeOff size={14} /> Hidden</>
                            )}
                          </button>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2 justify-center">
                            <button 
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" 
                              onClick={() => handleEdit(vedio.id)}
                              title="Edit video"
                            >
                              <Edit2 size={18} />
                            </button>
                            <button 
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" 
                              onClick={() => handleDeleteRequest(vedio.id, vedio.title)}
                              title="Delete video"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Delete Confirmation Modal */}
          {deleteConfirm.show && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={cancelDelete}>
              <div className="relative bg-white rounded-xl shadow-2xl p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
                <button
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                  onClick={cancelDelete}
                >
                  <XCircle size={24} />
                </button>
                <div className="flex flex-col items-center text-center gap-2 mb-4">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <Trash2 className="text-red-600" size={24} />
                  </div>
                  <h2 className="text-xl font-bold text-gray-800">Confirm Delete</h2>
                  <p className="text-sm text-gray-600">This action cannot be undone</p>
                </div>
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-center">
                  <p className="text-sm text-gray-700">Are you sure you want to delete <strong className="text-red-600">{deleteConfirm.title}</strong>?</p>
                  <p className="text-red-700 text-sm mt-2 font-medium">The video file will be permanently deleted.</p>
                </div>
                <div className="flex gap-3 justify-center">
                  <button
                    className="px-6 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-medium"
                    onClick={cancelDelete}
                  >
                    Cancel
                  </button>
                  <button
                    className="flex items-center gap-2 px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all font-medium shadow-lg shadow-red-200"
                    onClick={confirmDelete}
                  >
                    <Trash2 size={18} />
                    Delete Video
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
