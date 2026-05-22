const API_BASE_URL = 'http://192.168.1.72:8000/api/v1';

// Dashboard API endpoints
export const DASHBOARD_API = {
  index: () => `${API_BASE_URL}/dashboard`,
  sales: () => `${API_BASE_URL}/dashboard/sales`,
  users: () => `${API_BASE_URL}/dashboard/users`,
  products: () => `${API_BASE_URL}/dashboard/products`,
};

// Helper functions for Dashboard API calls (Admin only)
export const dashboardAPI = {
  // Get dashboard overview
  getOverview: async () => {
    const token = localStorage.getItem('token');
    const response = await fetch(DASHBOARD_API.index(), {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  },

  // Get sales data
  getSales: async () => {
    const token = localStorage.getItem('token');
    const response = await fetch(DASHBOARD_API.sales(), {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  },

  // Get users data
  getUsers: async () => {
    const token = localStorage.getItem('token');
    const response = await fetch(DASHBOARD_API.users(), {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  },

  // Get products data
  getProducts: async () => {
    const token = localStorage.getItem('token');
    const response = await fetch(DASHBOARD_API.products(), {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  },
};
