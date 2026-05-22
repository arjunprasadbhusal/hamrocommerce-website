export const API_BASE_URL = 'http://127.0.0.1:8000/api/v1';

export const TESTIMONIAL_ENDPOINTS = {
	GET_ALL: `${API_BASE_URL}/testimonials`,
	GET_BY_ID: (id) => `${API_BASE_URL}/testimonials/${id}`,
	CREATE: `${API_BASE_URL}/testimonials`,
	UPDATE: (id) => `${API_BASE_URL}/testimonials/${id}`,
	DELETE: (id) => `${API_BASE_URL}/testimonials/${id}`,
};
