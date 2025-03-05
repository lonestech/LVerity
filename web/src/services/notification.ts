import { request } from '../utils/request';
import { Notification, NotificationQuery } from '../models/notification';
import { ApiResponse, PaginatedResponse } from '../models/common';

// 通知服务
export const notificationService = {
  /**
   * 获取通知列表
   * @param params 查询参数
   * @returns 通知列表和统计数据
   */
  getNotifications: async (params?: NotificationQuery): Promise<ApiResponse<{ total: number; items: Notification[]; unreadCount: number }>> => {
    return request.get('/api/notifications', { params });
  },

  /**
   * 获取未读通知数量
   * @returns 未读通知数量
   */
  getUnreadCount: async (): Promise<ApiResponse<{ count: number }>> => {
    return request.get('/api/notifications/unread-count');
  },

  /**
   * 将通知标记为已读
   * @param id 通知ID，如果为空则标记所有通知为已读
   * @returns 操作结果
   */
  markAsRead: async (id?: string): Promise<ApiResponse<{ success: boolean }>> => {
    return request.put('/api/notifications/read', { id });
  },

  /**
   * 删除通知
   * @param id 通知ID
   * @returns 操作结果
   */
  deleteNotification: async (id: string): Promise<ApiResponse<{ success: boolean }>> => {
    return request.delete(`/api/notifications/${id}`);
  },

  /**
   * 清空所有通知
   * @returns 操作结果
   */
  clearAllNotifications: async (): Promise<ApiResponse<{ success: boolean }>> => {
    return request.delete('/api/notifications/all');
  }
};
