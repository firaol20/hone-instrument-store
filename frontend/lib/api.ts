import axios, { AxiosInstance } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const api: AxiosInstance = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle responses and token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null;
        if (refreshToken) {
          const response = await axios.post(`${API_URL}/api/auth/refresh`, { refreshToken });
          const { token } = response.data;
          localStorage.setItem('authToken', token);
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('authToken');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;

// API endpoints
export const authAPI = {
  signup: (data: { email: string; password: string; name: string }) =>
    api.post('/auth/signup', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  googleAuth: (data: { idToken: string }) =>
    api.post('/auth/google', data),
  logout: () => api.post('/auth/logout'),
  refreshToken: (refreshToken: string) =>
    api.post('/auth/refresh', { refreshToken }),
  forgotPassword: (email: string) => 
    api.post('/auth/forgot-password', { email }),
  resetPassword: (token: string, password: string) => 
    api.post(`/auth/reset-password/${token}`, { password }),
};

export const productsAPI = {
  getAll: (params?: any) => api.get('/products', { params }),
  getById: (id: string) => api.get(`/products/${id}`),
  getBySlug: (slug: string) => api.get(`/products/slug/${slug}`),
  search: (query: string) => api.get('/products/search', { params: { q: query } }),
};

export const categoriesAPI = {
  getAll: () => api.get('/categories'),
  getBySlug: (slug: string) => api.get(`/categories/${slug}`),
};

export const ordersAPI = {
  create: (data: any) => api.post('/orders', data),
  getById: (id: string) => api.get(`/orders/${id}`),
  update: (id: string, data: { address?: any; deliveryOption?: string; notes?: string }) =>
    api.patch(`/orders/${id}`, data),
  getCustomerOrders: () => api.get('/customers/orders'),
};

export const paymentsAPI = {
  chapaInitialize: (orderId: string) =>
    api.post('/payments/chapa/initialize', { orderId }),
  chapaVerify: (orderId: string) =>
    api.get('/payments/chapa/verify', { params: { orderId } }),
};

export const customersAPI = {
  getProfile: () => api.get('/customers/profile'),
  updateProfile: (data: any) => api.put('/customers/profile', data),
  addAddress: (data: any) => api.post('/customers/addresses', data),
  updateAddress: (id: string, data: any) =>
    api.put(`/customers/addresses/${id}`, data),
  getAddresses: () => api.get('/customers/addresses'),
};

export const uploadAPI = {
  uploadFile: (file: File, folder = 'hone_store') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);
    return api.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

export const adminAPI = {
  // Dashboard
  getDashboard: () => api.get('/admin/dashboard'),
  getRevenueStats: (period: string, groupBy = 'day') => api.get(`/admin/revenue-stats?period=${period}&groupBy=${groupBy}`),

  // Products
  getProducts: (params?: any) => api.get('/admin/products', { params }),
  createProduct: (data: any) => api.post('/admin/products', data),
  updateProduct: (id: string, data: any) => api.put(`/admin/products/${id}`, data),
  deleteProduct: (id: string) => api.delete(`/admin/products/${id}`),

  // Orders
  getOrders: (params?: any) => api.get('/admin/orders', { params }),
  getOrderById: (id: string) => api.get(`/admin/orders/${id}`),
  updateOrderStatus: (id: string, status: string) =>
    api.put(`/admin/orders/${id}`, { status }),
  deleteOrder: (id: string) => api.delete(`/admin/orders/${id}`),

  // Customers
  getCustomers: (params?: any) => api.get('/admin/customers', { params }),
  toggleAdminRole: (id: string) => api.put(`/admin/customers/${id}/toggle-admin`),
  deleteCustomer: (id: string) => api.delete(`/admin/customers/${id}`),

  // Promotions (CMS)
  getPromotions: () => api.get('/admin/promotions'),
  createPromotion: (data: any) => api.post('/admin/promotions', data),
  updatePromotion: (id: string, data: any) => api.put(`/admin/promotions/${id}`, data),
  deletePromotion: (id: string) => api.delete(`/admin/promotions/${id}`),

  // Media (CMS)
  getMediaAssets: (type?: string) => api.get('/admin/media', { params: { type } }),
  uploadMediaAsset: (data: any) => api.post('/admin/media', data),
  deleteMediaAsset: (id: string) => api.delete(`/admin/media/${id}`),

  // Settings
  getSettings: () => api.get('/admin/settings'),
  updateSettings: (data: any) => api.put('/admin/settings', data),
  toggleMaintenanceMode: (enabled: boolean) =>
    api.post('/admin/settings/maintenance', { enabled }),
};

export const publicAPI = {
  checkMaintenanceMode: () => api.get('/public/maintenance'),
  getActivePromotions: () => api.get('/public/promotions'),
};

export const ratingsAPI = {
  getUserAllRatings: () => api.get('/ratings/user-ratings'),
  getProductRatings: (productId: string, params?: any) =>
    api.get(`/ratings/product/${productId}`, { params }),
  getUserRating: (productId: string) =>
    api.get(`/ratings/product/${productId}/user`),
  createRating: (data: { productId: string; rating: number; review?: string }) =>
    api.post('/ratings', data),
  // Admin
  getAllRatings: (params?: any) => api.get('/ratings', { params }),
  deleteRating:  (id: string)   => api.delete(`/ratings/${id}`),
};
