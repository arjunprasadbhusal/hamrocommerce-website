import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileText, Image as ImageIcon, Upload, Save, X, AlertCircle } from 'lucide-react'
import Sidebar from '../Sidebar'
import Topbar from '../Topbar'
import { useAlert } from '../../../context/AlertContext'
import { BLOG_ENDPOINTS } from '../../../src/constants/api/blog'

const initialFormData = {
  title: '',
  description: '',
  photopath: null,
}

export default function Addblog() {
  const { showAlert } = useAlert()
  const [formData, setFormData] = useState(initialFormData)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const navigate = useNavigate()

  const handleChange = (event) => {
    const { name, value, files } = event.target

    if (name === "photopath") {
      const file = files[0]
      if (file && file.size > 2048 * 1024) {
        showAlert({ type: 'error', title: 'Invalid File', message: 'Image must be less than 2MB' })
        return
      }
      setFormData((prev) => ({ ...prev, photopath: file }))
      setPhotoPreview(file ? URL.createObjectURL(file) : null)
      return
    }

    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!formData.title.trim()) {
      showAlert({ type: 'error', title: 'Validation Error', message: 'Blog title is required' })
      return
    }

    if (!formData.description.trim()) {
      showAlert({ type: 'error', title: 'Validation Error', message: 'Blog description is required' })
      return
    }

    setSubmitting(true)

    try {
      const token = localStorage.getItem('token')
      const form = new FormData()
      form.append("title", formData.title)
      form.append("description", formData.description)
      if (formData.photopath) form.append("photopath", formData.photopath)

      const response = await fetch(BLOG_ENDPOINTS.CREATE, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        body: form
      })

      // Check if response is ok
      if (!response.ok) {
        const errorText = await response.text()
        console.error('Server response:', errorText)
        throw new Error(`Server error: ${response.status} - ${errorText.substring(0, 100)}`)
      }

      const data = await response.json()

      if (data.success) {
        showAlert({ type: 'success', title: 'Success', message: 'Blog added successfully!' })
        navigate('/admin/blogs')
      } else {
        throw new Error(data.message || 'Failed to add blog')
      }
    } catch (err) {
      showAlert({ type: 'error', title: 'Error', message: err.message || 'Failed to add blog' })
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleCancel = () => navigate('/admin/blogs')

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        <div className="flex-1 overflow-auto p-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-600 rounded-lg">
                <FileText className="text-white" size={28} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Add New Blog</h1>
                <p className="text-gray-500 text-sm">Create a new blog post</p>
              </div>
            </div>

            {/* Form Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Blog Content Section */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <FileText size={20} className="text-blue-600" />
                    <h3 className="text-lg font-semibold text-gray-800">Blog Content</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <span>Blog Title</span>
                        <span className="text-red-500">*</span>
                      </label>
                      <input 
                        type="text" 
                        name="title" 
                        value={formData.title} 
                        onChange={handleChange} 
                        required 
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                        placeholder="Enter blog title"
                      />
                    </div>

                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <span>Description</span>
                        <span className="text-red-500">*</span>
                      </label>
                      <textarea 
                        name="description" 
                        value={formData.description} 
                        onChange={handleChange} 
                        required
                        rows="10" 
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                        placeholder="Enter blog description"
                      />
                    </div>
                  </div>
                </div>

                {/* Image Upload Section */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Upload size={20} className="text-blue-600" />
                    <h3 className="text-lg font-semibold text-gray-800">Featured Image</h3>
                  </div>
                  
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <span>Blog Image (Max 2MB)</span>
                    </label>
                    <input 
                      type="file" 
                      name="photopath" 
                      accept="image/*" 
                      onChange={handleChange} 
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" 
                    />
                    {photoPreview && (
                      <div className="mt-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
                        <img src={photoPreview} alt="Preview" className="w-64 h-64 object-cover rounded-lg border border-gray-200 shadow-sm" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Info Note */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium mb-1">Blog Writing Tips</p>
                      <p className="text-blue-700">Write engaging content that provides value to your readers. Use clear headings and break up text for better readability.</p>
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
                    {submitting ? 'Adding...' : 'Add Blog'}
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
