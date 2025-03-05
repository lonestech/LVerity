import { LoginRequest, LoginResponse, User, UserCreateRequest, UserUpdateRequest } from '../models/user';
import api from './api';
import { ApiResponse, PaginatedResponse } from './device';
import axios from 'axios';
import { isProduction } from '../utils/env';

// 创建认证API实例，不带token验证
const authApi = axios.create({
  baseURL: isProduction ? '/auth' : 'http://localhost:8080/auth',
  timeout: 10000,
});

export const userService = {
  // 获取用户列表
  list: async (params: { page?: number; pageSize?: number; status?: string; roleID?: string; [key: string]: any }) => {
    const { data } = await api.get<ApiResponse<PaginatedResponse<User>>>('/api/users', { params });
    return data.data;
  },

  // 获取单个用户
  get: async (id: string) => {
    const { data } = await api.get<ApiResponse<User>>(`/api/users/${id}`);
    return data.data;
  },

  // 创建用户
  create: async (user: UserCreateRequest) => {
    const { data } = await api.post<ApiResponse<User>>('/api/users', user);
    return data.data;
  },

  // 更新用户
  update: async (id: string, user: UserUpdateRequest) => {
    const { data } = await api.put<ApiResponse<User>>(`/api/users/${id}`, user);
    return data.data;
  },

  // 删除用户
  delete: async (id: string) => {
    await api.delete(`/api/users/${id}`);
  },

  // 登录
  login: async (credentials: LoginRequest) => {
    const { data } = await authApi.post<ApiResponse<LoginResponse>>('/login', credentials);
    
    // 保存token到localStorage
    if (data.success && data.data.token) {
      localStorage.setItem('token', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data.user));
    }
    
    return data.data;
  },

  // 登出
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // 获取当前用户信息
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) as User : null;
  },

  // 刷新令牌
  refreshToken: async (refreshToken: string) => {
    const { data } = await authApi.post<ApiResponse<{ token: string; expires: number }>>('/refresh', { refreshToken });
    if (data.success && data.data.token) {
      localStorage.setItem('token', data.data.token);
    }
    return data.data;
  },

  // 更改密码
  changePassword: async (oldPassword: string, newPassword: string) => {
    const { data } = await api.post<ApiResponse<{ success: boolean }>>('/api/user/change-password', {
      old_password: oldPassword,
      new_password: newPassword,
    });
    return data.data;
  },

  // 获取验证码
  getCaptcha: async () => {
    const { data } = await authApi.get<ApiResponse<{ id: string; data: string }>>('/captcha');
    return data.data;
  }
};
