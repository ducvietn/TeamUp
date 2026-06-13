import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/password', data),
};

export const groupAPI = {
  create: (data) => api.post('/groups', data),
  getMyGroups: () => api.get('/groups/my'),
  getAllGroups: () => api.get('/groups/all'),
  getById: (id) => api.get(`/groups/${id}`),
  join: (inviteCode) => api.post('/groups/join', { inviteCode }),
  update: (id, data) => api.put(`/groups/${id}`, data),
  delete: (id) => api.delete(`/groups/${id}`),
  getMembers: (id) => api.get(`/groups/${id}/members`),
  removeMember: (groupId, memberId) => api.delete(`/groups/${groupId}/members/${memberId}`),
  regenerateCode: (id) => api.post(`/groups/${id}/regenerate-code`),
  enablePeerReview: (id) => api.post(`/groups/${id}/enable-peer-review`),
};

export const taskAPI = {
  create: (data) => api.post('/tasks', data),
  getByGroup: (groupId, status) => api.get(`/tasks/group/${groupId}`, { params: { status } }),
  getMyTasks: (status) => api.get('/tasks/my', { params: { status } }),
  getById: (id) => api.get(`/tasks/${id}`),
  update: (id, data) => api.put(`/tasks/${id}`, data),
  updateProgress: (id, progress) => api.put(`/tasks/${id}/progress`, { progress }),
  approve: (id) => api.post(`/tasks/${id}/approve`),
  reject: (id, feedback) => api.post(`/tasks/${id}/reject`, { feedback }),
  delete: (id) => api.delete(`/tasks/${id}`),
  getStats: (groupId) => api.get(`/tasks/group/${groupId}/stats`),
};

export const submissionAPI = {
  create: (formData) => api.post('/submissions', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getByTask: (taskId) => api.get(`/submissions/task/${taskId}`),
  getMy: () => api.get('/submissions/my'),
  getById: (id) => api.get(`/submissions/${id}`),
  approve: (id) => api.post(`/submissions/${id}/approve`),
  reject: (id, feedback) => api.post(`/submissions/${id}/reject`, { feedback }),
};

export const peerReviewAPI = {
  create: (data) => api.post('/peer-reviews', data),
  getGroupReviews: (groupId) => api.get(`/peer-reviews/group/${groupId}`),
  getMyReceived: (groupId) => api.get(`/peer-reviews/received/${groupId}`),
  getMyGiven: (groupId) => api.get(`/peer-reviews/given/${groupId}`),
  getStats: (groupId) => api.get(`/peer-reviews/stats/${groupId}`),
  getStatus: (groupId) => api.get(`/peer-reviews/status/${groupId}`),
};

export const reportAPI = {
  getContribution: (groupId) => api.get(`/reports/contribution/${groupId}`),
  getDashboard: (groupId) => api.get(`/reports/dashboard/${groupId}`),
  exportPDF: (groupId) => api.get(`/reports/export/pdf/${groupId}`, { responseType: 'blob' }),
  exportExcel: (groupId) => api.get(`/reports/export/excel/${groupId}`, { responseType: 'blob' }),
};

export const notificationAPI = {
  getAll: (page, limit) => api.get('/notifications', { params: { page, limit } }),
  markRead: (id) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all'),
  delete: (id) => api.delete(`/notifications/${id}`),
};

export default api;
