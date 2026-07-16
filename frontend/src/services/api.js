import axios from 'axios';

// Remove all hardcoded production calls to localhost. Fallback only in dev.
export const API_BASE_URL = import.meta.env.PROD
  ? (import.meta.env.VITE_API_URL || '')
  : (import.meta.env.VITE_API_URL || 'http://localhost:8001');

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120000, // 120 seconds timeout
});

const RETRYABLE_METHODS = new Set(['get', 'head', 'options']);

// Helper to format Axios errors into user-friendly messages
export const getFriendlyErrorMessage = (error) => {
  if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
    return 'The request timed out (60-second limit). The backend might be waking up or processing a heavy report. Please try again.';
  }
  
  if (!error.response) {
    return 'Unable to connect to the backend server. It may be offline or waking up from sleep. Please try again in 30 seconds.';
  }

  const status = error.response.status;
  const detail = error.response.data?.detail;

  if (status === 429) {
    return 'AI analysis quota exceeded. Please wait a minute and try again.';
  }
  if (status === 503 || status === 504) {
    return 'The AI service is currently unavailable or initializing. Please try again.';
  }
  if (status >= 500) {
    return detail || 'Internal server error. The backend encountered an unexpected issue. Please try again.';
  }

  return detail || error.message || 'An unexpected error occurred. Please try again.';
};

// Response interceptor: handles retries for safe methods and attaches friendly messages
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config || {};
    const method = (config.method || 'get').toLowerCase();
    const status = error.response?.status;
    const shouldRetry =
      !config._retry &&
      RETRYABLE_METHODS.has(method) &&
      (!status || status === 408 || status === 429 || status >= 500);

    if (shouldRetry) {
      config._retry = true;
      await new Promise((resolve) => setTimeout(resolve, 2000));
      try {
        return await api(config);
      } catch (retryErr) {
        error = retryErr;
      }
    }

    // Auto-logout on 401
    if (status === 401) {
      localStorage.removeItem('tony_health_user');
      window.location.hash = '#/login';
    }

    // Attach friendly message to the error object
    error.friendlyMessage = getFriendlyErrorMessage(error);
    return Promise.reject(error);
  }
);

// Request interceptor to attach the Bearer token
api.interceptors.request.use(
  (config) => {
    const storedUser = localStorage.getItem('tony_health_user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        if (user.token) {
          config.headers.Authorization = `Bearer ${user.token}`;
        }
      } catch (err) {
        console.error('Failed to parse user from localStorage', err);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const apiService = {
  uploadReport: async (file, userId) => {
    const formData = new FormData();
    formData.append('file', file);
    if (userId && !isNaN(parseInt(userId))) {
      formData.append('user_id', parseInt(userId));
    }
    const response = await api.post('/upload_report', formData);
    return response.data;
  },

  getReports: async () => {
    const response = await api.get('/reports');
    return response.data;
  },

  getReportById: async (id) => {
    // Uses the configured api instance with timeout, auth token check, and friendly errors
    const response = await api.get(`/reports/${id}`);
    return response.data;
  },
  
  getUserReports: async (userId) => {
    const response = await api.get(`/users/${userId}/reports`);
    return response.data;
  },

  getNearbyHospitals: async (latitude, longitude) => {
    const response = await api.post('/nearby-hospitals', { latitude, longitude });
    return response.data;
  },
  
  googleAuth: async (token) => {
    const response = await api.post('/auth/google', { token });
    return response.data;
  },
  
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  register: async (name, email, password) => {
    const response = await api.post('/auth/register', { name, email, password });
    return response.data;
  },

  deleteReport: async (id) => {
    const response = await api.delete(`/reports/${id}`);
    return response.data;
  }
};

export default apiService;
