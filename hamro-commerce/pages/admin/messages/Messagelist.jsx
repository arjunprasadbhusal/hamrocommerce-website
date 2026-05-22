import React, { useState, useEffect } from 'react';
import { Mail, Eye, Trash2, CheckCircle, AlertCircle, User, Send, Calendar, X, AlertTriangle } from 'lucide-react';
import { API_BASE_URL } from '../../../src/constant/api';
import Sidebar from '../Sidebar';
import Topbar from '../Topbar';

export default function MessageList() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, id: null, name: '' });
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });

  useEffect(() => {
    if (notification.show) {
      const timer = setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification.show]);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/messages`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        }
      });

      const data = await response.json();
      if (data.success) {
        const sortedMessages = (data.data || []).sort((a, b) => a.id - b.id);
        setMessages(sortedMessages);
      }
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to load messages');
      console.error('Error fetching messages:', err);
    } finally {
      setLoading(false);
    }
  };

  const viewMessage = async (message) => {
    setSelectedMessage(message);
    setShowModal(true);

    if (!message.is_read) {
      try {
        const token = localStorage.getItem('token');
        await fetch(`${API_BASE_URL}/messages/${message.id}/read`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          }
        });
        
        setMessages(messages.map(m => 
          m.id === message.id ? { ...m, is_read: true } : m
        ));
      } catch (err) {
        console.error('Failed to mark as read:', err);
      }
    }
  };

  const handleDeleteRequest = (id, name) => {
    setDeleteConfirm({ show: true, id, name });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm.id) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/messages/${deleteConfirm.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        }
      });

      const data = await response.json();
      if (data.success) {
        setMessages(messages.filter(m => m.id !== deleteConfirm.id));
        setDeleteConfirm({ show: false, id: null, name: '' });
        setNotification({ show: true, message: 'Message deleted successfully!', type: 'success' });
      } else {
        setNotification({ show: true, message: 'Failed to delete message', type: 'error' });
      }
    } catch (err) {
      setNotification({ show: true, message: 'Failed to delete message', type: 'error' });
      console.error('Error deleting message:', err);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-100">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mb-4"></div>
            <p className="text-gray-600 font-medium">Loading messages...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen bg-gray-100">
        <Sidebar />
        <div className="flex-1 overflow-auto p-8">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            Error: {error}
          </div>
        </div>
      </div>
    );
  }

  const unreadCount = messages.filter(m => !m.is_read).length;

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        <div className="flex-1 overflow-auto p-8">
          <div className="max-w-7xl mx-auto">
            {/* Notification */}
            {notification.show && (
              <div className={`mb-6 p-4 rounded-lg border shadow-sm flex items-center gap-3 animate-fadeIn ${
                notification.type === 'success' 
                  ? 'bg-green-50 border-green-200 text-green-800' 
                  : 'bg-red-50 border-red-200 text-red-800'
              }`}>
                {notification.type === 'success' ? (
                  <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                ) : (
                  <AlertTriangle className="text-red-600" size={20} />
                )}
                <span className="font-medium">{notification.message}</span>
              </div>
            )}

            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-600 rounded-lg">
                  <Mail className="text-white" size={24} />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-800">Messages</h1>
                  <p className="text-gray-500 text-sm">
                    {messages.length} total messages, {unreadCount} unread
                  </p>
                </div>
              </div>
            </div>

            {/* Table Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {messages.length === 0 ? (
                <div className="text-center py-16 px-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                    <Mail className="text-gray-400" size={32} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No messages yet</h3>
                  <p className="text-gray-500">Messages from customers will appear here</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Email</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Subject</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {messages.map((message) => (
                        <tr 
                          key={message.id} 
                          className={`hover:bg-gray-50 transition-colors ${!message.is_read ? 'bg-blue-50/50' : ''}`}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            {message.is_read ? (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                                Read
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                                Unread
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className={`text-sm ${!message.is_read ? 'font-bold' : 'font-medium'} text-gray-900`}>
                              {message.first_name} {message.last_name}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-600">{message.email}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900 max-w-xs truncate">{message.subject}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {formatDate(message.created_at)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex gap-2">
                              <button
                                onClick={() => viewMessage(message)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                                title="View message"
                              >
                                <Eye size={16} />
                                View
                              </button>
                              <button
                                onClick={() => handleDeleteRequest(message.id, `${message.first_name} ${message.last_name}`)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete message"
                              >
                                <Trash2 size={16} />
                                Delete
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

          {/* View Message Modal */}
          {showModal && selectedMessage && (
            <>
              <div 
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 animate-fadeIn" 
                onClick={() => setShowModal(false)}
              />
              <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6 animate-slideIn max-h-[90vh] overflow-y-auto">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                        <Send className="text-blue-600" size={24} />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900">Message Details</h3>
                    </div>
                    <button
                      onClick={() => setShowModal(false)}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <X size={24} />
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                        <User size={16} />
                        From
                      </label>
                      <p className="text-gray-900 font-medium">
                        {selectedMessage.first_name} {selectedMessage.last_name}
                      </p>
                    </div>
                    
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                        <Mail size={16} />
                        Email
                      </label>
                      <p className="text-gray-900">{selectedMessage.email}</p>
                    </div>
                    
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                        <Send size={16} />
                        Subject
                      </label>
                      <p className="text-gray-900 font-medium">{selectedMessage.subject}</p>
                    </div>
                    
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                        <Calendar size={16} />
                        Date
                      </label>
                      <p className="text-gray-900">{formatDate(selectedMessage.created_at)}</p>
                    </div>
                    
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <label className="text-sm font-semibold text-gray-700 mb-2 block">Message</label>
                      <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">
                        {selectedMessage.message}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-6 flex justify-end">
                    <button
                      onClick={() => setShowModal(false)}
                      className="px-6 py-2.5 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-medium transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Delete Confirmation Modal */}
          {deleteConfirm.show && (
            <>
              <div 
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 animate-fadeIn" 
                onClick={() => setDeleteConfirm({ show: false, id: null, name: '' })}
              />
              <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
                <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-slideIn">
                  <button 
                    onClick={() => setDeleteConfirm({ show: false, id: null, name: '' })}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X size={24} />
                  </button>
                  <div className="flex flex-col items-center text-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                      <AlertTriangle className="text-red-600" size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Delete Message</h3>
                  </div>
                  <div className="mb-6 text-center">
                    <p className="text-gray-600 mb-2">
                      Are you sure you want to delete the message from <strong className="text-gray-900">{deleteConfirm.name}</strong>?
                    </p>
                    <p className="text-red-600 text-sm font-medium">
                      ⚠️ This action cannot be undone.
                    </p>
                  </div>
                  <div className="flex gap-3 justify-center">
                    <button
                      onClick={() => setDeleteConfirm({ show: false, id: null, name: '' })}
                      className="px-6 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={confirmDelete}
                      className="px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium shadow-lg shadow-red-200"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
