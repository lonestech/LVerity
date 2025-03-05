// 用户认证相关的工具函数

export interface UserInfo {
  id: string;
  username: string;
  role: string;
  permissions?: string[];
}

const TOKEN_KEY = 'lverity_token';
const USER_KEY = 'lverity_user';

/**
 * 保存用户认证信息
 */
export const setAuth = (token: string, user: UserInfo) => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

/**
 * 获取Token
 */
export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

/**
 * 获取当前登录用户信息
 */
export const getCurrentUser = (): UserInfo | null => {
  const userStr = localStorage.getItem(USER_KEY);
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr) as UserInfo;
  } catch (e) {
    console.error('Failed to parse user info', e);
    return null;
  }
};

/**
 * 获取当前登录用户信息 (别名，为了兼容原代码)
 */
export const getLoggedInUser = (): UserInfo | null => {
  return getCurrentUser();
};

/**
 * 检查用户是否已认证
 */
export const isAuthenticated = (): boolean => {
  const hasToken = !!getToken();
  const hasUser = !!getCurrentUser();
  console.log('Auth check - token:', hasToken, 'user:', hasUser);
  return hasToken && hasUser;
};

/**
 * 退出登录
 */
export const logout = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  window.location.href = '/login';
};
