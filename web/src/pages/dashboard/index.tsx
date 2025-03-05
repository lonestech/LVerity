import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Table, List, Typography } from 'antd';
import { 
  DashboardOutlined, 
  KeyOutlined, 
  LaptopOutlined, 
  UserOutlined,
  AlertOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import PageContainer from '../../components/PageContainer';
import StatusTag from '../../components/StatusTag';
import { statsService } from '../../services/stats';
import { formatDateTime } from '../../utils/utils';
import { OverviewStatistics } from '../../models/stats';

const { Title, Text } = Typography;

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [stats, setStats] = useState<OverviewStatistics | null>(null);
  const [activities, setActivities] = useState<any[]>([]);

  // 加载数据
  const loadData = async () => {
    setLoading(true);
    try {
      // 获取概览统计
      const statsResponse = await statsService.getOverviewStatistics();
      if (statsResponse.success) {
        setStats(statsResponse.data);
      }

      // 获取最近活动
      const activitiesResponse = await statsService.getRecentActivities(10);
      if (activitiesResponse.success) {
        setActivities(activitiesResponse.data);
      }
    } catch (error) {
      console.error('加载数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    
    // 设置刷新间隔
    const interval = setInterval(() => {
      loadData();
    }, 60000); // 每分钟刷新一次
    
    return () => clearInterval(interval);
  }, []);

  // 统计卡片
  const StatCard = ({ 
    title, 
    value, 
    icon, 
    color 
  }: { 
    title: string; 
    value: number | string; 
    icon: React.ReactNode; 
    color: string 
  }) => (
    <Card>
      <Statistic
        title={title}
        value={value}
        valueStyle={{ color }}
        prefix={icon}
      />
    </Card>
  );

  // 活动图标映射
  const activityIconMap: Record<string, React.ReactNode> = {
    device: <LaptopOutlined />,
    license: <KeyOutlined />,
    user: <UserOutlined />,
    system: <DashboardOutlined />,
    alert: <AlertOutlined />,
  };

  return (
    <PageContainer title="仪表盘" loading={loading}>
      <Row gutter={[16, 16]}>
        {/* 统计卡片 */}
        <Col xs={24} sm={12} md={6}>
          <StatCard
            title="有效授权"
            value={stats?.activeLicenses || 0}
            icon={<KeyOutlined />}
            color="#1890ff"
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <StatCard
            title="活跃设备"
            value={stats?.activeDevices || 0}
            icon={<LaptopOutlined />}
            color="#52c41a"
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <StatCard
            title="用户数量"
            value={stats?.activeUsers || 0}
            icon={<UserOutlined />}
            color="#722ed1"
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <StatCard
            title="即将过期授权"
            value={stats?.expiringLicenses || 0}
            icon={<ClockCircleOutlined />}
            color="#fa8c16"
          />
        </Col>

        {/* 系统健康状态 */}
        <Col xs={24} md={12}>
          <Card title="系统健康状态">
            <Row gutter={[16, 16]}>
              <Col span={8}>
                <Statistic
                  title="CPU 使用率"
                  value={stats?.systemHealth.cpuUsage || 0}
                  suffix="%"
                  valueStyle={{ 
                    color: (stats?.systemHealth.cpuUsage || 0) > 70 ? '#ff4d4f' : '#52c41a'
                  }}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="内存使用率"
                  value={stats?.systemHealth.memoryUsage || 0}
                  suffix="%"
                  valueStyle={{ 
                    color: (stats?.systemHealth.memoryUsage || 0) > 70 ? '#ff4d4f' : '#52c41a'
                  }}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="磁盘使用率"
                  value={stats?.systemHealth.diskUsage || 0}
                  suffix="%"
                  valueStyle={{ 
                    color: (stats?.systemHealth.diskUsage || 0) > 70 ? '#ff4d4f' : '#52c41a'
                  }}
                />
              </Col>
              <Col span={24}>
                <div style={{ marginTop: 12 }}>
                  <StatusTag 
                    status={stats?.systemHealth.status || 'unknown'} 
                    customMapping={{
                      healthy: { color: 'success', text: '健康', icon: undefined },
                      warning: { color: 'warning', text: '警告', icon: undefined },
                      critical: { color: 'error', text: '严重', icon: undefined },
                      unknown: { color: 'default', text: '未知', icon: undefined },
                    }}
                  />
                </div>
              </Col>
            </Row>
          </Card>
        </Col>

        {/* 最近活动 */}
        <Col xs={24} md={12}>
          <Card title="最近活动" style={{ height: '100%' }}>
            <List
              dataSource={activities}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={activityIconMap[item.type] || <DashboardOutlined />}
                    title={item.action}
                    description={
                      <div>
                        <div>
                          {item.targetName && (
                            <Text type="secondary">{item.targetName}</Text>
                          )}
                        </div>
                        <div>
                          <Text type="secondary" style={{ fontSize: '12px' }}>
                            {formatDateTime(item.timestamp)}
                            {item.username && ` - ${item.username}`}
                          </Text>
                        </div>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </PageContainer>
  );
};

export default Dashboard;
