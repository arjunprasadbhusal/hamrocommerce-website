// API Base URL
export const API_BASE_URL = 'http://192.168.1.72:8000/api/v1';

// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  REGISTER: `${API_BASE_URL}/register`,
  LOGIN: `${API_BASE_URL}/login`,
  LOGOUT: `${API_BASE_URL}/logout`,

  // Products
  PRODUCTS: `${API_BASE_URL}/products`,
  PRODUCT_DETAIL: (id: number) => `${API_BASE_URL}/products/${id}`,

  // Categories
  CATEGORIES: `${API_BASE_URL}/categories`,
  CATEGORY_DETAIL: (id: number) => `${API_BASE_URL}/categories/${id}`,

  // Brands
  BRANDS: `${API_BASE_URL}/brands`,
  BRAND_DETAIL: (id: number) => `${API_BASE_URL}/brands/${id}`,

  // Blogs
  BLOGS: `${API_BASE_URL}/blogs`,
  BLOG_DETAIL: (id: number) => `${API_BASE_URL}/blogs/${id}`,

  // Cart
  MY_CART: `${API_BASE_URL}/mycart`,
  CART: `${API_BASE_URL}/cart`,
  CHECKOUT: (id: number) => `${API_BASE_URL}/checkout/${id}`,

  // Orders
  ORDERS: `${API_BASE_URL}/orders`,
  MY_ORDERS: `${API_BASE_URL}/myorders`,
  ORDER_STATUS: (id: number, status: string) => `${API_BASE_URL}/orders/${id}/status/${status}`,
  ORDER_ESEWA: (cartid: number) => `${API_BASE_URL}/orders/esewa/${cartid}`,

  // Dashboard (Admin)
  DASHBOARD: `${API_BASE_URL}/dashboard`,
  DASHBOARD_SALES: `${API_BASE_URL}/dashboard/sales`,
  DASHBOARD_USERS: `${API_BASE_URL}/dashboard/users`,
  DASHBOARD_PRODUCTS: `${API_BASE_URL}/dashboard/products`,

  // Leaderships
  LEADERSHIPS: `${API_BASE_URL}/leaderships`,
  LEADERSHIP_DETAIL: (id: number) => `${API_BASE_URL}/leaderships/${id}`,
};

// Helper function to get auth headers
export const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
};

// Helper function for GET requests
export const apiGet = async (url: string, requiresAuth = false) => {
  const headers: any = {
    'Accept': 'application/json',
  };

  if (requiresAuth) {
    const token = localStorage.getItem('token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const response = await fetch(url, { headers });
  return response.json();
};

// Helper function for POST requests
export const apiPost = async (url: string, data: any, requiresAuth = false) => {
  const headers: any = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  if (requiresAuth) {
    const token = localStorage.getItem('token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(data),
  });
  return response.json();
};

// Helper function for PUT requests
export const apiPut = async (url: string, data: any, requiresAuth = false) => {
  const headers: any = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  if (requiresAuth) {
    const token = localStorage.getItem('token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const response = await fetch(url, {
    method: 'PUT',
    headers,
    body: JSON.stringify(data),
  });
  return response.json();
};

// Helper function for DELETE requests
export const apiDelete = async (url: string, requiresAuth = false) => {
  const headers: any = {
    'Accept': 'application/json',
  };

  if (requiresAuth) {
    const token = localStorage.getItem('token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const response = await fetch(url, {
    method: 'DELETE',
    headers,
  });
  return response.json();
};
