import { request } from '@umijs/max';

/** 登录接口 POST /api/auth/login */
export async function login(body: API.LoginParams) {
  return request<{
    success: boolean;
    data: {
      token: string;
      user: API.CurrentUser;
    };
    error_message?: string;
  }>('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
  });
}

/** 退出登录接口 POST /api/auth/logout */
export async function logout(options?: { [key: string]: any }) {
  return request&lt;Record&lt;string, any>>('/api/auth/logout', {
    method: 'POST',
    ...(options || {}),
  });
}

/** 获取当前的用户 GET /api/user/profile */
export async function currentUser(options?: { [key: string]: any }) {
  return request&lt;{
    data: API.CurrentUser;
  }>('/api/user/profile', {
    method: 'GET',
    ...(options || {}),
  });
}

/** 刷新令牌 POST /api/auth/refresh */
export async function refreshToken(options?: { [key: string]: any }) {
  return request&lt;{
    data: {
      token: string;
    };
  }>('/api/auth/refresh', {
    method: 'POST',
    ...(options || {}),
  });
}
