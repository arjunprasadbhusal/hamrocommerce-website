 v  
 
 
 
 const API_BASE_URL = 'http://192.168.1.72:8000/api/v1';

// Category API endpoints
export const CATEGORIES_API = {
  getAll: () => `${API_BASE_URL}/categories`,
  getById: (id: number) => `${API_BASE_URL}/categories/${id}`,
  create: () => `${API_BASE_URL}/categories`,
  update: (id: number) => `${API_BASE_URL}/categories/${id}`,
  delete: (id: number) => `${API_BASE_URL}/categories/${id}`,
};

// Helper functions for Category API calls
export const categoryAPI = {
  // Get all categories
  getAll: async () => {
    const response = await fetch(CATEGORIES_API.getAll(), {
      headers: {
        'Accept': 'application/json',
      },
    });
    return response.json();
  },

  // Get category by ID
  getById: async (id: number) => {
    const response = await fetch(CATEGORIES_API.getById(id), {
      headers: {
        'Accept': 'application/json',
      },
    });
    return response.json();
  },

  // Create new category (Admin only)
  create: async (data: any) => {
    const token = localStorage.getItem('token');
    const response = await fetch(CATEGORIES_API.create(), {
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

  // Update category (Admin only)
  update: async (id: number, data: any) => {
    const token = localStorage.getItem('token');
    const response = await fetch(CATEGORIES_API.update(id), {
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

  // Delete category (Admin only)
  delete: async (id: number) => {
    const token = localStorage.getItem('token');
    const response = await fetch(CATEGORIES_API.delete(id), {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  },
};
