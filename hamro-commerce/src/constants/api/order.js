const API_BASE_URL = 'http://192.168.1.72:8000/api/v1';

// Order API endpoints
export const ORDERS_API = {
  getAll: () => `${API_BASE_URL}/orders`,
  myOrders: () => `${API_BASE_URL}/myorders`,
  create: () => `${API_BASE_URL}/orders`,
  updateStatus: (id: number, status: string) => `${API_BASE_URL}/orders/${id}/status/${status}`,
  createEsewa: (cartid: number) => `${API_BASE_URL}/orders/esewa/${cartid}`,
};

// Helper functions for Order API calls
export const orderAPI = {
  // Get all orders (Admin only)
  getAll: async () => {
    const token = localStorage.getItem('token');
    const response = await fetch(ORDERS_API.getAll(), {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  },

  // Get user's orders
  getMyOrders: async () => {
    const token = localStorage.getItem('token');
    const response = await fetch(ORDERS_API.myOrders(), {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  },

  // Create new order
  create: async (data: any) => {
    const token = localStorage.getItem('token');
    const response = await fetch(ORDERS_API.create(), {
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

  // Update order status (Admin only)
  updateStatus: async (id: number, status: string) => {
    const token = localStorage.getItem('token');
    const response = await fetch(ORDERS_API.updateStatus(id, status), {
      method: 'PUT',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  },

  // Create order via eSewa
  createEsewa: async (cartid: number, data: any) => {
    const token = localStorage.getItem('token');
    const response = await fetch(ORDERS_API.createEsewa(cartid), {
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
};
