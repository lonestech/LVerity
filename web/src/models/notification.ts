// 通知类型
export type NotificationType = 'info' | 'alert' | 'update' | 'reminder';

// 通知对象
export interface Notification {
  id: string;
  title: string;
  content: string;
  type: NotificationType;
  timestamp: string;
  read: boolean;
  link?: string;
  target?: {
    type: string;
    id: string;
    name: string;
  };
}

// 通知查询参数
export interface NotificationQuery {
  read?: boolean;
  type?: NotificationType;
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
}

// 通知响应数据
export interface NotificationResponse {
  items: Notification[];
  total: number;
  unreadCount: number;
}
