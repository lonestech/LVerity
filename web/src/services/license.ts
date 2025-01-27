import { get, post, put, del } from '@/utils/request';

// 获取授权列表
export async function getLicenseList(params: API.PageParams & Record<string, any>) {
  return get<API.PageResult<API.License>>('/licenses', params);
}

// 获取授权详情
export async function getLicenseDetail(id: string) {
  return get<API.License>(`/licenses/${id}`);
}

// 创建授权
export async function createLicense(data: Partial<API.License>) {
  return post<API.License>('/licenses', data);
}

// 更新授权
export async function updateLicense(id: string, data: Partial<API.License>) {
  return put<API.License>(`/licenses/${id}`, data);
}

// 删除授权
export async function deleteLicense(id: string) {
  return del(`/licenses/${id}`);
}

// 激活授权
export async function activateLicense(id: string, deviceId: string) {
  return post<API.License>(`/licenses/${id}/activate`, { device_id: deviceId });
}

// 停用授权
export async function deactivateLicense(id: string) {
  return post<API.License>(`/licenses/${id}/deactivate`);
}

// 续期授权
export async function renewLicense(id: string, expiryDate: string) {
  return post<API.License>(`/licenses/${id}/renew`, { expiry_date: expiryDate });
}

// 导出授权列表
export async function exportLicenses(params: Record<string, any>) {
  return get('/licenses/export', params);
}

// 导入授权列表
export async function importLicenses(data: FormData) {
  return post('/licenses/import', data);
}

// 获取授权统计信息
export async function getLicenseStats() {
  return get<{
    total: number;
    active: number;
    expired: number;
    inactive: number;
  }>('/licenses/stats');
}
