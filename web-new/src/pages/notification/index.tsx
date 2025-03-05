import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Tabs, 
  List, 
  Badge, 
  Typography, 
  Button, 
  Space, 
  Tooltip, 
  Tag, 
  Dropdown, 
  Menu, 
  Empty, 
  Popconfirm, 
  message,
  Alert,
  Radio,
  Divider
} from 'antd';
import { 
  BellOutlined, 
  CheckOutlined, 
  DeleteOutlined, 
  FilterOutlined, 
  ReloadOutlined, 
  EyeOutlined, 
  MailOutlined, 
  WarningOutlined, 
  InfoCircleOutlined, 
  SyncOutlined,
  ClockCircleOutlined,
  DownOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import PageContainer from '../../components/PageContainer';
import { notificationService } from '../../services/notification';
import { Notification } from '../../models/notification';
import { formatDateTime, formatTimeAgo } from '../../utils/utils';

const { Text, Title } = Typography;
const { TabPane } = Tabs;

const NotificationCenter: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [filter, setFilter] = useState<string>('all');
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const navigate = useNavigate();

  // 加载通知数据
  const loadNotifications = async (tabKey: string = activeTab, filterType: string = filter) => {
    setLoading(true);
    try {
      const params: any = {};
      if (tabKey === 'unread') {
        params.read = false;
      } else if (tabKey === 'read') {
        params.read = true;
      }
      
      if (filterType !== 'all') {
        params.type = filterType;
      }
      
      const response = await notificationService.getNotifications(params);
      if (response.success) {
        setNotifications(response.data.items);
        setUnreadCount(response.data.unreadCount);
      } else {
        message.error(response.message || '加载通知失败');
      }
    } catch (error) {
      console.error('加载通知失败:', error);
      message.error('加载通知失败');
    } finally {
      setLoading(false);
    }
  };

  // 组件加载时获取数据
  useEffect(() => {
    loadNotifications();
  }, []);

  // 刷新通知
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  };

  // 标记为已读
  const handleMarkAsRead = async (id: string) => {
    try {
      const response = await notificationService.markAsRead(id);
      if (response.success) {
        // 更新本地数据
        setNotifications(prevNotifications =>
          prevNotifications.map(notification =>
            notification.id === id
              ? { ...notification, read: true }
              : notification
          )
        );
        
        // 更新未读计数
        setUnreadCount(prev => Math.max(0, prev - 1));
      } else {
        message.error(response.message || '标记已读失败');
      }
    } catch (error) {
      console.error('标记已读失败:', error);
      message.error('标记已读失败');
    }
  };

  // 全部标记为已读
  const handleMarkAllAsRead = async () => {
    try {
      const response = await notificationService.markAllAsRead();
      if (response.success) {
        // 更新本地数据
        setNotifications(prevNotifications =>
          prevNotifications.map(notification => ({ ...notification, read: true }))
        );
        
        // 更新未读计数
        setUnreadCount(0);
        
        message.success('所有通知已标记为已读');
      } else {
        message.error(response.message || '标记全部已读失败');
      }
    } catch (error) {
      console.error('标记全部已读失败:', error);
      message.error('标记全部已读失败');
    }
  };

  // 删除通知
  const handleDelete = async (id: string) => {
    try {
      const response = await notificationService.deleteNotification(id);
      if (response.success) {
        // 更新本地数据
        const updatedNotifications = notifications.filter(notification => notification.id !== id);
        setNotifications(updatedNotifications);
        
        // 如果删除的是未读通知，更新未读计数
        const deletedNotification = notifications.find(notification => notification.id === id);
        if (deletedNotification && !deletedNotification.read) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
        
        message.success('通知已删除');
      } else {
        message.error(response.message || '删除通知失败');
      }
    } catch (error) {
      console.error('删除通知失败:', error);
      message.error('删除通知失败');
    }
  };

  // 删除所有通知
  const handleDeleteAll = async () => {
    try {
      const response = await notificationService.deleteAllNotifications();
      if (response.success) {
        setNotifications([]);
        setUnreadCount(0);
        message.success('所有通知已删除');
      } else {
        message.error(response.message || '删除所有通知失败');
      }
    } catch (error) {
      console.error('删除所有通知失败:', error);
      message.error('删除所有通知失败');
    }
  };

  // 处理通知点击
  const handleNotificationClick = (notification: Notification) => {
    // 如果未读，标记为已读
    if (!notification.read) {
      handleMarkAsRead(notification.id);
    }
    
    // 如果有相关链接，导航到相关页面
    if (notification.link) {
      navigate(notification.link);
    }
  };

  // 处理标签页切换
  const handleTabChange = (key: string) => {
    setActiveTab(key);
    loadNotifications(key, filter);
  };

  // 处理筛选器变更
  const handleFilterChange = (e: any) => {
    const value = e.target.value;
    setFilter(value);
    loadNotifications(activeTab, value);
  };

  // 获取通知图标
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'alert':
        return <WarningOutlined style={{ color: '#ff4d4f' }} />;
      case 'info':
        return <InfoCircleOutlined style={{ color: '#1890ff' }} />;
      case 'update':
        return <SyncOutlined style={{ color: '#52c41a' }} />;
      case 'reminder':
        return <ClockCircleOutlined style={{ color: '#faad14' }} />;
      default:
        return <BellOutlined />;
    }
  };

  // 获取通知背景色
  const getNotificationBackground = (notification: Notification) => {
    if (!notification.read) {
      return 'rgba(24, 144, 255, 0.05)';
    }
    return 'transparent';
  };

  return (
    <PageContainer 
      title="通知中心" 
      loading={loading}
      extra={
        <Space>
          <Radio.Group 
            value={filter} 
            onChange={handleFilterChange}
            buttonStyle="solid"
            optionType="button"
          >
            <Radio.Button value="all">全部</Radio.Button>
            <Radio.Button value="alert">警报</Radio.Button>
            <Radio.Button value="info">信息</Radio.Button>
            <Radio.Button value="update">更新</Radio.Button>
            <Radio.Button value="reminder">提醒</Radio.Button>
          </Radio.Group>
          <Button 
            icon={<ReloadOutlined />} 
            onClick={handleRefresh}
            loading={refreshing}
          >
            刷新
          </Button>
          <Popconfirm
            title="确定要清空所有通知？"
            onConfirm={handleDeleteAll}
            okText="确定"
            cancelText="取消"
            okButtonProps={{ danger: true }}
          >
            <Button danger icon={<DeleteOutlined />}>
              清空通知
            </Button>
          </Popconfirm>
        </Space>
      }
    >
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <Title level={4}>
            <BellOutlined /> 通知中心
            {unreadCount > 0 && (
              <Badge 
                count={unreadCount} 
                style={{ marginLeft: 8, backgroundColor: '#1890ff' }} 
              />
            )}
          </Title>
          {unreadCount > 0 && (
            <Button 
              type="link" 
              icon={<CheckOutlined />} 
              onClick={handleMarkAllAsRead}
            >
              全部标记为已读
            </Button>
          )}
        </div>

        <Tabs
          activeKey={activeTab}
          onChange={handleTabChange}
          items={[
            {
              key: 'all',
              label: (
                <span>
                  <span>全部</span>
                </span>
              )
            },
            {
              key: 'unread',
              label: (
                <span>
                  <span>未读</span>
                  {unreadCount > 0 && (
                    <Badge 
                      count={unreadCount} 
                      style={{ marginLeft: 8, backgroundColor: '#1890ff' }} 
                    />
                  )}
                </span>
              )
            },
            {
              key: 'read',
              label: (
                <span>
                  <span>已读</span>
                </span>
              )
            }
          ]}
        />

        {notifications.length === 0 ? (
          <Empty 
            description="暂无通知" 
            image={Empty.PRESENTED_IMAGE_SIMPLE} 
          />
        ) : (
          <List
            itemLayout="horizontal"
            dataSource={notifications}
            renderItem={item => (
              <List.Item
                style={{ 
                  padding: '12px 24px', 
                  backgroundColor: getNotificationBackground(item),
                  cursor: 'pointer'
                }}
                actions={[
                  <Space>
                    {!item.read && (
                      <Tooltip title="标记为已读">
                        <Button 
                          type="text" 
                          icon={<CheckOutlined />} 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMarkAsRead(item.id);
                          }} 
                        />
                      </Tooltip>
                    )}
                    <Tooltip title="删除">
                      <Button 
                        type="text" 
                        danger 
                        icon={<DeleteOutlined />} 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(item.id);
                        }} 
                      />
                    </Tooltip>
                  </Space>,
                ]}
                onClick={() => handleNotificationClick(item)}
              >
                <List.Item.Meta
                  avatar={getNotificationIcon(item.type)}
                  title={
                    <Space>
                      <Text strong={!item.read}>{item.title}</Text>
                      {!item.read && (
                        <Badge 
                          dot 
                          style={{ 
                            backgroundColor: '#1890ff', 
                            marginLeft: 4, 
                            marginRight: 0 
                          }} 
                        />
                      )}
                      <Tag color={
                        item.type === 'alert' ? 'red' : 
                        item.type === 'info' ? 'blue' : 
                        item.type === 'update' ? 'green' : 
                        item.type === 'reminder' ? 'orange' : 
                        'default'
                      }>
                        {
                          item.type === 'alert' ? '警报' : 
                          item.type === 'info' ? '信息' : 
                          item.type === 'update' ? '更新' : 
                          item.type === 'reminder' ? '提醒' : 
                          '通知'
                        }
                      </Tag>
                    </Space>
                  }
                  description={
                    <div>
                      <div style={{ marginBottom: 4 }}>{item.content}</div>
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        {formatTimeAgo(item.timestamp)}
                      </Text>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </Card>
    </PageContainer>
  );
};

export default NotificationCenter;
