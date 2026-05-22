import { API_BASE_URL } from '../../constant/api';

export const BANNER_ENDPOINTS = {
  // Public endpoints
  GET_ALL: `${API_BASE_URL}/banners`,
  GET_ACTIVE: `${API_BASE_URL}/banners/active`,
  GET_BY_ID: (id) => `${API_BASE_URL}/banners/${id}`,
  
  // Admin endpoints
  CREATE: `${API_BASE_URL}/banners`,
  UPDATE: (id) => `${API_BASE_URL}/banners/${id}`,
  DELETE: (id) => `${API_BASE_URL}/banners/${id}`,
  UPDATE_STATUS: (id) => `${API_BASE_URL}/banners/${id}/status`,
  UPDATE_PRIORITY: (id) => `${API_BASE_URL}/banners/${id}/priority`,
};
