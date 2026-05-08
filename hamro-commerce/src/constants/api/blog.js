export const API_BASE_URL = 'http://192.168.1.64:8000/api/v1';

export const BLOG_ENDPOINTS = {
  // Public endpoints
  GET_ALL: `${API_BASE_URL}/blogs`,
  GET_BY_ID: (id) => `${API_BASE_URL}/blogs/${id}`,
  
  // Admin endpoints
  CREATE: `${API_BASE_URL}/blogs`,
  UPDATE: (id) => `${API_BASE_URL}/blogs/${id}`,
  DELETE: (id) => `${API_BASE_URL}/blogs/${id}`,
};
