import { Device, DeviceCreateRequest, DeviceUpdateRequest } from '../models/device';
import api from './api';

export const deviceService = {
  // 获取设备列表
  list: async (params: { current: number; pageSize: number; [key: string]: any }) => {
    const { data } = await api.get('/devices', { params });
    return data;
  },

  // 获取单个设备
  get: async (id: number) => {
    const { data } = await api.get(`/devices/${id}`);
    return data as Device;
  },

  // 创建设备
  create: async (device: DeviceCreateRequest) => {
    const { data } = await api.post('/devices', device);
    return data as Device;
  },

  // 更新设备
  update: async (id: number, device: DeviceUpdateRequest) => {
    const { data } = await api.put(`/devices/${id}`, device);
    return data as Device;
  },

  // 删除设备
  delete: async (id: number) => {
    await api.delete(`/devices/${id}`);
  },

  // 获取设备状态
  getStatus: async (id: number) => {
    const { data } = await api.get(`/devices/${id}/status`);
    return data;
  },
};
