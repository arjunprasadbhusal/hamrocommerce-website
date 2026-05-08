export const API_BASE_URL = 'http://192.168.1.64:8000/api/v1';

export const VEDIO_ENDPOINTS = {
  // Public endpoints
  GET_ALL: `${API_BASE_URL}/vedios`,
  GET_ACTIVE: `${API_BASE_URL}/vedios/active`,
  GET_BY_ID: (id) => `${API_BASE_URL}/vedios/${id}`,
  
  // Admin endpoints
  CREATE: `${API_BASE_URL}/vedios`,
  UPDATE: (id) => `${API_BASE_URL}/vedios/${id}`,
  DELETE: (id) => `${API_BASE_URL}/vedios/${id}`,
  UPDATE_STATUS: (id) => `${API_BASE_URL}/vedios/${id}/status`,
  UPDATE_PRIORITY: (id) => `${API_BASE_URL}/vedios/${id}/priority`,
};
