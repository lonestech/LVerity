// 用户相关数据模型

export interface User {
  id: string;
  username: string;
  email?: string;
  name?: string;
  roleId: string;
  roleName?: string;
  status: string;
  lastLogin?: string;
  createdAt: string;
  updatedAt?: string;
  preferences?: UserPreferences;
  notifications?: UserNotificationSettings;
  phone?: string;
  lastLoginAt?: string;
  isAdmin?: boolean;
}

export interface UserRole {
  id: string;
  name: string;
  description?: string;
  permissions?: string[];
}

export interface LoginParams {
  username: string;
  password: string;
}

export interface LoginResult {
  token: string;
  user: {
    id: string;
    username: string;
    name?: string;
    role: string;
    permissions?: string[];
  };
}

export interface ChangePasswordParams {
  oldPassword: string;
  newPassword: string;
}

export interface UserQuery {
  keyword?: string;
  roleId?: string;
  status?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: string;
}

export interface UserPreferences {
  theme?: 'light' | 'dark' | 'system';
  language?: string;
  compactMode?: boolean;
  showToolbar?: boolean;
  sidebarCollapsed?: boolean;
  dashboardLayout?: 'default' | 'compact' | 'expanded' | 'custom';
}

export interface UserNotificationSettings {
  email?: boolean;
  push?: boolean;
  types?: string[];
}

// 系统初始化相关模型
export interface InitAdminParams {
  username: string;
  password: string;
  confirmPassword: string;
  email?: string;
  name?: string;
}

export interface SystemInitStatus {
  initialized: boolean;
  hasAdmin: boolean;
  systemConfigured: boolean;
}
