import axios from 'axios';

export interface ApiResponse<T> { code: number; message?: string; data: T; }
export interface User { id: number; username: string; email: string; role: string; roleLabel: string; status: string; }
export interface Role { id: number; name: string; label: string; permissions: string; created_at: string; }
export interface LoginResponse { token: string; user: User; }
export interface Stats { totalUsers: number; activeUsers: number; todayLogins: number; totalRoles: number; }
export interface LoginLog { id: number; username: string; ip: string; status: string; created_at: string; }
export interface PageResult<T> { list: T[]; total: number; page: number; pageSize: number; }

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
  login: (data: { username: string; password: string }): Promise<ApiResponse<LoginResponse>> => request.post('/auth/login', data),
  logout: (): Promise<ApiResponse<null>> => request.post('/auth/logout'),
  me: (): Promise<ApiResponse<User>> => request.get('/auth/me'),
};

// Users API
export const usersApi = {
  list: (params?: Record<string, unknown>): Promise<ApiResponse<PageResult<User>>> => request.get('/users', { params }),
  get: (id: number): Promise<ApiResponse<User>> => request.get(`/users/${id}`),
  create: (data: Partial<User> & { password?: string }): Promise<ApiResponse<User>> => request.post('/users', data),
  update: (id: number, data: Partial<User>): Promise<ApiResponse<User>> => request.put(`/users/${id}`, data),
  delete: (id: number): Promise<ApiResponse<null>> => request.delete(`/users/${id}`),
  resetPassword: (id: number, newPassword: string): Promise<ApiResponse<null>> => request.put(`/users/${id}/reset-password`, { newPassword }),
};

// Roles API
export const rolesApi = {
  list: (): Promise<ApiResponse<Role[]>> => request.get('/roles'),
  create: (data: Partial<Role>): Promise<ApiResponse<Role>> => request.post('/roles', data),
  update: (id: number, data: Partial<Role>): Promise<ApiResponse<Role>> => request.put(`/roles/${id}`, data),
  delete: (id: number): Promise<ApiResponse<null>> => request.delete(`/roles/${id}`),
};

// Stats API
export const statsApi = {
  summary: (): Promise<ApiResponse<Stats>> => request.get('/stats'),
  loginLogs: (limit?: number): Promise<ApiResponse<LoginLog[]>> => request.get('/stats/login-logs', { params: { limit } }),
};
