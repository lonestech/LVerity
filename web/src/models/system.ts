export interface SystemConfig {
  id: number;
  key: string;
  value: string;
  description: string;
  updatedAt: string;
}

export interface SystemStats {
  totalDevices: number;
  activeDevices: number;
  totalLicenses: number;
  activeLicenses: number;
  expiringLicenses: number; // 即将过期的许可证数量
}

export interface SystemLog {
  id: number;
  type: 'info' | 'warning' | 'error';
  message: string;
  timestamp: string;
  userId?: number;
  deviceId?: number;
}
