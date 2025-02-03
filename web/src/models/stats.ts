export interface StatsResponse {
  total?: number;
  data: {
    [key: string]: number | string;
  };
  trend?: {
    date: string;
    value: number;
  }[];
}

export interface SystemOverview {
  totalUsers: number;
  totalDevices: number;
  totalLicenses: number;
  activeAlerts: number;
}

export interface DeviceStats {
  online: number;
  offline: number;
  maintenance: number;
}

export interface LicenseStats {
  active: number;
  expired: number;
  revoked: number;
}

export interface AlertStats {
  critical: number;
  warning: number;
  info: number;
}