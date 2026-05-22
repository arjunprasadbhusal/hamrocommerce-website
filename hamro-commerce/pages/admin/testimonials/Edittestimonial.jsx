import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Image as ImageIcon, Edit, Upload, Save, X } from 'lucide-react';
import Sidebar from '../Sidebar';
import Topbar from '../Topbar';
import { useAlert } from '../../../context/AlertContext';
import { TESTIMONIAL_ENDPOINTS } from '../../../src/constants/api/testimonial.js';
import { BASE_URL } from '../../../src/constant/api';

const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  return imagePath.startsWith('http')
    ? imagePath
    : `${BASE_URL}/storage/${imagePath}`;
};

export default function EditTestimonial() {
  const { showAlert } = useAlert();
  const { id } = useParams();
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    description: '',
    photopath: null,
  });
  const [currentImage, setCurrentImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadTestimonial();
  }, [id]);

  const loadTestimonial = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(TESTIMONIAL_ENDPOINTS.GET_BY_ID(id), {
        headers: token
          ? { Accept: 'application/json', Authorization: `Bearer ${token}` }
          : { Accept: 'application/json' },
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to load testimonial');
      }
      const testimonial = data.data;
      setFormData({
        name: testimonial.name || '',
        title: testimonial.title || '',
        description: testimonial.description || '',
        photopath: null,
      });
      setCurrentImage(testimonial.photopath || null);
    } catch (err) {
      showAlert({ type: 'error', title: 'Error', message: err.message || 'Failed to load testimonial' });
      navigate('/admin/testimonials');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (event) => {
    const { name, value, files } = event.target;

    if (name === 'photopath') {
      const file = files[0];
      if (file && file.size > 5120 * 1024) {
        showAlert({ type: 'error', title: 'Invalid File', message: 'Image must be less than 5MB' });
        return;
      }
      setFormData((prev) => ({ ...prev, photopath: file }));
      setImagePreview(file ? URL.createObjectURL(file) : null);
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.name.trim() || !formData.title.trim() || !formData.description.trim()) {
      showAlert({ type: 'error', title: 'Validation Error', message: 'Name, title, and description are required.' });
      return;
    }

    setSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      const form = new FormData();
      form.append('name', formData.name);
      form.append('title', formData.title);
      form.append('description', formData.description);
      if (formData.photopath) form.append('photopath', formData.photopath);

      const response = await fetch(`${TESTIMONIAL_ENDPOINTS.UPDATE(id)}?_method=PUT`, {
        method: 'POST',
        headers: token
          ? { Accept: 'application/json', Authorization: `Bearer ${token}` }
          : { Accept: 'application/json' },
        body: form,
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to update testimonial');
      }
      showAlert({ type: 'success', title: 'Success', message: 'Testimonial updated successfully!' });
      navigate('/admin/testimonials');
    } catch (err) {
      showAlert({ type: 'error', title: 'Error', message: err.message || 'Failed to update testimonial' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => navigate('/admin/testimonials');

  if (loading) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
            <p className="mt-4 text-gray-600 font-medium">Loading testimonial...</p>
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
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-indigo-600 rounded-lg">
                <Edit className="text-white" size={28} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Edit Testimonial</h1>
                <p className="text-gray-500 text-sm">Update testimonial information</p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <ImageIcon size={20} className="text-indigo-600" />
                    <h3 className="text-lg font-semibold text-gray-800">Testimonial Information</h3>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">Name</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        placeholder="Enter name"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">Title</label>
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        placeholder="Enter title"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">Description</label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows={5}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        placeholder="Write testimonial description"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Upload size={20} className="text-indigo-600" />
                    <h3 className="text-lg font-semibold text-gray-800">Photo</h3>
                  </div>

                  {currentImage && !imagePreview && (
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">Current Image:</p>
                      <img
                        src={getImageUrl(currentImage)}
                        alt="Current"
                        className="w-full max-w-2xl h-64 object-cover rounded-lg border border-gray-200 shadow-sm"
                      />
                    </div>
                  )}

                  <label className="text-sm font-medium text-gray-700 mb-2 block">New Photo (optional, max 5MB)</label>
                  <input
                    type="file"
                    name="photopath"
                    accept="image/*"
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                  />
                  {imagePreview && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
                      <img src={imagePreview} alt="Preview" className="w-full max-w-2xl h-64 object-cover rounded-lg border border-gray-200 shadow-sm" />
                    </div>
                  )}
                </div>

                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="flex items-center gap-2 px-5 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-medium"
                  >
                    <X size={18} />
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-lg hover:from-indigo-700 hover:to-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium shadow-lg shadow-indigo-200"
                  >
                    <Save size={18} />
                    {submitting ? 'Saving...' : 'Save Changes'}
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
