import { RequestConfig } from '@umijs/max';
import { message } from 'antd';
import { getCurrentUser } from './services/user';

// 错误处理方案： 错误类型
enum ErrorShowType {
  SILENT = 0,
  WARN_MESSAGE = 1,
  ERROR_MESSAGE = 2,
  NOTIFICATION = 3,
  REDIRECT = 9,
}

// 与后端约定的响应数据格式
interface ResponseStructure {
  success: boolean;
  data: any;
  error_code?: string;
  error_message?: string;
}

// 运行时配置
export const request: RequestConfig = {
  // 统一的请求设定
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  },

  // 错误处理： 错误接收及处理
  errorConfig: {
    errorHandler: (error: any, opts: any) => {
      if (opts?.skipErrorHandler) throw error;
      
      if (error.response) {
        // 响应错误处理
        const { status, data } = error.response;
        switch (status) {
          case 401:
            message.error('未登录或登录已过期，请重新登录');
            // 跳转登录页
            window.location.href = '/login';
            break;
          case 403:
            message.error('没有权限访问该资源');
            break;
          case 404:
            message.error('请求的资源不存在');
            break;
          case 500:
            message.error('服务器错误，请稍后重试');
            break;
          default:
            message.error(data?.error_message || '请求失败，请重试');
        }
      } else if (error.request) {
        // 请求发送失败
        message.error('网络错误，请检查网络连接');
      } else {
        // 其他错误
        message.error('请求失败，请重试');
      }
    },
  },

  // 请求拦截器
  requestInterceptors: [
    (config: any) => {
      // 拦截请求配置，进行个性化处理。
      const token = localStorage.getItem('token');
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
      return config;
    }
  ],

  // 响应拦截器
  responseInterceptors: [
    (response) => {
      // 拦截响应数据，进行个性化处理
      const { data } = response as unknown as { data: ResponseStructure };

      if (!data.success) {
        message.error(data.error_message);
      }
      
      return response;
    }
  ],
};

// 全局初始化数据配置，用于 Layout 用户信息和权限初始化
export async function getInitialState(): Promise<{
  currentUser?: API.User;
  loading?: boolean;
  fetchUserInfo?: () => Promise<API.User | undefined>;
}> {
  const fetchUserInfo = async () => {
    try {
      const response = await getCurrentUser();
      return response.data;
    } catch (error) {
      return undefined;
    }
  };

  // 如果不是登录页面，执行
  const { pathname } = window.location;
  if (pathname !== '/login') {
    const currentUser = await fetchUserInfo();
    return {
      fetchUserInfo,
      currentUser,
    };
  }
  return {
    fetchUserInfo,
  };
}

// 全局布局配置
export const layout = () => {
  return {
    logo: '/logo.png',
    menu: {
      locale: false,
    },
    logout: () => {
      localStorage.removeItem('token');
      window.location.href = '/login';
    },
  };
};
