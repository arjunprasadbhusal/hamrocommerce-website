const API_BASE_URL = 'http://192.168.1.64:8000/api/v1';

// Company API endpoints
export const COMPANIES_API = {
  getAll: () => `${API_BASE_URL}/companies`,
  getById: (id: number) => `${API_BASE_URL}/companies/${id}`,
  create: () => `${API_BASE_URL}/companies`,
  update: (id: number) => `${API_BASE_URL}/companies/${id}`,
  delete: (id: number) => `${API_BASE_URL}/companies/${id}`,
};

// Helper functions for Company API calls
export const companyAPI = {
  // Get all companies
  getAll: async () => {
    const response = await fetch(COMPANIES_API.getAll(), {
      headers: {
        'Accept': 'application/json',
      },
    });
    return response.json();
  },

  // Get company by ID
  getById: async (id: number) => {
    const response = await fetch(COMPANIES_API.getById(id), {
      headers: {
        'Accept': 'application/json',
      },
    });
    return response.json();
  },

  // Create new company (Admin only)
  create: async (data: any) => {
    const token = localStorage.getItem('token');
    const response = await fetch(COMPANIES_API.create(), {
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

  // Update company (Admin only)
  update: async (id: number, data: any) => {
    const token = localStorage.getItem('token');
    const response = await fetch(COMPANIES_API.update(id), {
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

  // Delete company (Admin only)
  delete: async (id: number) => {
    const token = localStorage.getItem('token');
    const response = await fetch(COMPANIES_API.delete(id), {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  },
};
