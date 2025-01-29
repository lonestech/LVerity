// 运行时配置
import { RunTimeLayoutConfig } from '@umijs/max';
import { message } from 'antd';
import { RequestConfig } from '@umijs/max';
import { history } from '@umijs/max';
import { getCurrentUser } from '@/services/user';

// 全局初始化数据配置，用于 Layout 用户信息和权限初始化
export async function getInitialState(): Promise<{
  currentUser?: API.User;
  fetchUserInfo?: () => Promise<API.User | undefined>;
}> {
  const fetchUserInfo = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return undefined;
      }
      const response = await getCurrentUser();
      return response.data;
    } catch (error) {
      history.push('/user/login');
      return undefined;
    }
  };

  const currentUser = await fetchUserInfo();
  
  return {
    currentUser,
    fetchUserInfo,
  };
}

export const layout: RunTimeLayoutConfig = ({ initialState, setInitialState }) => {
  return {
    logo: '/logo.svg',
    menu: {
      locale: false,
    },
    layout: 'mix',
    fixedHeader: true,
    logout: async () => {
      try {
        // 清除本地存储
        localStorage.removeItem('token');
        // 更新状态
        await setInitialState((s) => ({ ...s, currentUser: undefined }));
        // 重定向到登录页
        window.location.href = '/user/login';
      } catch (error) {
        console.error('Logout failed:', error);
      }
    },
    rightRender: false,
    onPageChange: () => {
      const { location } = history;
      // 如果没有登录，重定向到 login
      if (!initialState?.currentUser && location.pathname !== '/user/login') {
        window.location.href = '/user/login';
      }
    },
  };
};

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
  errorCode?: number;
  errorMessage?: string;
  showType?: ErrorShowType;
}

// 运行时配置
export const request: RequestConfig = {
  timeout: 10000,
  errorConfig: {
    errorHandler: (error: any) => {
      if (error.response) {
        // 请求成功发出且服务器也响应了状态码，但状态代码超出了 2xx 的范围
        if (error.response.status === 401) {
          message.error('登录已过期，请重新登录');
          history.push('/user/login');
        } else {
          message.error(`请求错误 ${error.response.status}: ${error.response.data?.error_message || error.message}`);
        }
      } else if (error.request) {
        // 请求已经成功发起，但没有收到响应
        message.error('网络错误，请检查网络连接');
      } else {
        // 发送请求时出了点问题
        message.error('请求发送失败');
      }
    },
  },
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
  responseInterceptors: [
    (response) => {
      // 拦截响应数据，进行个性化处理
      const { data } = response as unknown as { data: ResponseStructure };

      if (!data.success) {
        message.error(data.errorMessage);
      }
      
      return response;
    }
  ],
};
