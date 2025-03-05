import { request } from '../utils/request';
import { BackupConfig, BackupInfo, SystemConfig, SystemLog, SystemLogQuery, SystemStatus } from '../models/system';
import { ApiResponse } from '../models/common';

// 系统服务
export const systemService = {
  // 获取系统日志
  getSystemLogs: async (params: SystemLogQuery): Promise<ApiResponse<{ total: number; items: SystemLog[] }>> => {
    const response = await request.get('/api/system/logs', { params });
    
    // 确保返回数据符合ProTable期望的格式
    if (response.success && response.data) {
      // 如果后端返回的是list而不是items，进行转换
      if (response.data.list && !response.data.items) {
        return {
          ...response,
          data: {
            total: response.data.total || 0,
            items: Array.isArray(response.data.list) ? response.data.list : []
          }
        };
      }
      
      // 确保items是数组
      if (!response.data.items) {
        return {
          ...response,
          data: {
            total: response.data.total || 0,
            items: []
          }
        };
      }
      
      // 确保total存在
      if (response.data.total === undefined) {
        return {
          ...response,
          data: {
            ...response.data,
            total: Array.isArray(response.data.items) ? response.data.items.length : 0
          }
        };
      }
    }
    
    return response;
  },
  
  // 旧函数名保留，以兼容现有代码
  getLogs: async (params: any = {}): Promise<ApiResponse<{ list: SystemLog[]; total: number; pageSize: number; current: number }>> => {
    return request.get('/api/system/logs', { params });
  },
  
  // 清除系统日志
  clearLogs: async (type: string = 'all'): Promise<ApiResponse<any>> => {
    return request.post('/api/system/logs/clear', { type });
  },
  
  // 导出系统日志
  exportLogs: async (params: SystemLogQuery): Promise<ApiResponse<any>> => {
    const query = new URLSearchParams();
    
    // 添加所有参数到URL查询字符串
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          query.append(key, String(value));
        }
      });
    }
    
    // 打开一个新窗口下载导出的日志
    window.open(`/api/system/logs/export?${query.toString()}`, '_blank');
    return { success: true, data: null };
  },
  
  // 批量删除日志
  batchDeleteLogs: async (ids: string[]): Promise<ApiResponse<{ success: number; failed: number }>> => {
    return request.post('/api/system/logs/batch-delete', { ids });
  },
  
  // 获取日志级别配置
  getLogConfig: async (): Promise<ApiResponse<{ levels: string[]; sources: string[] }>> => {
    return request.get('/api/system/logs/config');
  },
  
  // 更新日志级别配置
  updateLogConfig: async (config: { levels?: string[]; sources?: string[] }): Promise<ApiResponse<any>> => {
    return request.put('/api/system/logs/config', config);
  },
  
  // 获取系统状态
  getStatus: async (): Promise<ApiResponse<SystemStatus>> => {
    return request.get('/api/system/status');
  },
  
  // 获取系统状态 - 别名，以保持与调用代码的一致性
  getSystemStatus: async (): Promise<ApiResponse<SystemStatus>> => {
    return systemService.getStatus();
  },
  
  // 获取备份列表
  getBackups: async (): Promise<ApiResponse<BackupInfo[]>> => {
    return request.get('/api/system/backups');
  },
  
  // 创建备份
  createBackup: async (data: { name: string; description?: string; type?: string }): Promise<ApiResponse<BackupInfo>> => {
    return request.post('/api/system/backups', data);
  },
  
  // 获取备份详情
  getBackupById: async (id: string): Promise<ApiResponse<BackupInfo>> => {
    return request.get(`/api/system/backups/${id}`);
  },
  
  // 删除备份
  deleteBackup: async (id: string): Promise<ApiResponse<void>> => {
    return request.delete(`/api/system/backups/${id}`);
  },
  
  // 下载备份
  downloadBackup: async (id: string): Promise<ApiResponse<any>> => {
    // 打开一个新窗口来下载文件
    window.open(`/api/system/backups/${id}/download`, '_blank');
    return { success: true, data: null };
  },
  
  // 恢复备份
  restoreBackup: async (id: string): Promise<ApiResponse<any>> => {
    return request.post(`/api/system/backups/${id}/restore`);
  },
  
  // 获取备份配置
  getBackupConfig: async (): Promise<ApiResponse<BackupConfig>> => {
    return request.get('/api/system/backups/config');
  },
  
  // 更新备份配置
  updateBackupConfig: async (config: Partial<BackupConfig>): Promise<ApiResponse<BackupConfig>> => {
    return request.put('/api/system/backups/config', config);
  },
  
  // 获取系统配置
  getSystemConfigs: async (group?: string): Promise<ApiResponse<SystemConfig[]>> => {
    return request.get('/api/system/config', { params: { group } });
  },
  
  // 为了兼容旧代码，保留原来的方法名
  getSystemConfig: async (): Promise<ApiResponse<SystemConfig[]>> => {
    return systemServ