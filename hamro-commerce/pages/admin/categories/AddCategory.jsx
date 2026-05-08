import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Folder, Save, X, AlertCircle } from 'lucide-react'
import Sidebar from '../Sidebar'
import Topbar from '../Topbar'
import { API_ENDPOINTS } from '../../../src/constant/api'

const initialFormData = {
  name: '',
}

const initialNotification = { show: false, message: '', type: 'success' }

export default function AddCategory() {
  const [formData, setFormData] = useState(initialFormData)
  const [submitting, setSubmitting] = useState(false)
  const [notification, setNotification] = useState(initialNotification)

  const navigate = useNavigate()

  useEffect(() => {
    if (notification.show) {
      const timer = setTimeout(() => {
        setNotification(initialNotification)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [notification.show])

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!formData.name.trim()) {
      setNotification({ show: true, message: 'Category name is required', type: 'error' })
      return
    }

    setSubmitting(true)

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(API_ENDPOINTS.CATEGORIES, {
        method: 'POST',
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
          state: { message: 'Category added successfully!', type: 'success' },
        })
      } else {
        // Handle validation errors
        let errorMessage = data.message || 'Failed to add category'
        
        if (data.errors) {
          // Extract all validation error messages
          const errorMessages = Object.values(data.errors).flat()
          errorMessage = errorMessages.join(', ')
        }
        
        throw new Error(errorMessage)
      }
    } catch (err) {
      setNotification({ show: true, message: err.message || 'Failed to add category', type: 'error' })
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleCancel = () => navigate('/admin/categories')

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
              <div className="p-2 bg-blue-600 rounded-lg">
                <Folder className="text-white" size={28} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Add New Category</h1>
                <p className="text-gray-500 text-sm">Create a new product category</p>
              </div>
            </div>

            {/* Form Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Info Section */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Folder size={20} className="text-blue-600" />
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
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                      placeholder="Enter category name"
                    />
                  </div>
                </div>

                {/* Info Note */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium mb-1">Category Guidelines</p>
                      <p className="text-blue-700">Choose a clear, descriptive name that represents the product category well.</p>
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
                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium shadow-lg shadow-blue-200"
                  >
                    <Save size={18} />
                    {submitting ? 'Adding...' : 'Add Category'}
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
