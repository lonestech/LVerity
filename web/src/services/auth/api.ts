import { request } from '@umijs/max';

/** 登录接口 POST /auth/login */
export async function login(body: API.LoginParams) {
  return request<API.LoginResult>('/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
  });
}

/** 获取当前用户 GET /user/profile */
export async function getCurrentUser() {
  return request<{
    success: boolean;
    data: API.CurrentUser;
    error_message?: string;
  }>('/user/profile', {
    method: 'GET',
  });
}

/** 退出登录接口 POST /auth/logout */
export async function logout() {
  return request<{
    success: boolean;
    error_message?: string;
  }>('/auth/logout', {
    method: 'POST',
  });
}
