import { request } from '@/utils/request';
import { StatsResponse } from '@/models/stats';

export const statsService = {
  // 获取系统概览统计数据
  getOverview: () => request.get<StatsResponse>('/api/stats/overview'),

  // 获取设备状态统计
  getDeviceStats: () => request.get<StatsResponse>('/api/stats/devices'),

  // 获取许可证状态统计
  getLicenseStats: () => request.get<StatsResponse>('/api/stats/licenses'),

  // 获取用户活跃度统计
  getUserActivityStats: (params: { days: number }) =>
    request.get<StatsResponse>('/api/stats/user-activity', { params }),

  // 获取系统告警统计
  getAlertStats: () => request.get<StatsResponse>('/api/stats/alerts'),
};