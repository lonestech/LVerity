import { License, LicenseCreateRequest, LicenseUpdateRequest } from '../models/license';
import api from './api';

export const licenseService = {
  // 获取许可证列表
  list: async (params: { current: number; pageSize: number; [key: string]: any }) => {
    const { data } = await api.get('/licenses', { params });
    return data;
  },

  // 获取单个许可证
  get: async (id: number) => {
    const { data } = await api.get(`/licenses/${id}`);
    return data as License;
  },

  // 创建许可证
  create: async (license: LicenseCreateRequest) => {
    const { data } = await api.post('/licenses', license);
    return data as License;
  },

  // 更新许可证
  update: async (id: number, license: LicenseUpdateRequest) => {
    const { data } = await api.put(`/licenses/${id}`, license);
    return data as License;
  },

  // 吊销许可证
  revoke: async (id: number) => {
    const { data } = await api.post(`/licenses/${id}/revoke`);
    return data as License;
  },

  // 验证许可证
  verify: async (licenseKey: string) => {
    const { data } = await api.post('/licenses/verify', { licenseKey });
    return data;
  },
};
