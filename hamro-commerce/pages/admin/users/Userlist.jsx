import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, Trash2, Shield, User as UserIcon, Mail, Phone, Calendar } from 'lucide-react'
import Sidebar from '../Sidebar'
import Topbar from '../Topbar'
import { fetchUsers, deleteUser } from '../../../src/constants/api/user'
import { useAlert } from '../../../context/AlertContext'

const Userlist = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(null)
  const navigate = useNavigate()
  const { showAlert } = useAlert()

  const token = localStorage.getItem('token')
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}')

  useEffect(() => {
    if (!token) {
      showAlert({
        type: 'warning',
        title: 'Login Required',
        message: 'Please login first'
      })
      navigate('/login')
      return
    }
    
    // Check if user is admin
    if (currentUser.role !== 'Admin') {
      showAlert({
        type: 'error',
        title: 'Access Denied',
        message: 'Admin privileges required.'
      })
      navigate('/admin/dashboard')
      return
    }
    
    loadUsers()
  }, [token, navigate])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const response = await fetchUsers(token)
      console.log('User API Response:', response)
      
      if (response.success) {
        const sortedUsers = (response.data || []).sort((a, b) => a.id - b.id)
        setUsers(sortedUsers)
      } else {
        const errorMessage = response.message || 'Failed to load users'
        console.error('Error:', errorMessage)
        showAlert({
          type: 'error',
          title: 'Load Failed',
          message: errorMessage
        })
      }
    } catch (error) {
      console.error('Error loading users:', error)
      showAlert({
        type: 'error',
        title: 'Connection Error',
        message: 'Cannot connect to server. Please make sure the backend is running on port 8000.'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return
    }

    try {
      setDeleting(id)
      const response = await deleteUser(id, token)
      
      if (response.success) {
        setUsers(users.filter(user => user.id !== id))
        showAlert({
          type: 'success',
          title: 'User Deleted',
          message: 'User deleted successfully'
        })
      } else {
        showAlert({
          type: 'error',
          title: 'Delete Failed',
          message: response.message || 'Failed to delete user'
        })
      }
    } catch (error) {
      console.error('Error deleting user:', error)
      showAlert({
        type: 'error',
        title: 'Delete Failed',
        message: 'Error deleting user'
      })
    } finally {
      setDeleting(null)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'Admin':
        return 'bg-red-100 text-red-800'
      case 'Company':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-green-100 text-green-800'
    }
  }

  const getRoleDisplay = (role) => {
    switch (role) {
      case 'User':
        return 'Customer'
      case 'Company':
        return 'Company/Seller'
      case 'Admin':
        return 'Admin'
      default:
        return role
    }
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
                <div className="p-2 bg-teal-600 rounded-lg">
                  <Users className="text-white" size={28} />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-800">User Management</h1>
                  <p className="text-gray-500 text-sm">Manage registered users - Total: {users.length}</p>
                </div>
              </div>
            </div>

            {/* Table Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {loading ? (
                <div className="text-center py-16">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-teal-600 border-t-transparent"></div>
                  <p className="mt-4 text-gray-600 font-medium">Loading users...</p>
                </div>
              ) : users.length === 0 ? (
                <div className="text-center py-16">
                  <Users size={48} className="mx-auto text-gray-400 mb-3" />
                  <p className="text-gray-600 text-lg font-medium">No users found</p>
                  <p className="text-gray-400 text-sm mt-1">Registered users will appear here</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">ID</th>
                        <th className="px-4 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Name</th>
                        <th className="px-4 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Email</th>
                        <th className="px-4 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Phone</th>
                        <th className="px-4 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Role</th>
                        <th className="px-4 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Registered</th>
                        <th className="px-4 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {users.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-4">
                            <span className="inline-block px-2 py-1 bg-gray-100 text-gray-800 rounded text-sm font-semibold">
                              #{user.id}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
                                <UserIcon size={16} className="text-teal-600" />
                              </div>
                              <span className="text-sm font-semibold text-gray-800">{user.name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Mail size={14} className="text-gray-400" />
                              {user.email}
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Phone size={14} className="text-gray-400" />
                              {user.phone}
                            </div>
                          </td>
                          <td className="px-4 py-4 text-center">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full ${getRoleBadgeColor(user.role)}`}>
                              <Shield size={12} />
                              {getRoleDisplay(user.role)}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Calendar size={14} className="text-gray-400" />
                              {formatDate(user.created_at)}
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex justify-center">
                              <button
                                onClick={() => handleDelete(user.id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50 transition-colors"
                                disabled={deleting === user.id || user.id === currentUser.id}
                                title="Delete user"
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

export default Userlist
