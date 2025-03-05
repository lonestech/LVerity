import request from '@/utils/request';

export const statsService = {
  // 获取系统概览统计数据
  getOverview: () => request.get('/api/stats/overview'),

  // 获取设备状态统计
  getDeviceStats: () => request.get('/api/stats/devices'),

  // 获取许可证状态统计
  getLicenseStats: () => request.get('/api/licenses/stats'),

  // 获取用户活跃度统计
  getUserActivityStats: (params: { days: number }) =>
    request.get('/api/stats/user-activity', { params }),

  // 获取系统告警统计
  getAlertStats: () => request.get('/api/stats/alerts'),
};