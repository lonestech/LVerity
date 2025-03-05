export interface User {
  id: string;
  username: string;
  roleID: string;
  status: 'active' | 'inactive' | 'blocked';
  lastLogin: string;
  createTime: string;
  updateTime: string;
  mfaEnabled: boolean;
}

export interface Role {
  id: string;
  name: string;
  type: 'admin' | 'operator' | 'viewer';
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface Permission {
  id: string;
  resource: string;
  action: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserCreateRequest {
  username: string;
  password: string;
  roleID: string;
  status?: 'active' | 'inactive' | 'blocked';
}

export interface UserUpdateRequest {
  username?: string;
  password?: string;
  roleID?: string;
  status?: 'active' | 'inactive' | 'blocked';
  mfaEnabled?: boolean;
}

export interface LoginRequest {
  username: string;
  password: string;
  captcha?: string;
  captchaId?: string;
}

export interface LoginResponse {
  token: string;
  user: User;
  expires: number;
}
