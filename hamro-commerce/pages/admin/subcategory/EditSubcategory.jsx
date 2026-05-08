import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FolderTree, Edit, Save, X, AlertCircle, CheckCircle } from 'lucide-react';
import Sidebar from '../Sidebar';
import Topbar from '../Topbar';
import LoadingSpinner from '../../../components/LoadingSpinner';
import { API_ENDPOINTS } from '../../../src/constant/api';

const initialFormData = {
  name: '',
  category_id: '',
  status: 'Active',
}

const initialNotification = { show: false, message: '', type: 'success' }

export default function EditSubcategory() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [formData, setFormData] = useState(initialFormData)
  const [categories, setCategories] = useState([])
  const [selectedCategoryName, setSelectedCategoryName] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [notification, setNotification] = useState(initialNotification)

  useEffect(() => {
    fetchCategories()
    loadSubcategory()
  }, [id])

  useEffect(() => {
    if (notification.show) {
      const timer = setTimeout(() => setNotification(initialNotification), 3000)
      return () => clearTimeout(timer)
    }
  }, [notification.show])

  useEffect(() => {
    if (formData.category_id && categories.length > 0) {
      const category = categories.find(cat => cat.id == formData.category_id)
      if (category) {
        setSelectedCategoryName(category.name)
      }
    }
  }, [formData.category_id, categories])

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(API_ENDPOINTS.CATEGORIES, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        }
      })
      const data = await response.json()
      if (data.success) {
        setCategories(data.categories || [])
      } else if (data.data) {
        setCategories(data.data || [])
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const loadSubcategory = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(API_ENDPOINTS.SUBCATEGORY_BY_ID(id), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        }
      })
      const data = await response.json()

      if (data.success) {
        const subcategory = data.subcategory
        setFormData({
          name: subcategory.name || '',
          category_id: subcategory.category_id || '',
          status: subcategory.status || 'Active',
        })
      } else {
        setNotification({ show: true, message: 'Failed to load subcategory', type: 'error' })
      }
    } catch (err) {
      setNotification({ show: true, message: 'Failed to load subcategory', type: 'error' })
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
      return setNotification({ show: true, message: 'Subcategory name is required', type: 'error' })
    }

    if (!formData.category_id) {
      return setNotification({ show: true, message: 'Please select a category', type: 'error' })
    }

    setSubmitting(true)

    try {
      const token = localStorage.getItem('token')
      const form = new FormData()
      form.append('name', formData.name)
      form.append('category_id', formData.category_id)
      form.append('status', formData.status)
      form.append('_method', 'PUT')

      const response = await fetch(API_ENDPOINTS.SUBCATEGORY_BY_ID(id), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        body: form
      })

      const data = await response.json()

      if (data.success) {
        navigate(`/admin/subcategories?category=${formData.category_id}`, {
          state: { message: 'Subcategory updated successfully!', type: 'success' }
        })
      } else {
        throw new Error(data.message || 'Failed to update subcategory')
      }
    } catch (err) {
      setNotification({ show: true, message: err.message || 'Failed to update subcategory', type: 'error' })
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleCancel = () => {
    if (formData.category_id) {
      navigate(`/admin/subcategories?category=${formData.category_id}`)
    } else {
      navigate('/admin/subcategories')
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
                {selectedCategoryName && (
                  <p className="text-sm text-gray-500">
                    <span className="font-medium">{selectedCategoryName}</span>
                  </p>
                )}
                <h1 className="text-3xl font-bold text-gray-800">
                  {selectedCategoryName ? `Edit Subcategory in ${selectedCategoryName}` : 'Edit Subcategory'}
                </h1>
                <p className="text-gray-500 text-sm">Update subcategory information</p>
              </div>
            </div>

            {/* Form Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Info Section */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <FolderTree size={20} className="text-green-600" />
                    <h3 className="text-lg font-semibold text-gray-800">Subcategory Information</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <span>Subcategory Name</span>
                        <span className="text-red-500">*</span>
                      </label>
                      <input 
                        type="text" 
                        name="name" 
                        value={formData.name} 
                        onChange={handleChange} 
                        required 
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all" 
                        placeholder="Enter subcategory name"
                      />
                    </div>

                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <CheckCircle size={16} />
                        <span>Status</span>
                      </label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
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
                      <p className="text-green-700">Changes to this subcategory will affect all associated products.</p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
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
                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium shadow-lg shadow-green-200"
                  >
                    <Save size={18} />
                    {submitting ? 'Updating...' : 'Update Subcategory'}
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
