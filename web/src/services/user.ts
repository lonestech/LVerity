import { get, post, put, del } from '@/utils/request';

// 用户登录
export async function login(data: API.LoginParams) {
  return post<{
    token: string;
    user: API.User;
  }>('/auth/login', data);
}

// 用户登出
export async function logout() {
  return post('/auth/logout');
}

// 获取当前用户信息
export async function getCurrentUser() {
  return get<API.User>('/user/profile');
}

// 获取用户列表
export async function getUserList(params: API.PageParams & Record<string, any>) {
  return get<API.PageResult<API.User>>('/users', params);
}

// 获取用户详情
export async function getUserDetail(id: string) {
  return get<API.User>(`/users/${id}`);
}

// 创建用户
export async function createUser(data: Partial<API.User> & { password: string }) {
  return post<API.User>('/users', data);
}

// 更新用户
export async function updateUser(id: string, data: Partial<API.User>) {
  return put<API.User>(`/users/${id}`, data);
}

// 删除用户
export async function deleteUser(id: string) {
  return del(`/users/${id}`);
}

// 修改密码
export async function changePassword(data: {
  old_password: string;
  new_password: string;
}) {
  return post('/user/change-password', data);
}

// 重置密码
export async function resetPassword(id: string) {
  return post(`/users/${id}/reset-password`);
}

// 启用用户
export async function enableUser(id: string) {
  return post(`/users/${id}/enable`);
}

// 禁用用户
export async function disableUser(id: string) {
  return post(`/users/${id}/disable`);
}

// 锁定用户
export async function lockUser(id: string) {
  return post(`/users/${id}/lock`);
}

// 解锁用户
export async function unlockUser(id: string) {
  return post(`/users/${id}/unlock`);
}

// 获取用户统计信息
export async function getUserStats() {
  return get<{
    total: number;
    active: number;
    locked: number;
    disabled: number;
    online: number;
  }>('/users/stats');
}

// 刷新令牌
export async function refreshToken() {
  return post<{
    token: string;
    expires_in: number;
  }>('/auth/refresh-token');
}

// 更新用户信息
export async function updateUserProfile(data: Partial<API.User>) {
  return put<API.User>('/user/profile', data);
}

// 获取验证码
export async function getCaptcha() {
  return get<{
    url: string;
    key: string;
  }>('/auth/captcha');
}

// 验证验证码
export async function verifyCaptcha(data: {
  key: string;
  code: string;
}) {
  return post('/auth/verify-captcha', data);
}

// 获取用户登录历史
export async function getUserLoginHistory(params: API.PageParams) {
  return get<API.PageResult<{
    id: string;
    user_id: string;
    ip: string;
    location: string;
    device: string;
    browser: string;
    os: string;
    status: string;
    created_at: string;
  }>>('/user/login-history', params);
}

// 获取用户操作日志
export async function getUserOperationLogs(params: API.PageParams) {
  return get<API.PageResult<{
    id: string;
    user_id: string;
    action: string;
    resource: string;
    details: string;
    ip: string;
    created_at: string;
  }>>('/user/operation-logs', params);
}
