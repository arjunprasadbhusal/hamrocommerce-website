import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Image as ImageIcon, Upload, Save, X, AlertCircle } from 'lucide-react';
import Sidebar from '../Sidebar';
import Topbar from '../Topbar';
import { useAlert } from '../../../context/AlertContext';
import { TESTIMONIAL_ENDPOINTS } from '../../../src/constants/api/testimonial.js';

const initialFormData = {
  name: '',
  title: '',
  description: '',
  photopath: null,
};

export default function AddTestimonial() {
  const { showAlert } = useAlert();
  const [formData, setFormData] = useState(initialFormData);
  const [imagePreview, setImagePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

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

      const response = await fetch(TESTIMONIAL_ENDPOINTS.CREATE, {
        method: 'POST',
        headers: token
          ? { Accept: 'application/json', Authorization: `Bearer ${token}` }
          : { Accept: 'application/json' },
        body: form,
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to add testimonial');
      }
      showAlert({ type: 'success', title: 'Success', message: 'Testimonial added successfully!' });
      navigate('/admin/testimonials');
    } catch (err) {
      showAlert({ type: 'error', title: 'Error', message: err.message || 'Failed to add testimonial' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => navigate('/admin/testimonials');

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        <div className="flex-1 overflow-auto p-8">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-indigo-600 rounded-lg">
                <ImageIcon className="text-white" size={28} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Add New Testimonial</h1>
                <p className="text-gray-500 text-sm">Create a new customer testimonial</p>
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
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Photo (optional, max 5MB)</label>
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

                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="text-indigo-600 flex-shrink-0 mt-0.5" size={20} />
                    <div className="text-sm text-indigo-800">
                      <p className="font-medium mb-1">Testimonial Guidelines</p>
                      <p className="text-indigo-700">Use a short, clear title and a concise description for best display.</p>
                    </div>
                  </div>
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
                    {submitting ? 'Adding...' : 'Add Testimonial'}
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
