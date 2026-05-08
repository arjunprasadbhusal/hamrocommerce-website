const API_BASE_URL = 'http://192.168.1.64:8000/api/v1';

export const SUBCATEGORY_ENDPOINTS = {
  SUBCATEGORIES: `${API_BASE_URL}/subcategories`,
  SUBCATEGORY_BY_ID: (id) => `${API_BASE_URL}/subcategories/${id}`,
  SUBCATEGORIES_BY_CATEGORY: (categoryId) => `${API_BASE_URL}/categories/${categoryId}/subcategories`,
};
