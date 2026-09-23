import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('eligentia_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('eligentia_token');
      localStorage.removeItem('eligentia_user');
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

// Auth
export const registerUser = (data) => api.post('/auth/register', data);
export const loginUser = (data) => api.post('/auth/login', data);
export const getMe = () => api.get('/auth/me');

// Student profile
export const getProfile = () => api.get('/students/profile');
export const updateProfile = (data) => api.put('/students/profile', data);
export const getReadiness = () => api.get('/students/readiness');

// Resume
export const uploadResume = (formData) =>
  api.post('/resumes/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const getResume = () => api.get('/resumes');

// Companies
export const getCompanies = () => api.get('/companies');
export const createCompany = (data) => api.post('/companies', data);
export const updateCompany = (id, data) => api.put(`/companies/${id}`, data);
export const deleteCompany = (id) => api.delete(`/companies/${id}`);

// Placements
export const getPlacements = () => api.get('/placements');
export const getPlacementById = (id) => api.get(`/placements/${id}`);
export const createPlacement = (data) => api.post('/placements', data);
export const updatePlacement = (id, data) => api.put(`/placements/${id}`, data);
export const deletePlacement = (id) => api.delete(`/placements/${id}`);
export const getMatch = (id) => api.get(`/placements/${id}/match`);

// Applications
export const applyToPlacement = (placementDriveId) => api.post('/applications', { placementDriveId });
export const getMyApplications = () => api.get('/applications/my');
export const getAllApplications = (placementDriveId) =>
  api.get('/applications', { params: placementDriveId ? { placementDriveId } : {} });
export const updateApplicationStatus = (id, status) => api.put(`/applications/${id}/status`, { status });

// Notifications
export const getNotifications = () => api.get('/notifications');
export const markNotificationRead = (id) => api.put(`/notifications/${id}/read`);
export const markAllNotificationsRead = () => api.put('/notifications/read-all');

// Admin
export const getAdminDashboard = () => api.get('/admin/dashboard');
export const getAdminStudents = () => api.get('/admin/students');

export default api;
