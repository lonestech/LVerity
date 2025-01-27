import { request } from '@umijs/max';
import { message } from 'antd';
import { history } from '@umijs/max';
import { refreshToken } from '@/services/user';

// 请求队列
const pendingRequests = new Map();

// 创建取消令牌
const createCancelToken = (config: any) => {
  const controller = new AbortController();
  const url = [config.method, config.url, JSON.stringify(config.params)].join('&');
  config.signal = controller.signal;
  pendingRequests.set(url, controller);
  return controller;
};

// 移除请求
const removePendingRequest = (config: any) => {
  const url = [config.method, config.url, JSON.stringify(config.params)].join('&');
  if (pendingRequests.has(url)) {
    const controller = pendingRequests.get(url);
    controller.abort();
    pendingRequests.delete(url);
  }
};

// 刷新token
let isRefreshing = false;
let waitingQueue: any[] = [];

const processQueue = (error: any = null) => {
  waitingQueue.forEach((callback) => {
    if (error) {
      callback(Promise.reject(error));
    } else {
      callback(Promise.resolve());
    }
  });
  waitingQueue = [];
};

// 统一的请求配置
const requestConfig = {
  prefix: '',  
  timeout: 10000,
  errorConfig: {
    adaptor: (resData: any) => {
      return {
        ...resData,
        success: resData.success,  
        data: resData.data,
        errorMessage: resData.error_message || '请求失败',
      };
    },
  },
  requestInterceptors: [
    (url: string, options: any) => {
      // 添加token和Content-Type
      const token = localStorage.getItem('token');
      options.headers = {
        ...options.headers,
        'Content-Type': 'application/json',
      };
      
      if (token) {
        options.headers.Authorization = `Bearer ${token}`;
      }

      // 处理重复请求
      removePendingRequest(options);
      createCancelToken(options);

      return { url, options };
    }
  ],
  responseInterceptors: [
    async (response: Response, options: any) => {
      // 移除已完成的请求
      removePendingRequest(options);

      if (!response.ok) {
        throw new Error(response.statusText);
      }

      const data = await response.clone().json();
      
      // 处理token过期
      if (data.code === 401 || data.error_message === 'token expired') {
        if (!isRefreshing) {
          isRefreshing = true;
          try {
            const result = await refreshToken();
            if (result.success) {
              localStorage.setItem('token', result.data.token);
              processQueue();
            } else {
              processQueue(new Error('刷新token失败'));
              localStorage.removeItem('token');
              history.push('/user/login');
              return Promise.reject(new Error('刷新token失败'));
            }
          } catch (error) {
            processQueue(error);
            localStorage.removeItem('token');
            history.push('/user/login');
            return Promise.reject(error);
          } finally {
            isRefreshing = false;
          }
        }

        // 将请求加入队列
        return new Promise((resolve) => {
          waitingQueue.push((token: string) => {
            options.headers.Authorization = `Bearer ${token}`;
            resolve(request(options.url, options));
          });
        });
      }

      return response;
    }
  ],
  errorHandler: (error: any) => {
    // 处理请求错误
    if (error.name === 'AbortError') {
      return;
    }

    if (error.response) {
      // 处理HTTP错误
      switch (error.response.status) {
        case 401:
          localStorage.removeItem('token');
          history.push('/user/login');
          message.error('登录已过期，请重新登录');
          break;
        case 403:
          message.error('没有权限访问');
          break;
        case 404:
          message.error('请求的资源不存在');
          break;
        case 500:
          message.error('服务器错误，请稍后重试');
          break;
        default:
          message.error('请求失败，请重试');
      }
    } else if (error.request) {
      // 请求发送失败
      message.error('网络错误，请检查网络连接');
    } else {
      // 其他错误
      message.error('请求失败，请重试');
    }
    return Promise.reject(error);
  },
};

// GET请求
export async function get<T = any>(url: string, params?: Record<string, any>) {
  return request<API.Result<T>>(url, {
    ...requestConfig,
    method: 'GET',
    params,
    retry: 3, // 失败重试次数
    retryDelay: 1000, // 重试间隔
  });
}

// POST请求
export async function post<T = any>(url: string, data?: Record<string, any>) {
  return request<API.Result<T>>(url, {
    ...requestConfig,
    method: 'POST',
    data,
    retry: 3,
    retryDelay: 1000,
  });
}

// PUT请求
export async function put<T = any>(url: string, data?: Record<string, any>) {
  return request<API.Result<T>>(url, {
    ...requestConfig,
    method: 'PUT',
    data,
    retry: 3,
    retryDelay: 1000,
  });
}

// DELETE请求
export async function del<T = any>(url: string) {
  return request<API.Result<T>>(url, {
    ...requestConfig,
    method: 'DELETE',
    retry: 3,
    retryDelay: 1000,
  });
}
