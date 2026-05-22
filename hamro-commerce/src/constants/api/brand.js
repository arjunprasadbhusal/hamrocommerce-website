const API_BASE_URL = 'http://192.168.1.72:8000/api/v1';

// Brand API endpoints
export const BRANDS_API = {
  getAll: () => `${API_BASE_URL}/brands`,
  getById: (id: number) => `${API_BASE_URL}/brands/${id}`,
  create: () => `${API_BASE_URL}/brands`,
  update: (id: number) => `${API_BASE_URL}/brands/${id}`,
  delete: (id: number) => `${API_BASE_URL}/brands/${id}`,
};

// Helper functions for Brand API calls
export const brandAPI = {
  // Get all brands
  getAll: async () => {
    const response = await fetch(BRANDS_API.getAll(), {
      headers: {
        'Accept': 'application/json',
      },
    });
    return response.json();
  },

  // Get brand by ID
  getById: async (id: number) => {
    const response = await fetch(BRANDS_API.getById(id), {
      headers: {
        'Accept': 'application/json',
      },
    });
    return response.json();
  },

  // Create new brand (Admin only)
  create: async (data: any) => {
    const token = localStorage.getItem('token');
    const response = await fetch(BRANDS_API.create(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  // Update brand (Admin only)
  update: async (id: number, data: any) => {
    const token = localStorage.getItem('token');
    const response = await fetch(BRANDS_API.update(id), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  // Delete brand (Admin only)
  delete: async (id: number) => {
    const token = localStorage.getItem('token');
    const response = await fetch(BRANDS_API.delete(id), {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  },
};
