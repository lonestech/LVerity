import request, { ApiResponse } from '../utils/request';
import { 
  User, 
  UserRole, 
  LoginParams, 
  LoginResult, 
  ChangePasswordParams,
  UserQuery,
  UserPreferences,
  SystemInitStatus,
  InitAdminParams
} from '../models/user';

// 导出用户服务
export const userService = {
  /**
   * 用户登录
   * @param params 登录参数
   * @returns 登录结果
   */
  async login(params: LoginParams): Promise<ApiResponse<LoginResult>> {
    return request.post('/auth/login', params);
  },

  /**
   * 检查系统是否已初始化
   * @returns 系统初始化状态
   */
  checkInitStatus(): Promise<ApiResponse<SystemInitStatus>> {
    return request.get('/api/system/init-status');
  },

  /**
   * 初始化管理员账户
   * @param params 管理员参数
   * @returns 初始化结果
   */
  initializeAdmin(params: InitAdminParams): Promise<ApiResponse<LoginResult>> {
    return request.post('/api/system/init-admin', params);
  },

  /**
   * 刷新令牌
   * @returns 刷新结果
   */
  refreshToken: (): Promise<ApiResponse<{ token: string }>> => {
    return request.post('/auth/refresh');
  },

  /**
   * 获取用户列表
   * @param query 查询参数
   * @returns 用户列表
   */
  getUsers(query?: UserQuery): Promise<ApiResponse<{ total: number; items: User[] }>> {
    return request.get('/api/users', { params: query });
  },

  /**
   * 获取用户详情
   * @param id 用户ID
   * @returns 用户详情
   */
  getUserById: (id: string): Promise<ApiResponse<User>> => {
    return request.get(`/api/users/${id}`);
  },

  /**
   * 创建用户
   * @param user 用户数据
   * @returns 创建结果
   */
  createUser: (user: Partial<User>): Promise<ApiResponse<User>> => {
    return request.post('/api/users', user);
  },

  /**
   * 更新用户
   * @param id 用户ID
   * @param user 用户数据
   * @returns 更新结果
   */
  updateUser: (id: string, user: Partial<User>): Promise<ApiResponse<User>> => {
    return request.put(`/api/users/${id}`, user);
  },

  /**
   * 删除用户
   * @param id 用户ID
   * @returns 删除结果
   */
  deleteUser: (id: string): Promise<ApiResponse<void>> => {
    return request.delete(`/api/users/${id}`);
  },

  /**
   * 获取当前用户资料
   * @returns 当前用户资料
   */
  getUserProfile: (): Promise<ApiResponse<User>> => {
    return request.get('/api/user/profile');
  },

  /**
   * 更新当前用户资料
   * @param profile 用户资料
   * @returns 更新结果
   */
  updateUserProfile: (profile: Partial<User>): Promise<ApiResponse<User>> => {
    return request.post('/api/user/profile', profile);
  },

  /**
   * 修改密码
   * @param params 密码变更参数
   * @returns 修改结果
   */
  changePassword: (params: ChangePasswordParams): Promise<ApiResponse<void>> => {
    return request.post('/api/user/change-password', params);
  },

  /**
   * 获取用户角色列表
   * @returns 角色列表
   */
  getRoles: (): Promise<ApiResponse<UserRole[]>> => {
    return request.get('/api/roles');
  },

  /**
   * 获取用户偏好设置
   * @returns 用户偏好设置
   */
  getUserPreferences: (): Promise<ApiResponse<UserPreferences>> => {
    return request.get('/api/user/preferences');
  },

  /**
   * 更新用户偏好设置
   * @param preferences 偏好设置
   * @returns 更新结果
   */
  updateUserPreferences: (preferences: Partial<UserPreferences>): Promise<ApiResponse<UserPreferences>> => {
    return request.put('/api/user/preferences', preferences);
  },

 