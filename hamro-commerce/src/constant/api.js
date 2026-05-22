export const BASE_URL = 'http://127.0.0.1:8000';
export const API_BASE_URL = `${BASE_URL}/api/v1`;

// Convert backend-provided image paths to usable URLs.
// Supports: absolute URLs, "storage/...", "/storage/..." and DB paths like "products/x.jpg".
export const resolveImageUrl = (value) => {
  if (!value || typeof value !== 'string') return '';

  const url = value.trim();
  if (!url) return '';

  // If the backend returned a full absolute URL but it contains /storage/,
  // force it to use our BASE_URL instead of the backend's IP (like 192.168.x.x)
  if (url.includes('/storage/')) {
    const pathAfterStorage = url.split('/storage/')[1];
    return `${BASE_URL}/storage/${pathAfterStorage}`;
  }

  // Same for things that might just have 'storage/' without the leading slash
  if (url.startsWith('storage/')) {
    return `${BASE_URL}/${url}`;
  }

  // Keep external legit HTTP URLs like AWS S3 or Unsplash (if they don't have '/storage/')
  if (/^https?:\/\//i.test(url)) return url;

  // Frontend public assets.
  if (url.startsWith('/image/') || url.startsWith('image/')) {
    return url.startsWith('/') ? url : `/${url}`;
  }

  // Any other absolute path -> treat as frontend path.
  if (url.startsWith('/')) return url;

  // Plain DB path/filename -> assume stored under /storage.
  return `${BASE_URL}/storage/${url}`;
};

// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  REGISTER: `${API_BASE_URL}/register`,
  LOGIN: `${API_BASE_URL}/login`,
  LOGOUT: `${API_BASE_URL}/logout`,
  USER: `${API_BASE_URL}/user`,

  // Notifications
  NOTIFICATIONS: `${API_BASE_URL}/notifications`,

  // Products
  PRODUCTS: `${API_BASE_URL}/products`,
  PRODUCT_BY_ID: (id) => `${API_BASE_URL}/products/${id}`,

  // Categories
  CATEGORIES: `${API_BASE_URL}/categories`,
  CATEGORY_BY_ID: (id) => `${API_BASE_URL}/categories/${id}`,

  // SubCategories
  SUBCATEGORIES: `${API_BASE_URL}/subcategories`,
  SUBCATEGORY_BY_ID: (id) => `${API_BASE_URL}/subcategories/${id}`,
  SUBCATEGORIES_BY_CATEGORY: (categoryId) => `${API_BASE_URL}/categories/${categoryId}/subcategories`,

  // Companies
  COMPANIES: `${API_BASE_URL}/companies`,
  COMPANY_BY_ID: (id) => `${API_BASE_URL}/companies/${id}`,

  // Cart
  MY_CART: `${API_BASE_URL}/mycart`,
  CART: `${API_BASE_URL}/cart`,
  CART_UPDATE: (id) => `${API_BASE_URL}/cart/${id}`,
  CHECKOUT: (id) => `${API_BASE_URL}/checkout/${id}`,

  // Wishlist
  MY_WISHLIST: `${API_BASE_URL}/mywishlist`,
  WISHLIST: `${API_BASE_URL}/wishlist`,
  WISHLIST_DELETE: (id) => `${API_BASE_URL}/wishlist/${id}`,
  WISHLIST_DELETE_BY_PRODUCT: (productId) => `${API_BASE_URL}/wishlist/product/${productId}`,

  // Orders
  ORDERS: `${API_BASE_URL}/orders`,
  MY_ORDERS: `${API_BASE_URL}/myorders`,
  ORDER_STATUS: (id, status) => `${API_BASE_URL}/orders/${id}/status/${status}`,
  ORDER_DELETE: (id) => `${API_BASE_URL}/orders/${id}`,
  ORDER_ESEWA: (cartid) => `${API_BASE_URL}/orders/esewa/${cartid}`,

  // Dashboard (Admin)
  DASHBOARD: `${API_BASE_URL}/dashboard`,
  DASHBOARD_SALES: `${API_BASE_URL}/dashboard/sales`,
  DASHBOARD_USERS: `${API_BASE_URL}/dashboard/users`,
  DASHBOARD_PRODUCTS: `${API_BASE_URL}/dashboard/products`,

  // Videos
  VEDIOS: `${API_BASE_URL}/vedios`,
  VEDIOS_ACTIVE: `${API_BASE_URL}/vedios/active`,
  VEDIO_BY_ID: (id) => `${API_BASE_URL}/vedios/${id}`,
  VEDIO_UPDATE_STATUS: (id) => `${API_BASE_URL}/vedios/${id}/status`,
  VEDIO_UPDATE_PRIORITY: (id) => `${API_BASE_URL}/vedios/${id}/priority`,

  // Banners (Public)
  BANNERS: `${API_BASE_URL}/banners`,
  BANNERS_ACTIVE: `${API_BASE_URL}/banners/active`,
  BANNER_BY_ID: (id) => `${API_BASE_URL}/banners/${id}`,

  // Testimonials
  TESTIMONIALS: `${API_BASE_URL}/testimonials`,
  TESTIMONIAL_BY_ID: (id) => `${API_BASE_URL}/testimonials/${id}`,

  // Leaderships
  LEADERSHIPS: `${API_BASE_URL}/leaderships`,
  LEADERSHIP_BY_ID: (id) => `${API_BASE_URL}/leaderships/${id}`,
};
