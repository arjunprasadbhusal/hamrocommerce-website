const API_BASE_URL = 'http://192.168.1.64:8000/api/v1';

// User API endpoints
export const USERS_API = {
  // Admin only - Get all users
  getAll: () => `${API_BASE_URL}/users`,
  
  // Admin only - Get user by ID
  getById: (id) => `${API_BASE_URL}/users/${id}`,
  
  // Admin only - Update user
  update: (id) => `${API_BASE_URL}/users/${id}`,
  
  // Admin only - Delete user
  delete: (id) => `${API_BASE_URL}/users/${id}`,
};

// Helper functions for User API calls
export const fetchUsers = async (token) => {
  const response = await fetch(USERS_API.getAll(), {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
    },
  });
  return response.json();
};

export const fetchUserById = async (id, token) => {
  const response = await fetch(USERS_API.getById(id), {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
    },
  });
  return response.json();
};

export const updateUser = async (id, userData, token) => {
  const response = await fetch(USERS_API.update(id), {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(userData),
  });
  return response.json();
};

export const deleteUser = async (id, token) => {
  const response = await fetch(USERS_API.delete(id), {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
    },
  });
  return response.json();
};
