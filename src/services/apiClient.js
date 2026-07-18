import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1',
  withCredentials: true, // Crucial for sending secure cookies automatically
});

// Interceptor to handle global unauthorized responses
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // If the server tells us we are not authenticated (e.g., cookie expired)
    if (error.response?.status === 401) {
      // Don't force redirect if the 401 is just from the initial auth check
      if (error.config?.url?.includes('/users/me')) {
        return Promise.reject(error);
      }
      
      const publicPaths = ['/login', '/signup', '/forgot-password', '/'];
      const isPublicPath = publicPaths.includes(window.location.pathname) || window.location.pathname.startsWith('/reset-password');
      
      if (!isPublicPath) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
