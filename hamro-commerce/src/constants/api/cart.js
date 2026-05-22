const API_BASE_URL = 'http://192.168.1.72:8000/api/v1';

// Cart API endpoints
export const CART_API = {
  myCart: () => `${API_BASE_URL}/mycart`,
  add: () => `${API_BASE_URL}/cart`,
  remove: () => `${API_BASE_URL}/cart`,
  checkout: (id: number) => `${API_BASE_URL}/checkout/${id}`,
};

// Helper functions for Cart API calls
export const cartAPI = {
  // Get user's cart
  getMyCart: async () => {
    const token = localStorage.getItem('token');
    const response = await fetch(CART_API.myCart(), {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  },

  // Add item to cart
  add: async (data: { product_id: number; quantity: number }) => {
    const token = localStorage.getItem('token');
    const response = await fetch(CART_API.add(), {
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

  // Remove item from cart
  remove: async (product_id: number) => {
    const token = localStorage.getItem('token');
    const response = await fetch(CART_API.remove(), {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ product_id }),
    });
    return response.json();
  },

  // Get checkout details
  checkout: async (id: number) => {
    const token = localStorage.getItem('token');
    const response = await fetch(CART_API.checkout(id), {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  },
};
