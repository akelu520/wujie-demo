export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  roleLabel: string;
  status: 'active' | 'disabled';
}

export interface Role {
  id: number;
  name: string;
  label: string;
  permissions: string;
  created_at: string;
}

export interface LoginLog {
  id: number;
  username: string;
  ip: string;
  status: 'success' | 'failed';
  created_at: string;
}

export interface Stats {
  totalUsers: number;
  activeUsers: number;
  todayLogins: number;
  totalRoles: number;
}

export interface ApiResponse<T> {
  code: number;
  message?: string;
  data: T;
}

export interface PageResult<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}
