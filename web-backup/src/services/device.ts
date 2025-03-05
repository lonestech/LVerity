import { Device, DeviceCreateRequest, DeviceLocationInfo, DeviceStats, DeviceUpdateRequest } from '../models/device';
import api from './api';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error_message?: string;
}

export interface PaginatedResponse<T> {
  list: T[];
  total: number;
}

export const deviceService = {
  // 获取设备列表
  list: async (params: { page?: number; pageSize?: number; status?: string; type?: string; [key: string]: any }) => {
    const { data } = await api.get<ApiResponse<PaginatedResponse<Device>>>('/api/devices', { params });
    return data.data;
  },

  // 获取单个设备
  get: async (id: string) => {
    const { data } = await api.get<ApiResponse<Device>>(`/api/devices/${id}`);
    return data.data;
  },

  // 创建设备
  create: async (device: DeviceCreateRequest) => {
    const { data } = await api.post<ApiResponse<Device>>('/api/devices', device);
    return data.data;
  },

  // 更新设备
  update: async (id: string, device: DeviceUpdateRequest) => {
    const { data } = await api.put<ApiResponse<Device>>(`/api/devices/${id}`, device);
    return data.data;
  },

  // 删除设备
  delete: async (id: string) => {
    await api.delete(`/api/devices/${id}`);
  },

  // 获取设备状态
  getStatus: async (id: string) => {
    const { data } = await api.get<ApiResponse<{status: string}>>(`/api/devices/${id}/status`);
    return data.data;
  },

  // 封禁设备
  block: async (id: string, reason: string) => {
    const { data } = await api.post<ApiResponse<{success: boolean}>>(`/api/devices/${id}/block`, { reason });
    return data.data;
  },

  // 获取设备位置信息
  getLocation: async (id: string) => {
    const { data } = await api.get<ApiResponse<DeviceLocationInfo>>(`/api/devices/${id}/location`);
    return data.data;
  },

  // 获取设备统计信息
  getStats: async () => {
    const { data } = await api.get<ApiResponse<DeviceStats>>('/api/devices/stats');
    return data.data;
  },

  // 获取设备使用报告
  getUsageReport: async (id: string, params: { startDate: string; endDate: string }) => {
    const { data } = await api.get<ApiResponse<any>>(`/api/devices/${id}/usage-report`, { params });
    return data.data;
  },

  // 更新设备元数据
  updateMetadata: async (id: string, metadata: any) => {
    const { data } = await api.put<ApiResponse<{success: boolean}>>(`/api/devices/${id}/metadata`, { metadata: JSON.stringify(metadata) });
    return data.data;
  }
};
