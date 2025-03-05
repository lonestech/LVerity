import { SystemConfig, SystemStats, SystemLog } from '../models/system';
import api from './api';
import request from '@/utils/request';

export interface SystemSettings {
  theme: 'light' | 'dark' | 'system';
  language: string;
  notifications: boolean;
  autoUpdate: boolean;
}

export const systemService = {
  // 获取系统配置
  getConfig: async () => {
    const { data } = await api.get('/api/system/config');
    return data as SystemConfig[];
  },

  // 更新系统配置
  updateConfig: async (key: string, value: string) => {
    const { data } = await api.put('/api/system/config', { key, value });
    return data as SystemConfig;
  },

  // 获取系统统计信息
  getStats: async () => {
    const { data } = await api.get('/api/system/stats');
    return data as SystemStats;
  },

  // 获取系统日志
  getLogs: async (params: { current: number; pageSize: number; type?: string }) => {
    const { data } = await api.get('/api/system/logs', { params });
    return data as { list: SystemLog[]; total: number };
  },

  // 清理系统日志
  clearLogs: async (before: string) => {
    await api.delete('/api/system/logs', { params: { before } });
  },

  // 获取系统设置
  getSettings: () => {
    return request.get('/api/system/settings');
  },

  // 更新系统设置
  updateSettings: (settings: SystemSettings) => {
    return request.put('/api/system/settings', settings);
  },

  // 获取系统信息
  getSystemInfo: () => {
    return request.get('/api/system/info');
  },

  // 获取系统日志
  getSystemLogs: (params: { startTime?: string; endTime?: string; level?: string; limit?: number }) => {
    return request.get('/api/system/logs', { params });
  },

  // 重启系统服务
  restartService: () => {
    return request.post('/api/system/restart');
  },
  
  // 检查更新
  checkUpdate: () => {
    return request.get('/api/system/check-update');
  },
  
  // 执行更新
  performUpdate: () => {
    return request.post('/api/system/update');
  }
};
