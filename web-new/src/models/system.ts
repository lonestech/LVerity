// 系统相关数据模型

export interface SystemLog {
  id: string;
  level: 'info' | 'warning' | 'error' | 'debug';
  source: string;
  message: string;
  details?: string;
  timestamp: string;
  userId?: string;
  username?: string;
}

export interface SystemStats {
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  uptime: number;
  activeUsers: number;
  activeDevices: number;
  operationCount: {
    today: number;
    week: number;
    month: number;
  };
  logCounts: {
    info: number;
    warning: number;
    error: number;
  };
}

export interface SystemConfig {
  id: string;
  name: string;
  value: string;
  description?: string;
  group: string;
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SystemLogQuery {
  level?: string;
  source?: string;
  keyword?: string;
  startTime?: string;
  endTime?: string;
  userId?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: string;
}

export interface BackupInfo {
  id: string;
  name: string;
  description?: string;
  type: 'manual' | 'auto' | 'scheduled';
  status: 'running' | 'completed' | 'failed';
  filePath: string;
  fileSize?: number;
  duration?: number;
  createdAt: string;
  createdBy: string;
  completedAt?: string;
}

export interface BackupConfig {
  id: string;
  autoBackup: boolean;
  backupPath: string;
  schedule: string;
  retentionCount: number;
  retentionDays: number;
  compressBackup: boolean;
  includeDatabase: boolean;
  includeFiles: boolean;
  includeLogs: boolean;
  createdAt: string;
  updatedAt: string;
}

// 更新后的SystemStatus接口，与后端API返回格式一致
export interface SystemStatus {
  status: string;
  uptime: string;
  cpuUsage: string;
  memoryUsage: string;
  diskUsage: string;
  hostname: string;
  platform: string;
  platformVersion: string;
  kernelVersion: string;
  connections: number;
  lastBackup: string;
  updates: {
    available: boolean;
    version: string;
  };
  services: Array<{
    name: string;
    status: string;
    uptime: string;
  }>;
}
