import request, { ApiResponse } from '../utils/request';
import { 
  DeviceStatistics, 
  UserStatistics, 
  OverviewStatistics,
  TimeRange
} from '../models/stats';

// 定义活动类型接口
export interface Activity {
  id: string;
  type: string;
  action: string;
  targetId?: string;
  targetName?: string;
  userId?: string;
  username?: string;
  timestamp: string;
  details?: string;
}

// 模拟活动数据
const mockActivities: Activity[] = [
  {
    id: '1',
    type: 'license',
    action: 'create',
    targetId: 'lic-123',
    targetName: '授权密钥-XX企业',
    userId: 'user1',
    username: '管理员',
    timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
    details: '创建了新的授权密钥'
  },
  {
    id: '2',
    type: 'device',
    action: 'update',
    targetId: 'dev-456',
    targetName: '服务器设备-01',
    userId: 'user1',
    username: '管理员',
    timestamp: new Date(Date.now() - 10 * 60000).toISOString(),
    details: '更新了设备信息'
  },
  {
    id: '3',
    type: 'user',
    action: 'login',
    userId: 'user2',
    username: '操作员',
    timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
    details: '用户登录系统'
  },
  {
    id: '4',
    type: 'system',
    action: 'backup',
    targetId: 'backup-789',
    targetName: '系统备份-20250304',
    userId: 'user1',
    username: '管理员',
    timestamp: new Date(Date.now() - 30 * 60000).toISOString(),
    details: '创建了系统备份'
  },
  {
    id: '5',
    type: 'license',
    action: 'activate',
    targetId: 'lic-234',
    targetName: '授权密钥-YY企业',
    userId: 'user3',
    username: '销售',
    timestamp: new Date(Date.now() - 45 * 60000).toISOString(),
    details: '激活了授权密钥'
  },
  {
    id: '6',
    type: 'device',
    action: 'offline',
    targetId: 'dev-567',
    targetName: '客户端设备-02',
    timestamp: new Date(Date.now() - 60 * 60000).toISOString(),
    details: '设备离线'
  },
  {
    id: '7',
    type: 'user',
    action: 'create',
    targetId: 'user4',
    targetName: '新用户',
    userId: 'user1',
    username: '管理员',
    timestamp: new Date(Date.now() - 120 * 60000).toISOString(),
    details: '创建了新用户'
  },
  {
    id: '8',
    type: 'system',
    action: 'config',
    userId: 'user1',
    username: '管理员',
    timestamp: new Date(Date.now() - 180 * 60000).toISOString(),
    details: '修改了系统配置'
  },
  {
    id: '9',
    type: 'license',
    action: 'expire',
    targetId: 'lic-345',
    targetName: '授权密钥-ZZ企业',
    timestamp: new Date(Date.now() - 240 * 60000).toISOString(),
    details: '授权密钥过期'
  },
  {
    id: '10',
    type: 'device',
    action: 'online',
    targetId: 'dev-678',
    targetName: '客户端设备-03',
    timestamp: new Date(Date.now() - 300 * 60000).toISOString(),
    details: '设备上线'
  }
];

// 统计服务
export const statsService = {
  /**
   * 获取设备统计信息
   * @param range 时间范围
   * @returns 设备统计信息
   */
  getDeviceStatistics: (range?: TimeRange): Promise<ApiResponse<DeviceStatistics>> => {
    return request.get('/api/stats/devices', { params: range });
  },

  /**
   * 获取用户统计信息
   * @param range 时间范围
   * @returns 用户统计信息
   */
  getUserStatistics: (range?: TimeRange): Promise<ApiResponse<UserStatistics>> => {
    return request.get('/api/stats/users', { params: range });
  },

  /**
   * 获取概览统计信息
   * @returns 概览统计信息
   */
  getOverviewStatistics: (): Promise<ApiResponse<OverviewStatistics>> => {
    return request.get('/api/stats/overview');
  },

  /**
   * 获取趋势数据
   * @param type 数据类型
   * @param range 时间范围
   * @returns 趋势数据
   */
  getTrendData: (
    type: 'devices' | 'licenses' | 'users', 
    range: TimeRange
  ): Promise<ApiResponse<{
    categories: string[];
    series: {
      name: string;
      data: number[];
    }[];
  }>> => {
    return request.get(`/api/stats/trends/${type}`, { params: range });
  },

  /**
   * 获取实时活动
   * @param limit 限制数量
   * @returns 实时活动列表
   */
  getRecentActivities: async (limit = 10): Promise<ApiResponse<Activity[]>> => {
    if (process.env.NODE_ENV === 'development') {
      console.log('开发环境使用模拟活动数据');
      // 直接返回模拟数据而不调用API
      return {
        success: true,
        code: 200,
        message: 'success',
        data: mockActivities.slice(0, limit)
      };
    }
    
    try {
      return await request.get('/api/stats/activities', { params: { limit } });
    } catch (error: any) {
      console.error('Failed to get activities:', error);
      throw error;
    }
  }
};
