import { request } from '@umijs/max';

/** 登录接口 POST /api/auth/login */
export async function login(body: API.LoginParams) {
  return request<API.LoginResult>('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
  });
}

/** 获取当前用户 GET /api/user/profile */
export async function getCurrentUser() {
  return request<API.CurrentUser>('/api/user/profile', {
    method: 'GET',
  });
}

/** 退出登录接口 POST /api/auth/logout */
export async function logout() {
  return request<Record<string, any>>('/api/auth/logout', {
    method: 'POST',
  });
}
