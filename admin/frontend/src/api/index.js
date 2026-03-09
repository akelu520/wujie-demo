import axios from 'axios';

const request = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

// 请求拦截：自动加 Token
request.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// 响应拦截：统一错误处理
request.interceptors.response.use(
  (res) => res.data,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err.response?.data || err);
  }
);

export default request;

// Auth API
export const authApi = {
  login: (data) => request.post('/auth/login', data),
  logout: () => request.post('/auth/logout'),
  me: () => request.get('/auth/me'),
};

// Users API
export const usersApi = {
  list: (params) => request.get('/users', { params }),
  get: (id) => request.get(`/users/${id}`),
  create: (data) => request.post('/users', data),
  update: (id, data) => request.put(`/users/${id}`, data),
  delete: (id) => request.delete(`/users/${id}`),
  resetPassword: (id, newPassword) => request.put(`/users/${id}/reset-password`, { newPassword }),
};

// Roles API
export const rolesApi = {
  list: () => request.get('/roles'),
  create: (data) => request.post('/roles', data),
  update: (id, data) => request.put(`/roles/${id}`, data),
  delete: (id) => request.delete(`/roles/${id}`),
};

// Stats API
export const statsApi = {
  summary: () => request.get('/stats'),
  loginLogs: (limit) => request.get('/stats/login-logs', { params: { limit } }),
};
