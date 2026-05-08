
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Folder, Edit, Save, X, AlertCircle } from 'lucide-react';
import Sidebar from '../Sidebar';
import Topbar from '../Topbar';
import LoadingSpinner from '../../../components/LoadingSpinner';
import { API_ENDPOINTS } from '../../../src/constant/api';

const initialFormData = {
  name: '',
}

const initialNotification = { show: false, message: '', type: 'success' }

export default function EditCategory() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [formData, setFormData] = useState(initialFormData)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [notification, setNotification] = useState(initialNotification)

  useEffect(() => {
    loadCategory()
  }, [id])

  useEffect(() => {
    if (notification.show) {
      const timer = setTimeout(() => setNotification(initialNotification), 3000)
      return () => clearTimeout(timer)
    }
  }, [notification.show])

  const loadCategory = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(API_ENDPOINTS.CATEGORY_BY_ID(id), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        }
      })
      const data = await response.json()

      if (data.success) {
        const category = data.data
        setFormData({
          name: category.name || '',
        })
      } else {
        setNotification({ show: true, message: 'Failed to load category', type: 'error' })
      }
    } catch (err) {
      setNotification({ show: true, message: 'Failed to load category', type: 'error' })
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      return setNotification({ show: true, message: 'Category name is required', type: 'error' })
    }

    setSubmitting(true)

    try {
      const token = localStorage.getItem('token')
      
      const response = await fetch(API_ENDPOINTS.CATEGORY_BY_ID(id), {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
        })
      })

      const data = await response.json()

      if (data.success) {
        navigate('/admin/categories', {
          state: { message: 'Category updated successfully!', type: 'success' }
        })
      } else {
        // Handle validation errors
        let errorMessage = data.message || 'Failed to update category'
        
        if (data.errors) {
          const errorMessages = Object.values(data.errors).flat()
          errorMessage = errorMessages.join(', ')
        }
        
        throw new Error(errorMessage)
      }
    } catch (err) {
      setNotification({ show: true, message: err.message || 'Failed to update category', type: 'error' })
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

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
                <h1 className="text-3xl font-bold text-gray-800">Edit Category</h1>
                <p className="text-gray-500 text-sm">Update category information</p>
              </div>
            </div>

            {/* Form Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Info Section */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Folder size={20} className="text-green-600" />
                    <h3 className="text-lg font-semibold text-gray-800">Category Information</h3>
                  </div>
                  
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <span>Category Name</span>
                      <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="text" 
                      name="name" 
                      value={formData.name} 
                      onChange={handleChange} 
                      required 
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                      placeholder="Enter category name"
                    />
                  </div>
                </div>

                {/* Info Note */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
                    <div className="text-sm text-green-800">
                      <p className="font-medium mb-1">Update Guidelines</p>
                      <p className="text-green-700">Changes to this category will affect all associated products and subcategories.</p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <button 
                    type="button" 
                    onClick={() => navigate('/admin/categories')} 
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
                    {submitting ? 'Updating...' : 'Update Category'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}