import axios from 'axios';
import { toast } from 'sonner';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Error handling interceptor
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.error || error.message || 'An unexpected error occurred';
    
    // Check if we should skip the toast for this specific request
    const showToast = error.config?.showToast !== false;
    
    if (showToast) {
      toast.error(message);
    }
    
    return Promise.reject(new Error(message));
  }
);

// Add custom property to AxiosRequestConfig for toast control
declare module 'axios' {
  export interface AxiosRequestConfig {
    showToast?: boolean;
  }
}

export default api;
