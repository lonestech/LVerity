import { PageContainer } from '@ant-design/pro-components';
import { Card, Row, Col, Statistic, Table, Badge, Tag, Space, Alert } from 'antd';
import React, { useEffect, useState } from 'react';
import { history } from '@umijs/max';
import { getDeviceStats, getDeviceList, getDeviceAbnormalBehaviors } from '@/services/device';

const MonitorPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<{
    total: number;
    online: number;
    offline: number;
    blocked: number;
    suspect: number;
    high_risk: number;
  }>();
  const [recentDevices, setRecentDevices] = useState<API.Device[]>([]);
  const [recentAlerts, setRecentAlerts] = useState<API.AbnormalBehavior[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsResponse, devicesResponse, alertsResponse] = await Promise.all([
          getDeviceStats(),
          getDeviceList({ current: 1, pageSize: 5, sort: 'last_seen desc' }),
          getDeviceAbnormalBehaviors('all', { current: 1, pageSize: 10 }),
        ]);

        if (statsResponse.success) {
          setStats(statsResponse.data);
        }

        if (devicesResponse.success) {
          setRecentDevices(devicesResponse.data);
        }

        if (alertsResponse.success) {
          setRecentAlerts(alertsResponse.data);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // 每5分钟刷新一次数据
    const timer = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(timer);
  }, []);

  const getRiskLevelBadge = (riskLevel: number) => {
    if (riskLevel >= 80) {
      return <Badge status="error" text="高风险" />;
    }
    if (riskLevel >= 50) {
      return <Badge status="warning" text="中风险" />;
    }
    if (riskLevel >= 20) {
      return <Badge status="processing" text="低风险" />;
    }
    return <Badge status="success" text="安全" />;
  };

  return (
    <PageContainer>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Alert
            message="设备监控"
            description="实时监控设备状态、风险等级和异常行为。"
            type="info"
            showIcon
          />
        </Col>
        <Col span={4}>
          <Card loading={loading}>
            <Statistic title="设备总数" value={stats?.total} />
          </Card>
        </Col>
        <Col span={4}>
          <Card loading={loading}>
            <Statistic
              title="在线设备"
              value={stats?.online}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card loading={loading}>
            <Statistic
              title="离线设备"
              value={stats?.offline}
              valueStyle={{ color: '#999999' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card loading={loading}>
            <Statistic
              title="已封禁"
              value={stats?.blocked}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card loading={loading}>
            <Statistic
              title="可疑设备"
              value={stats?.suspect}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card loading={loading}>
            <Statistic
              title="高风险"
              value={stats?.high_risk}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card
            title="最近活动设备"
            loading={loading}
            extra={<a onClick={() => history.push('/device')}>查看全部</a>}
          >
            <Table
              dataSource={recentDevices}
              columns={[
                {
                  title: '设备名称',
                  dataIndex: 'name',
                  render: (name: string, record: API.Device) => (
                    <a onClick={() => history.push(`/device/${record.id}`)}>{name}</a>
                  ),
                },
                {
                  title: '状态',
                  dataIndex: 'status',
                  render: (status: string) => {
                    const statusMap = {
                      normal: { color: 'success', text: '正常' },
                      offline: { color: 'default', text: '离线' },
                      blocked: { color: 'error', text: '已封禁' },
                      suspect: { color: 'warning', text: '可疑' },
                    };
                    const { color, text } = statusMap[status as keyof typeof statusMap];
                    return <Badge status={color as any} text={text} />;
                  },
                },
                {
                  title: '风险等级',
                  dataIndex: 'risk_level',
                  render: (riskLevel: number) => getRiskLevelBadge(riskLevel),
                },
                {
                  title: '最后在线',
                  dataIndex: 'last_seen',
                },
              ]}
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card
            title="最近异常行为"
            loading={loading}
            extra={<a onClick={() => history.push('/alert')}>查看全部</a>}
          >
            <Table
              dataSource={recentAlerts}
              columns={[
                {
                  title: '时间',
                  dataIndex: 'created_at',
                },
                {
                  title: '设备',
                  dataIndex: 'device_id',
                  render: (_, record: API.AbnormalBehavior) => (
                    <a onClick={() => history.push(`/device/${record.device_id}`)}>
                      {record.device_id}
                    </a>
                  ),
                },
                {
                  title: '级别',
                  dataIndex: 'level',
                  render: (level: string) => {
                    const color = {
                      high: 'red',
                      medium: 'orange',
                      low: 'blue',
                    }[level] || 'default';
                    return <Badge color={color} text={level} />;
                  },
                },
                {
                  title: '描述',
                  dataIndex: 'description',
                  ellipsis: true,
                },
              ]}
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
      </Row>
    </PageContainer>
  );
};

export default MonitorPage;
