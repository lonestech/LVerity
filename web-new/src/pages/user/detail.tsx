import React, { useEffect, useState } from 'react';
import { 
  Card, 
  Descriptions, 
  Button, 
  Space, 
  Tabs, 
  Table, 
  Typography, 
  Tooltip, 
  Avatar, 
  Row, 
  Col, 
  message 
} from 'antd';
import { 
  UserOutlined, 
  EditOutlined, 
  LockOutlined, 
  DeleteOutlined, 
  HistoryOutlined,
  ClockCircleOutlined,
  KeyOutlined
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import PageContainer from '../../components/PageContainer';
import StatusTag from '../../components/StatusTag';
import { userService } from '../../services/user';
import { User } from '../../models/user';
import { formatDateTime } from '../../utils/utils';

const { Text, Title } = Typography;
const { TabPane } = Tabs;

interface UserActivity {
  id: string;
  type: string;
  description: string;
  timestamp: string;
  details?: string;
}

const UserDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [activeTab, setActiveTab] = useState<string>('basic');

  // 加载用户数据
  const loadUserData = async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      const response = await userService.getUserById(id);
      if (response.success) {
        setUser(response.data);
      } else {
        message.error(response.message || '加载用户信息失败');
      }
    } catch (error) {
      console.error('加载用户信息失败:', error);
      message.error('加载用户信息失败');
    } finally {
      setLoading(false);
    }
  };

  // 加载用户活动
  const loadUserActivities = async () => {
    if (!id) return;
    
    try {
      const response = await userService.getUserActivities(id);
      if (response.success) {
        setActivities(response.data);
      }
    } catch (error) {
      console.error('加载用户活动失败:', error);
    }
  };

  // 组件加载时获取数据
  useEffect(() => {
    loadUserData();
    loadUserActivities();
  }, [id]);

  // 处理标签页切换
  const handleTabChange = (key: string) => {
    setActiveTab(key);
  };

  // 活动图标
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'login':
        return <KeyOutlined style={{ color: '#1890ff' }} />;
      case 'password_change':
        return <LockOutlined style={{ color: '#52c41a' }} />;
      case 'profile_update':
        return <EditOutlined style={{ color: '#faad14' }} />;
      case 'role_change':
        return <UserOutlined style={{ color: '#722ed1' }} />;
      default:
        return <ClockCircleOutlined style={{ color: '#8c8c8c' }} />;
    }
  };

  // 活动列配置
  const activityColumns = [
    {
      title: '类型',
      key: 'type',
      width: 120,
      render: (_, record: UserActivity) => (
        <Space>
          {getActivityIcon(record.type)}
          <span>{
            record.type === 'login' ? '登录' :
            record.type === 'password_change' ? '密码修改' :
            record.type === 'profile_update' ? '资料更新' :
            record.type === 'role_change' ? '角色变更' :
            record.type
          }</span>
        </Space>
      ),
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: { showTitle: false },
      render: (description: string) => (
        <Tooltip title={description}>
          <span>{description}</span>
        </Tooltip>
      ),
    },
    {
      title: '时间',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 180,
      render: (date: string) => formatDateTime(date),
    },
  ];

  return (
    <PageContainer 
      title="用户详情" 
      loading={loading}
      backPath="/user"
      extra={
        <Space>
          <Button 
            type="primary" 
            icon={<EditOutlined />} 
            onClick={() => navigate(`/user/edit/${id}`)}
          >
            编辑用户
          </Button>
          <Button 
            icon={<LockOutlined />} 
            onClick={() => navigate(`/user/reset-password/${id}`)}
          >
            重置密码
          </Button>
        </Space>
      }
    >
      {user && (
        <>
          <Card style={{ marginBottom: 16 }}>
            <Row gutter={16} align="middle">
              <Col xs={24} sm={6} md={4} lg={3} xl={2} style={{ textAlign: 'center' }}>
                <Avatar 
                  size={80} 
                  icon={<UserOutlined />} 
                  style={{ 
                    backgroundColor: user.status === 'active' ? '#1890ff' : '#d9d9d9',
                  }}
                />
              </Col>
              <Col xs={24} sm={18} md={20} lg={21} xl={22}>
                <Title level={4} style={{ marginBottom: 8 }}>
                  {user.username}
                  <StatusTag status={user.status} style={{ marginLeft: 8 }} />
                </Title>
                <Space size="large">
                  {user.name && (
                    <Text>姓名: {user.name}</Text>
                  )}
                  <Text>角色: {user.roleName || '未知角色'}</Text>
                  {user.email && (
                    <Text>邮箱: {user.email}</Text>
                  )}
                </Space>
              </Col>
            </Row>
          </Card>

          <Card>
            <Tabs 
              activeKey={activeTab} 
              onChange={handleTabChange}
              items={[
                {
                  key: 'basic',
                  label: (
                    <span>
                      <UserOutlined />
                      基本信息
                    </span>
                  ),
                  children: (
                    <Descriptions bordered column={{ xs: 1, sm: 2, md: 3 }}>
                      <Descriptions.Item label="用户ID">{user.id}</Descriptions.Item>
                      <Descriptions.Item label="用户名">{user.username}</Descriptions.Item>
                      <Descriptions.Item label="姓名">{user.name || '-'}</Descriptions.Item>
                      <Descriptions.Item label="角色">{user.roleName || '-'}</Descriptions.Item>
                      <Descriptions.Item label="状态">
                        <StatusTag status={user.status} />
                      </Descriptions.Item>
                      <Descriptions.Item label="邮箱">{user.email || '-'}</Descriptions.Item>
                      <Descriptions.Item label="上次登录时间">
                        {user.lastLogin ? formatDateTime(user.lastLogin) : '-'}
                      </Descriptions.Item>
                      <Descriptions.Item label="创建时间">
                        {formatDateTime(user.createdAt)}
                      </Descriptions.Item>
                      <Descriptions.Item label="更新时间">
                        {user.updatedAt ? formatDateTime(user.updatedAt) : '-'}
                      </Descriptions.Item>
                    </Descriptions>
                  )
                },
                {
                  key: 'activity',
                  label: (
                    <span>
                      <HistoryOutlined />
                      活动记录
                    </span>
                  ),
                  children: (
                    <Table
                      columns={activityColumns}
                      dataSource={activities}
                      rowKey="id"
                      pagination={{ pageSize: 10 }}
                    />
                  )
                }
              ]}
            />
          </Card>
        </>
      )}
    </PageContainer>
  );
};

export default UserDetailPage;
