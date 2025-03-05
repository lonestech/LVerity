import { License, LicenseCreateRequest, LicenseStats, LicenseUpdateRequest } from '../models/license';
import api from './api';
import { ApiResponse, PaginatedResponse } from './device';

export const licenseService = {
  // 获取授权列表
  list: async (params: { page?: number; pageSize?: number; type?: string; status?: string; [key: string]: any }) => {
    const { data } = await api.get<ApiResponse<PaginatedResponse<License>>>('/api/licenses', { params });
    return data.data;
  },

  // 获取单个授权
  get: async (id: string) => {
    const { data } = await api.get<ApiResponse<License>>(`/api/licenses/${id}`);
    return data.data;
  },

  // 创建授权
  create: async (license: LicenseCreateRequest) => {
    const { data } = await api.post<ApiResponse<License>>('/api/licenses', license);
    return data.data;
  },

  // 更新授权
  update: async (id: string, license: LicenseUpdateRequest) => {
    const { data } = await api.put<ApiResponse<License>>(`/api/licenses/${id}`, license);
    return data.data;
  },

  // 删除授权
  delete: async (id: string) => {
    await api.delete(`/api/licenses/${id}`);
  },

  // 获取授权码详细信息
  getByCode: async (code: string) => {
    const { data } = await api.get<ApiResponse<License>>(`/api/licenses/code/${code}`);
    return data.data;
  },

  // 激活授权
  activate: async (code: string, deviceID: string) => {
    const { data } = await api.post<ApiResponse<License>>('/api/licenses/activate', { code, deviceID });
    return data.data;
  },

  // 获取授权统计信息
  getStats: async () => {
    const { data } = await api.get<ApiResponse<LicenseStats>>('/api/licenses/stats');
    return data.data;
  },

  // 批量生成授权
  batchCreate: async (params: { count: number; type: string; expireDays: number; maxDevices: number; features?: string[]; }) => {
    const { data } = await api.post<ApiResponse<License[]>>('/api/licenses/batch', params);
    return data.data;
  },

  // 导出授权
  export: async (params: { type?: string; status?: string; format?: 'csv' | 'excel' }) => {
    const { data } = await api.get('/api/licenses/export', { 
      params,
      responseType: 'blob' 
    });
    return data;
  }
};
