import axios, { AxiosRequestConfig } from 'axios';
import { handleApiError } from './error';
import { baseApiUrl } from './env';

// 设置API基础路径
// 我们不需要在baseURL中添加/api，因为我们会在每个请求中明确添加
const baseURL = baseApiUrl;

const axiosInstance = axios.create({
  baseURL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
axiosInstance.interceptors.request.use(
  (config) => {
    // 从localStorage获取token
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

// 响应拦截器添加错误处理
axiosInstance.interceptors.response.use(
  response => response.data,
  error => {
    handleApiError(error);
    return Promise.reject(error);
  }
);

export default {
  get(url: string, config?: AxiosRequestConfig) {
    return axiosInstance.get(url, config);
  },
  post(url: string, data?: any, config?: AxiosRequestConfig) {
    return axiosInstance.post(url, data, config);
  },
  put(url: string, data?: any, config?: AxiosRequestConfig) {
    return axiosInstance.put(url, data, config);
  },
  delete(url: string, config?: AxiosRequestConfig) {
    return axiosInstance.delete(url, config);
  },
  patch(url: string, data?: any, config?: AxiosRequestConfig) {
    return axiosInstance.patch(url, data, config);
  },
};