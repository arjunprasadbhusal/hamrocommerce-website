export const API_BASE_URL = 'http://127.0.0.1:8000/api/v1';

export const LEADERSHIP_ENDPOINTS = {
	GET_ALL: `${API_BASE_URL}/leaderships`,
	GET_BY_ID: (id) => `${API_BASE_URL}/leaderships/${id}`,
	CREATE: `${API_BASE_URL}/leaderships`,
	UPDATE: (id) => `${API_BASE_URL}/leaderships/${id}`,
	DELETE: (id) => `${API_BASE_URL}/leaderships/${id}`,
};
