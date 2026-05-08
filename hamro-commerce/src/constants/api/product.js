const API_BASE_URL = 'http://192.168.1.64:8000/api/v1';

// Product API endpoints
export const PRODUCTS_API = {
  getAll: () => `${API_BASE_URL}/products`,
  getById: (id: number) => `${API_BASE_URL}/products/${id}`,
  create: () => `${API_BASE_URL}/products`,
  update: (id: number) => `${API_BASE_URL}/products/${id}`,
  delete: (id: number) => `${API_BASE_URL}/products/${id}`,
};

// Helper functions for Product API calls
export const productAPI = {
  // Get all products
  getAll: async () => {
    const response = await fetch(PRODUCTS_API.getAll(), {
      headers: {
        'Accept': 'application/json',
      },
    });
    return response.json();
  },

  // Get product by ID
  getById: async (id: number) => {
    const response = await fetch(PRODUCTS_API.getById(id), {
      headers: {
        'Accept': 'application/json',
      },
    });
    return response.json();
  },

  // Create new product (Admin only)
  create: async (data: any) => {
    const token = localStorage.getItem('token');
    const response = await fetch(PRODUCTS_API.create(), {
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

  // Update product (Admin only)
  update: async (id: number, data: any) => {
    const token = localStorage.getItem('token');
    const response = await fetch(PRODUCTS_API.update(id), {
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

  // Delete product (Admin only)
  delete: async (id: number) => {
    const token = localStorage.getItem('token');
    const response = await fetch(PRODUCTS_API.delete(id), {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  },
};
