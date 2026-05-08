import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Image as ImageIcon, Upload, Save, X, AlertCircle, ArrowUpDown, CheckCircle } from 'lucide-react'
import Sidebar from '../Sidebar'
import Topbar from '../Topbar'
import { useAlert } from '../../../context/AlertContext'
import { BANNER_ENDPOINTS } from '../../../src/constants/api/banner'

const initialFormData = {
  title: '',
  image: null,
  priority: 0,
  status: 'active',
}

export default function Addbanner() {
  const { showAlert } = useAlert()
  const [formData, setFormData] = useState(initialFormData)
  const [imagePreview, setImagePreview] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const navigate = useNavigate()

  const handleChange = (event) => {
    const { name, value, files } = event.target

    if (name === "image") {
      const file = files[0]
      if (file && file.size > 10240 * 1024) {
        showAlert({ type: 'error', title: 'Invalid File', message: 'Image must be less than 10MB' })
        return
      }
      setFormData((prev) => ({ ...prev, image: file }))
      setImagePreview(file ? URL.createObjectURL(file) : null)
      return
    }

    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!formData.image) {
      showAlert({ type: 'error', title: 'Validation Error', message: 'Banner image is required' })
      return
    }

    setSubmitting(true)

    try {
      const token = localStorage.getItem('token')
      const form = new FormData()
      if (formData.title.trim()) {
        form.append("title", formData.title)
      }
      form.append("priority", formData.priority)
      form.append("status", formData.status)
      if (formData.image) form.append("image", formData.image)

      const response = await fetch(BANNER_ENDPOINTS.CREATE, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        body: form
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Server response:', errorText)
        throw new Error(`Server error: ${response.status}`)
      }

      const data = await response.json()

      if (data.success) {
        showAlert({ type: 'success', title: 'Success', message: 'Banner added successfully!' })
        navigate('/admin/banners')
      } else {
        throw new Error(data.message || 'Failed to add banner')
      }
    } catch (err) {
      showAlert({ type: 'error', title: 'Error', message: err.message || 'Failed to add banner' })
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleCancel = () => navigate('/admin/banners')

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        <div className="flex-1 overflow-auto p-8">
          <div className="max-w-3xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-600 rounded-lg">
                <ImageIcon className="text-white" size={28} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Add New Banner</h1>
                <p className="text-gray-500 text-sm">Create a new promotional banner</p>
              </div>
            </div>

            {/* Form Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Info Section */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <ImageIcon size={20} className="text-blue-600" />
                    <h3 className="text-lg font-semibold text-gray-800">Banner Information</h3>
                  </div>
                  
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <span>Banner Title</span>
                      <span className="text-xs text-gray-500">(optional)</span>
                    </label>
                    <input 
                      type="text" 
                      name="title" 
                      value={formData.title} 
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                      placeholder="Enter banner title"
                    />
                  </div>
                </div>

                {/* Settings Section */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <ArrowUpDown size={20} className="text-blue-600" />
                    <h3 className="text-lg font-semibold text-gray-800">Banner Settings</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <span>Priority</span>
                      </label>
                      <input 
                        type="number" 
                        name="priority" 
                        value={formData.priority} 
                        onChange={handleChange}
                        min="0"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                        placeholder="0"
                      />
                      <p className="text-xs text-gray-500 mt-1">Higher priority banners appear first</p>
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
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Image Upload Section */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Upload size={20} className="text-blue-600" />
                    <h3 className="text-lg font-semibold text-gray-800">Banner Image</h3>
                  </div>
                  
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <span>Banner Image (Max 10MB)</span>
                      <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="file" 
                      name="image" 
                      accept="image/*" 
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" 
                    />
                    {imagePreview && (
                      <div className="mt-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
                        <img src={imagePreview} alt="Preview" className="w-full max-w-2xl h-64 object-cover rounded-lg border border-gray-200 shadow-sm" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Info Note */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium mb-1">Banner Guidelines</p>
                      <p className="text-blue-700">Recommended dimensions: 1920x600 pixels. Use high-quality images in JPG or PNG format.</p>
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
                    {submitting ? 'Adding...' : 'Add Banner'}
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
