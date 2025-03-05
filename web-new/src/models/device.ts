// 设备相关数据模型

export interface Device {
  id: string;
  deviceId: string;
  name: string;
  hardwareId: string;
  type: string;
  model?: string;
  ipAddress?: string;
  macAddress?: string;
  status: string;
  licenseId?: string;
  registeredAt: string;
  lastActiveAt?: string;
  firmwareVersion?: string;
  osVersion?: string;
  location?: string;
  description?: string;
  sortBy?: string;
  sortOrder?: string;
}

export interface DeviceStatus {
  deviceId: string;
  status: string;
  cpu?: number;
  memory?: number;
  disk?: number;
  network?: {
    up: number;
    down: number;
  };
  temperature?: number;
  uptime?: number;
  lastUpdated: string;
}

export interface DeviceMonitorStatus {
  id: string;
  deviceId: string;
  resourceUsage: {
    cpu: number;
    memory: number;
    disk: number;
  };
  health: string;
  alerts: number;
  lastUpdated: string;
}

export interface DeviceRisk {
  id: string;
  deviceId: string;
  score: number;
  level: 'low' | 'medium' | 'high' | 'critical';
  factors: {
    name: string;
    score: number;
    description: string;
  }[];
  lastUpdated: string;
}

export interface DeviceQuery {
  keyword?: string;
  type?: string;
  status?: string;
  licenseId?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: string;
}

export interface DeviceAnalysis {
  deviceId: string;
  behaviorPatterns: {
    name: string;
    severity: string;
    confidence: number;
    description: string;
  }[];
  recommendations: string[];
  lastUpdated: string;
}
