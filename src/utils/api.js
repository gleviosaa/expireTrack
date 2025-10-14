import axios from 'axios';
import { supabase } from '../config/supabase';

// In production (Vercel), use the same domain. In development, use localhost:5000
// Check if VITE_API_URL is explicitly set, otherwise detect based on current location
const getApiUrl = () => {
  if (import.meta.env.VITE_API_URL !== undefined && import.meta.env.VITE_API_URL !== '') {
    return import.meta.env.VITE_API_URL;
  }
  // If running on localhost, use localhost:5000, otherwise use same origin
  return window.location.hostname === 'localhost' ? 'http://localhost:5000' : '';
};

const API_URL = getApiUrl();

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add Supabase token to requests
api.interceptors.request.use(async (config) => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      config.headers.Authorization = `Bearer ${session.access_token}`;
      console.log('✅ Added auth token to request');
    } else {
      console.warn('⚠️ No session or access token found');
    }
  } catch (error) {
    console.error('❌ Error getting session:', error);
  }
  return config;
});

// Auth endpoints
export const auth = {
  register: async (email, password, name) => {
    const response = await api.post('/auth/register', { email, password, name });
    return response.data;
  },

  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  verifyToken: async () => {
    const response = await api.get('/auth/verify');
    return response.data;
  },

  logout: async () => {
    const response = await api.post('/auth/logout');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return response.data;
  }
};

// Product endpoints
export const products = {
  getAll: async () => {
    const response = await api.get('/api/products');
    return response.data;
  },

  create: async (productData) => {
    const response = await api.post('/api/products', productData);
    return response.data;
  },

  delete: async (productId) => {
    const response = await api.delete(`/api/products/${productId}`);
    return response.data;
  },

  getBarcodeImage: async (barcode) => {
    try {
      const response = await api.get(`/api/products/barcode/${barcode}/image`);
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }
};

// Upload endpoints
export const upload = {
  uploadImage: async (file, barcode = null) => {
    const formData = new FormData();
    formData.append('image', file);
    if (barcode) {
      formData.append('barcode', barcode);
    }

    const response = await api.post('/api/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  }
};

export default api;
