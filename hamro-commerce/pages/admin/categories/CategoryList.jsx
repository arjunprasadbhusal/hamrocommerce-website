import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Folder, Plus, Edit2, Trash2, AlertTriangle, FolderTree } from 'lucide-react'
import Sidebar from '../Sidebar'
import Topbar from '../Topbar'
import LoadingSpinner from '../../../components/LoadingSpinner'
import { API_ENDPOINTS } from '../../../src/constant/api'

const initialNotification = { show: false, message: '', type: 'success' }
const initialDeleteState = { show: false, id: null, name: '' }

export default function CategoryList() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [notification, setNotification] = useState(initialNotification)
  const [deleteConfirm, setDeleteConfirm] = useState(initialDeleteState)

  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    if (notification.show) {
      const timer = setTimeout(() => setNotification(initialNotification), 3000)
      return () => clearTimeout(timer)
    }
  }, [notification.show])

  useEffect(() => {
    if (location.state?.message) {
      setNotification({
        show: true,
        message: location.state.message,
        type: location.state.type || 'success',
      })
      navigate(location.pathname, { replace: true })
    }
  }, [location.pathname, location.state, navigate])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      // Add cache busting parameter to ensure fresh data
      const timestamp = new Date().getTime()
      const response = await fetch(`${API_ENDPOINTS.CATEGORIES}?_=${timestamp}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        }
      })

      const data = await response.json()
      const sortedCategories = (data.data || []).sort((a, b) => a.id - b.id)
      setCategories(sortedCategories)
      setError(null)
    } catch (err) {
      setError(err.message || 'Failed to load categories')
      console.error('Error fetching categories:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteRequest = (id, name) => {
    setDeleteConfirm({ show: true, id, name })
  }

  const confirmDelete = async () => {
    if (!deleteConfirm.id) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(API_ENDPOINTS.CATEGORY_BY_ID(deleteConfirm.id), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        }
      })

      const data = await response.json()

      if (data.success) {
        setNotification({ show: true, message: 'Category deleted successfully!', type: 'success' })
        fetchCategories()
      } else {
        // Show the actual error message from backend
        let errorMessage = data.message || 'Failed to delete category'
        
        if (data.errors) {
          const errorMessages = Object.values(data.errors).flat()
          errorMessage = errorMessages.join(', ')
        }
        
        throw new Error(errorMessage)
      }
    } catch (err) {
      setNotification({
        show: true,
        message: err.message || 'Failed to delete category',
        type: 'error',
      })
      console.error('Error deleting category:', err)
    } finally {
      setDeleteConfirm(initialDeleteState)
    }
  }

  const cancelDelete = () => {
    setDeleteConfirm(initialDeleteState)
  }

  const handleAddNew = () => {
    navigate('/admin/categories/add')
  }

  const handleEdit = (id) => {
    navigate(`/admin/categories/${id}/edit`)
  }

  const handleViewSubcategories = (categoryId, categoryName) => {
    navigate(`/admin/subcategories?category=${categoryId}`)
  }

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Topbar />
          <div className="flex-1 overflow-auto p-8">
            <div className="max-w-2xl mx-auto mt-20">
              <div className="bg-white rounded-xl shadow-lg border border-red-200 p-8 text-center">
                <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                  <AlertTriangle className="text-red-600" size={32} />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Categories</h2>
                <p className="text-gray-600 mb-6">{error}</p>
                <button 
                  className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all font-medium shadow-lg"
                  onClick={fetchCategories}
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        <div className="flex-1 overflow-auto p-8">
          <div className="max-w-7xl mx-auto">
            {/* Notification */}
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
                    <AlertTriangle size={20} className="text-red-600" />
                  )}
                  <span className="font-medium">{notification.message}</span>
                </div>
              </div>
            )}

            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-600 rounded-lg">
                  <Folder className="text-white" size={28} />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-800">Categories</h1>
                  <p className="text-gray-500 text-sm">Manage product categories</p>
                </div>
              </div>
              <button 
                className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all font-medium shadow-lg shadow-blue-200"
                onClick={handleAddNew}
              >
                <Plus size={20} />
                Add Category
              </button>
            </div>

            {/* Table Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200">
                  {categories.length === 0 ? (
                    <tr>
                      <td colSpan="3" className="px-6 py-16 text-center">
                        <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                          <Folder className="text-gray-400" size={32} />
                        </div>
                        <p className="text-gray-500 font-medium">No categories found</p>
                        <p className="text-gray-400 text-sm mt-1">Start by adding your first category</p>
                      </td>
                    </tr>
                  ) : (
                    categories.map((category) => (
                      <tr key={category.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <span className="text-sm font-semibold text-gray-900">#{category.id}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-blue-100 rounded">
                              <Folder className="text-blue-600" size={16} />
                            </div>
                            <span className="font-medium text-gray-900">{category.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2 justify-end">
                            <button 
                              className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all" 
                              onClick={() => handleViewSubcategories(category.id, category.name)}
                              title="View subcategories"
                            >
                              <FolderTree size={14} />
                              Subcategories
                            </button>
                            <button 
                              className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all" 
                              onClick={() => handleEdit(category.id)}
                              title="Edit category"
                            >
                              <Edit2 size={14} />
                              Edit
                            </button>
                            <button 
                              className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all" 
                              onClick={() => handleDeleteRequest(category.id, category.name)}
                              title="Delete category"
                            >
                              <Trash2 size={14} />
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Delete Confirmation Modal */}
            {deleteConfirm.show && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm" onClick={cancelDelete}>
                <div className="relative bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4 animate-fadeIn" onClick={(e) => e.stopPropagation()}>
                  <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-600" onClick={cancelDelete}>
                    <Trash2 size={20} />
                  </button>
                  <div className="flex flex-col items-center text-center gap-3 mb-4">
                    <div className="p-3 bg-red-100 rounded-lg">
                      <AlertTriangle className="text-red-600" size={24} />
                    </div>
                    <h2 className="text-xl font-bold text-gray-800">Confirm Delete</h2>
                  </div>
                  <div className="mb-6 text-center">
                    <p className="mb-2 text-gray-700">Are you sure you want to delete <strong className="text-gray-900">{deleteConfirm.name}</strong>?</p>
                    <p className="text-red-600 text-sm font-medium">⚠️ This action cannot be undone.</p>
                  </div>
                  <div className="flex gap-3 justify-center">
                    <button
                      className="px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-medium"
                      onClick={cancelDelete}
                    >
                      Cancel
                    </button>
                    <button
                      className="flex items-center gap-2 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all font-medium shadow-lg"
                      onClick={confirmDelete}
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
