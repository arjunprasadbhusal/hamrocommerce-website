const API_BASE_URL = 'http://192.168.1.64:8000/api/v1';

// Message API endpoints
export const MESSAGE_API = {
  getAll: () => `${API_BASE_URL}/messages`,
  getById: (id) => `${API_BASE_URL}/messages/${id}`,
  create: () => `${API_BASE_URL}/messages`,
  markAsRead: (id) => `${API_BASE_URL}/messages/${id}/read`,
  delete: (id) => `${API_BASE_URL}/messages/${id}`,
};

// Helper functions for Message API calls
export const messageAPI = {
  // Get all messages (Admin only)
  getAll: async () => {
    const token = localStorage.getItem('token');
    const response = await fetch(MESSAGE_API.getAll(), {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  },

  // Get message by ID
  getById: async (id) => {
    const token = localStorage.getItem('token');
    const response = await fetch(MESSAGE_API.getById(id), {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  },

  // Create new message (Public - from contact form)
  create: async (data) => {
    const response = await fetch(MESSAGE_API.create(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  // Mark message as read (Admin only)
  markAsRead: async (id) => {
    const token = localStorage.getItem('token');
    const response = await fetch(MESSAGE_API.markAsRead(id), {
      method: 'PUT',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  },

  // Delete message (Admin only)
  delete: async (id) => {
    const token = localStorage.getItem('token');
    const response = await fetch(MESSAGE_API.delete(id), {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  },
};
