import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { notification } from 'antd';
import { getToken, logout, devLogin } from './auth';

// 创建 axios 实例
const axiosInstance = axios.create({
  baseURL: '/',
  timeout: 15000,
});

// 请求拦截器
axiosInstance.interceptors.request.use(
  (config) => {
    // 添加认证头
    const token = getToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  },
);

// 响应拦截器
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    // 直接返回响应数据
    return response.data;
  },
  (error: AxiosError) => {
    if (error.response) {
      const { status, data } = error.response;
      
      // 认证错误，清除用户信息并跳转到登录页
      if (status === 401) {
        // 避免在登录页显示未授权通知
        if (window.location.pathname !== '/login') {
          notification.error({
            message: '认证失败',
            description: '您的登录已过期，请重新登录',
          });
          // 在开发环境下，尝试一次开发者登录而不是直接登出
          const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
          if (isDev) {
            import('./auth').then(auth => {
              auth.devLogin().catch(() => {
                auth.logout();
              });
            });
          } else {
            logout();
          }
        }
      } else if (status === 404) {
        notification.error({
          message: '资源不存在',
          description: '请求的资源不存在',
        });
      } else if (status === 403) {
        notification.error({
          message: '访问被拒绝',
          description: '您没有权限执行此操作',
        });
      } else if (status === 500) {
        notification.error({
          message: '服务器错误',
          description: '服务器发生错误，请稍后再试',
        });
      } else {
        notification.error({
          message: `请求错误 (${status})`,
          description: (data as any)?.error || '未知错误',
        });
      }
    } else if (error.request) {
      notification.error({
        message: '网络错误',
        description: '无法连接到服务器，请检查您的网络连接',
      });
    } else {
      notification.error({
        message: '请求错误',
        description: error.message,
      });
    }
    
    return Promise.reject(error);
  },
);

// 自定义ApiResponse接口
export interface ApiResponse<T = any> {
  success: boolean;
  code?: number;
  message?: string;
  data: T;
}

// 导出 request 对象
export const request = {
  get: <T = any>(url: string, config?: any): Promise<ApiResponse<T>> => axiosInstance.get(url, config),
  post: <T = any>(url: string, data?: any, config?: any): Promise<ApiResponse<T>> => axiosInstance.post(url, data, config),
  put: <T = any>(url: string, data?: any, config?: any): Promise<ApiResponse<T>> => axiosInstance.put(url, data, config),
  delete: <T = any>(url: string, config?: any): Promise<ApiResponse<T>> => axiosInstance.delete(url, config),
  patch: <T = any>(url: string, data?: any, config?: any): Promise<ApiResponse<T>> => axiosInstance.patch(url, data, config),
};

// 为了兼容现有代码，同时默认导出
export default request;
