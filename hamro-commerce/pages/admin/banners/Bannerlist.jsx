import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Pencil, Trash2, Plus, Image as ImageIcon } from 'lucide-react'
import Sidebar from '../Sidebar'
import Topbar from '../Topbar'
import { useAlert } from '../../../context/AlertContext'
import { BANNER_ENDPOINTS } from '../../../src/constants/api/banner'

export default function Bannerlist() {
  const { showAlert } = useAlert()
  const [banners, setBanners] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(null)
  const [updating, setUpdating] = useState(null)

  useEffect(() => {
    fetchBanners()
  }, [])

  const fetchBanners = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(BANNER_ENDPOINTS.GET_ALL, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      })
      const data = await response.json()
      
      if (data.success) {
        const sortedBanners = (data.data || []).sort((a, b) => a.id - b.id)
        setBanners(sortedBanners)
      } else {
        throw new Error(data.message || 'Failed to fetch banners')
      }
    } catch (err) {
      showAlert({ type: 'error', title: 'Error', message: err.message || 'Failed to load banners' })
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this banner?')) return

    setDeleting(id)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(BANNER_ENDPOINTS.DELETE(id), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Server response:', errorText)
        throw new Error(`Server error: ${response.status}`)
      }

      const data = await response.json()

      if (data.success) {
        showAlert({ type: 'success', title: 'Success', message: 'Banner deleted successfully!' })
        fetchBanners()
      } else {
        throw new Error(data.message || 'Failed to delete banner')
      }
    } catch (err) {
      showAlert({ type: 'error', title: 'Error', message: err.message || 'Failed to delete banner' })
      console.error(err)
    } finally {
      setDeleting(null)
    }
  }

  const handleStatusToggle = async (id, currentStatus) => {
    setUpdating(id)
    try {
      const token = localStorage.getItem('token')
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active'
      
      const response = await fetch(BANNER_ENDPOINTS.UPDATE_STATUS(id), {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus })
      })

      const data = await response.json()

      if (data.success) {
        showAlert({ type: 'success', title: 'Success', message: 'Banner status updated!' })
        fetchBanners()
      } else {
        throw new Error(data.message || 'Failed to update status')
      }
    } catch (err) {
      showAlert({ type: 'error', title: 'Error', message: err.message || 'Failed to update status' })
      console.error(err)
    } finally {
      setUpdating(null)
    }
  }

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null
    return imagePath.startsWith('http') ? imagePath : `http://192.168.1.64:8000/storage/${imagePath}`
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        <div className="flex-1 overflow-auto p-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-pink-600 rounded-lg">
                  <ImageIcon className="text-white" size={28} />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-800">Banner Management</h1>
                  <p className="text-gray-500 text-sm">Manage promotional banners</p>
                </div>
              </div>
              <Link 
                to="/admin/banners/add" 
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-pink-600 to-pink-700 text-white rounded-lg hover:from-pink-700 hover:to-pink-800 transition-all font-medium shadow-lg shadow-pink-200"
              >
                <Plus size={20} />
                Add Banner
              </Link>
            </div>

            {/* Table Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {loading ? (
                <div className="text-center py-16">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-pink-600 border-t-transparent"></div>
                  <p className="mt-4 text-gray-600 font-medium">Loading banners...</p>
                </div>
              ) : banners.length === 0 ? (
                <div className="text-center py-16">
                  <ImageIcon size={48} className="mx-auto text-gray-400 mb-3" />
                  <p className="text-gray-600 text-lg font-medium">No banners found</p>
                  <p className="text-gray-400 text-sm mt-1">Create your first banner to get started</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">ID</th>
                        <th className="px-4 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Image</th>
                        <th className="px-4 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Title</th>
                        <th className="px-4 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Priority</th>
                        <th className="px-4 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                        <th className="px-4 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Created</th>
                        <th className="px-4 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {banners.map((banner) => (
                        <tr key={banner.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-4">
                            <span className="inline-block px-2 py-1 bg-gray-100 text-gray-800 rounded text-sm font-semibold">
                              #{banner.id}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            {banner.image ? (
                              <img 
                                src={getImageUrl(banner.image)} 
                                alt={banner.title} 
                                className="w-32 h-20 object-cover rounded-lg border border-gray-200 shadow-sm"
                              />
                            ) : (
                              <div className="w-32 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center border border-gray-200">
                                <ImageIcon size={28} className="text-gray-400" />
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-4">
                            <span className="text-sm font-semibold text-gray-800">{banner.title}</span>
                          </td>
                          <td className="px-4 py-4 text-center">
                            <span className="inline-block px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-semibold">
                              {banner.priority}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-center">
                            <button
                              onClick={() => handleStatusToggle(banner.id, banner.status)}
                              disabled={updating === banner.id}
                              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                                banner.status === 'active' 
                                  ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                                  : 'bg-red-100 text-red-700 hover:bg-red-200'
                              } disabled:opacity-50`}
                            >
                              {banner.status}
                            </button>
                          </td>
                          <td className="px-4 py-4 text-center">
                            <span className="text-sm text-gray-500">
                              {new Date(banner.created_at).toLocaleDateString()}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex gap-2 justify-center">
                              <Link
                                to={`/admin/banners/${banner.id}/edit`}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Edit banner"
                              >
                                <Pencil size={18} />
                              </Link>
                              <button
                                onClick={() => handleDelete(banner.id)}
                                disabled={deleting === banner.id}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50 transition-colors"
                                title="Delete banner"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
