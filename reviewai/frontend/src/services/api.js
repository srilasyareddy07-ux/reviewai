import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  timeout: 120000, // 2 min for AI calls
  headers: { 'Content-Type': 'application/json' }
});

// Inject auth headers
api.interceptors.request.use((config) => {
  const userId = localStorage.getItem('reviewai_user_id');
  if (userId) {
    config.headers['x-user-id'] = userId;
  }
  return config;
});

// Handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('reviewai_user_id');
      localStorage.removeItem('reviewai_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// Auth
export const syncUser = (data) => api.post('/auth/sync', data);
export const getMe = () => api.get('/auth/me');

// Reviews
export const analyzePR = (prUrl) => api.post('/reviews/analyze-pr', { prUrl });
export const analyzeCode = (code, language) => api.post('/reviews/analyze-code', { code, language });
export const getReviews = (page = 1, limit = 10) => api.get(`/reviews?page=${page}&limit=${limit}`);
export const getReview = (id) => api.get(`/reviews/${id}`);
export const generateFix = (reviewId, issueId) => api.post(`/reviews/${reviewId}/fix`, { issueId });
export const securityScan = (code, language) => api.post('/reviews/security-scan', { code, language });
export const deleteReview = (id) => api.delete(`/reviews/${id}`);

// Chat
export const sendMessage = (message, reviewId = null, history = []) =>
  api.post('/chat/message', { message, reviewId, conversationHistory: history });
export const getChatHistory = (reviewId) =>
  reviewId ? api.get(`/chat/history/${reviewId}`) : api.get('/chat/history');

// Analytics
export const getDashboard = () => api.get('/analytics/dashboard');

// Settings
export const getSettings = () => api.get('/settings');
export const updateSettings = (data) => api.put('/settings', data);
