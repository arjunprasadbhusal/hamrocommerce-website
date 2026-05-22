const API_BASE_URL = 'http://192.168.1.72:8000/api/v1';

// Auth API endpoints
export const AUTH_API = {
  register: () => `${API_BASE_URL}/register`,
  login: () => `${API_BASE_URL}/login`,
  logout: () => `${API_BASE_URL}/logout`,
};

// Helper functions for Auth API calls
export const authAPI = {
  // Register new user
  register: async (data: {
    name: string;
    email: string;
    phone: string;
    role: string;
    password: string;
  }) => {
    const response = await fetch(AUTH_API.register(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  // Login user
  login: async (data: { email: string; password: string }) => {
    const response = await fetch(AUTH_API.login(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  // Logout user
  logout: async () => {
    const token = localStorage.getItem('token');
    const response = await fetch(AUTH_API.logout(), {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  },
};
