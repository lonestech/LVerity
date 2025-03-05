import axios from 'axios';
import { message } from 'antd';
import { userService } from './user';
import { handleApiError } from '@/utils/error';

// 设置基础URL
// 开发环境使用本地服务器，生产环境使用相对路径
const isProduction = window.location.hostname !== 'localhost';
const baseURL = isProduction ? '' : 'http://localhost:8080';

// 创建axios实例
const api = axios.create({
  baseURL,
  timeout: 10000,
});

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // 添加时间戳防止缓存
    if (config.method === 'get') {
      config.params = {
        ...config.params,
        _t: Date.now(),
      };
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    // 直接返回响应数据
    return response.data;
  },
  async (error) => {
    if (!error.response) {
      message.error('网络错误，请检查您的网络连接');
      return Promise.reject(error);
    }

    const { status, data } = error.response;

    // 处理常见错误
    switch (status) {
      case 400:
        message.error(data.message || '请求参数错误');
        break;
      case 401:
        // 未授权，尝试刷新token
        if (error.config && !error.config._retry) {
          try {
            return await refreshTokenAndRetry(error);
          } catch (refreshError) {
            // 刷新token失败，清除用户信息并跳转到登录页
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            
            // 避免在登录页再次跳转到登录页
            if (window.location.pathname !== '/login') {
              message.error('登录已过期，请重新登录');
              window.location.href = '/login';
            }
          }
        } else {
          message.error(data.message || '未授权，请登录');
          // 如果已经是登录请求，就不再跳转
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
        }
        break;
      case 403:
        message.error(data.message || '您没有权限执行此操作');
        break;
      case 404:
        message.error(data.message || '请求的资源不存在');
        break;
      case 500:
        message.error(data.message || '服务器内部错误');
        break;
      default:
        message.error(data.message || `请求错误 (${status})`);
    }

    // 统一处理API错误
    handleApiError(error);

    return Promise.reject(error);
  }
);

// 刷新token并重试原请求
async function refreshTokenAndRetry(error: any) {
  // 标记请求为重试
  error.config._retry = true;
  
  try {
    // 获取刷新token
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('No refresh token');
    }
    
    // 刷新token
    const response = await userService.refreshToken(refreshToken);
    
    // 保存新token
    localStorage.setItem('token', response.token);
    
    // 更新请求头并重试
    error.config.headers.Authorization = `Bearer ${response.token}`;
    return api(error.config);
  } catch (e) {
    return Promise.reject(e);
  }
}

export default api;
