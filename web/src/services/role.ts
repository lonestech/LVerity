import { get, post, put, del } from '@/utils/request';

// 获取角色列表
export async function getRoleList(params: API.PageParams & Record<string, any>) {
  return get<API.PageResult<API.Role>>('/roles', params);
}

// 获取角色详情
export async function getRoleDetail(id: string) {
  return get<API.Role>(`/roles/${id}`);
}

// 创建角色
export async function createRole(data: Partial<API.Role>) {
  return post<API.Role>('/roles', data);
}

// 更新角色
export async function updateRole(id: string, data: Partial<API.Role>) {
  return put<API.Role>(`/roles/${id}`, data);
}

// 删除角色
export async function deleteRole(id: string) {
  return del(`/roles/${id}`);
}

// 获取角色权限
export async function getRolePermissions(id: string) {
  return get<API.Permission[]>(`/roles/${id}/permissions`);
}

// 更新角色权限
export async function updateRolePermissions(id: string, permissionIds: string[]) {
  return put(`/roles/${id}/permissions`, { permission_ids: permissionIds });
}

// 获取所有权限列表
export async function getAllPermissions() {
  return get<API.Permission[]>('/permissions');
}

// 获取角色用户列表
export async function getRoleUsers(id: string, params: API.PageParams) {
  return get<API.PageResult<API.User>>(`/roles/${id}/users`, params);
}

// 添加用户到角色
export async function addUsersToRole(id: string, userIds: string[]) {
  return post(`/roles/${id}/users`, { user_ids: userIds });
}

// 从角色移除用户
export async function removeUsersFromRole(id: string, userIds: string[]) {
  return del(`/roles/${id}/users`, { user_ids: userIds });
}

// 获取角色统计信息
export async function getRoleStats() {
  return get<{
    total: number;
    admin: number;
    operator: number;
    viewer: number;
  }>('/roles/stats');
}
