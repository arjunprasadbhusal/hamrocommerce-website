export const API_BASE_URL = 'http://192.168.1.64:8000/api/v1';

export const LEADERSHIP_ENDPOINTS = {
	GET_ALL: `${API_BASE_URL}/leaderships`,
	GET_BY_ID: (id) => `${API_BASE_URL}/leaderships/${id}`,
	CREATE: `${API_BASE_URL}/leaderships`,
	UPDATE: (id) => `${API_BASE_URL}/leaderships/${id}`,
	DELETE: (id) => `${API_BASE_URL}/leaderships/${id}`,
};
