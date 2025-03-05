// 统计信息相关数据模型

export interface DeviceStatistics {
  total: number;
  active: number;
  inactive: number;
  byType: {
    type: string;
    count: number;
  }[];
  byStatus: {
    status: string;
    count: number;
  }[];
  recentActivations: {
    date: string;
    count: number;
  }[];
}

export interface UserStatistics {
  total: number;
  active: number;
  byRole: {
    roleId: string;
    roleName: string;
    count: number;
  }[];
  recentLogins: {
    date: string;
    count: number;
  }[];
}

export interface OverviewStatistics {
  totalLicenses: number;
  activeLicenses: number;
  expiringLicenses: number;
  totalDevices: number;
  activeDevices: number;
  totalUsers: number;
  activeUsers: number;
  systemHealth: {
    status: string;
    cpuUsage: number;
    memoryUsage: number;
    diskUsage: number;
  };
}

export interface TimeRange {
  startDate: string;
  endDate: string;
}
