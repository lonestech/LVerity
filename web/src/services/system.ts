import { SystemConfig, SystemStats, SystemLog } from '../models/system';
import api from './api';

export const systemService = {
  // 获取系统配置
  getConfig: async () => {
    const { data } = await api.get('/system/config');
    return data as SystemConfig[];
  },

  // 更新系统配置
  updateConfig: async (key: string, value: string) => {
    const { data } = await api.put('/system/config', { key, value });
    return data as SystemConfig;
  },

  // 获取系统统计信息
  getStats: async () => {
    const { data } = await api.get('/system/stats');
    return data as SystemStats;
  },

  // 获取系统日志
  getLogs: async (params: { current: number; pageSize: number; type?: string }) => {
    const { data } = await api.get('/system/logs', { params });
    return data as { list: SystemLog[]; total: number };
  },

  // 清理系统日志
  clearLogs: async (before: string) => {
    await api.delete('/system/logs', { params: { before } });
  },
};
