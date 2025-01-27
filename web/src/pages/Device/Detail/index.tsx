import { PageContainer } from '@ant-design/pro-components';
import { Card, Descriptions, Tabs, Statistic, Row, Col, Timeline, Badge, Table, Space, Tag, Button } from 'antd';
import React, { useEffect, useState } from 'react';
import { useParams, history } from '@umijs/max';
import { getDeviceDetail, getDeviceUsageStats, getDeviceAbnormalBehaviors, blockDevice, unblockDevice } from '@/services/device';
import { ExportOutlined, RollbackOutlined, LockOutlined, UnlockOutlined } from '@ant-design/icons';

const DeviceDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [device, setDevice] = useState<API.Device>();
  const [usageStats, setUsageStats] = useState<API.UsageStats>();
  const [abnormalBehaviors, setAbnormalBehaviors] = useState<API.AbnormalBehavior[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDeviceInfo = async () => {
      try {
        const [deviceResponse, statsResponse, behaviorsResponse] = await Promise.all([
          getDeviceDetail(id!),
          getDeviceUsageStats(id!),
          getDeviceAbnormalBehaviors(id!),
        ]);
        
        if (deviceResponse.success) {
          setDevice(deviceResponse.data);
        }
        
        if (statsResponse.success) {
          setUsageStats(statsResponse.data);
        }

        if (behaviorsResponse.success) {
          setAbnormalBehaviors(behaviorsResponse.data);
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchDeviceInfo();
    }
  }, [id]);

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

  const handleBlockDevice = async () => {
    try {
      if (device?.status === 'blocked') {
        await unblockDevice(id!);
        setDevice({ ...device, status: 'normal' });
      } else {
        await blockDevice(id!);
        setDevice({ ...device, status: 'blocked' });
      }
    } catch (error) {
      console.error('操作失败:', error);
    }
  };

  const items = [
    {
      key: 'basic',
      label: '基本信息',
      children: (
        <Card loading={loading}>
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Space size="middle">
                <Button icon={<RollbackOutlined />} onClick={() => history.push('/device')}>
                  返回列表
                </Button>
                <Button
                  type={device?.status === 'blocked' ? 'primary' : 'default'}
                  icon={device?.status === 'blocked' ? <UnlockOutlined /> : <LockOutlined />}
                  onClick={handleBlockDevice}
                >
                  {device?.status === 'blocked' ? '解除封禁' : '封禁设备'}
                </Button>
                <Button icon={<ExportOutlined />}>导出日志</Button>
              </Space>
            </Col>
            <Col span={24}>
              <Descriptions column={2}>
                <Descriptions.Item label="设备名称">{device?.name}</Descriptions.Item>
                <Descriptions.Item label="状态">
                  <Badge
                    status={
                      {
                        normal: 'success',
                        offline: 'default',
                        blocked: 'error',
                        suspect: 'warning',
                      }[device?.status || 'normal'] as any
                    }
                    text={device?.status}
                  />
                </Descriptions.Item>
                <Descriptions.Item label="风险等级">
                  {device?.risk_level && getRiskLevelBadge(device.risk_level)}
                </Descriptions.Item>
                <Descriptions.Item label="告警次数">
                  <Space>
                    <Tag color={device?.alert_count ? 'error' : 'default'}>
                      {device?.alert_count || 0}
                    </Tag>
                    {device?.last_alert_time && (
                      <span style={{ fontSize: '12px', color: '#999' }}>
                        最近: {device.last_alert_time}
                      </span>
                    )}
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label="最后在线">{device?.last_seen}</Descriptions.Item>
                <Descriptions.Item label="最后心跳">{device?.last_heartbeat}</Descriptions.Item>
                <Descriptions.Item label="授权ID">{device?.license_id}</Descriptions.Item>
                <Descriptions.Item label="设备分组">{device?.group_name}</Descriptions.Item>
              </Descriptions>
            </Col>
          </Row>
        </Card>
      ),
    },
    {
      key: 'hardware',
      label: '硬件信息',
      children: (
        <Card loading={loading}>
          <Descriptions column={2}>
            <Descriptions.Item label="硬盘ID">{device?.disk_id}</Descriptions.Item>
            <Descriptions.Item label="BIOS">{device?.bios}</Descriptions.Item>
            <Descriptions.Item label="主板">{device?.motherboard}</Descriptions.Item>
            <Descriptions.Item label="网卡">{device?.network_cards}</Descriptions.Item>
            <Descriptions.Item label="显卡">{device?.display_card}</Descriptions.Item>
            <Descriptions.Item label="分辨率">{device?.resolution}</Descriptions.Item>
            <Descriptions.Item label="时区">{device?.timezone}</Descriptions.Item>
            <Descriptions.Item label="语言">{device?.language}</Descriptions.Item>
            <Descriptions.Item label="位置">{device?.location}</Descriptions.Item>
          </Descriptions>
        </Card>
      ),
    },
    {
      key: 'usage',
      label: '使用统计',
      children: (
        <Card loading={loading}>
          <Row gutter={[16, 16]}>
            <Col span={6}>
              <Statistic
                title="总使用时长"
                value={usageStats?.total_usage_time}
                suffix="小时"
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="日均使用"
                value={usageStats?.daily_usage_time}
                suffix="小时"
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="月均使用"
                value={usageStats?.monthly_usage_time}
                suffix="小时"
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="会话次数"
                value={usageStats?.session_count}
                suffix="次"
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="平均使用时长"
                value={usageStats?.avg_usage_time}
                suffix="小时"
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="峰值使用时间"
                value={usageStats?.peak_usage_time}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="最后活跃日期"
                value={usageStats?.last_active_date}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="最后会话结束"
                value={usageStats?.last_session_end_time}
              />
            </Col>
          </Row>
        </Card>
      ),
    },
    {
      key: 'abnormal',
      label: '异常行为',
      children: (
        <Card loading={loading}>
          <Table
            dataSource={abnormalBehaviors}
            columns={[
              {
                title: '时间',
                dataIndex: 'created_at',
                key: 'created_at',
              },
              {
                title: '类型',
                dataIndex: 'type',
                key: 'type',
              },
              {
                title: '级别',
                dataIndex: 'level',
                key: 'level',
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
                key: 'description',
              },
              {
                title: '详细信息',
                dataIndex: 'data',
                key: 'data',
                render: (data: string) => data && <Tag>{data}</Tag>,
              },
            ]}
            pagination={{
              defaultPageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
            }}
          />
        </Card>
      ),
    },
  ];

  return (
    <PageContainer
      header={{
        title: '设备详情',
        subTitle: `设备名称：${device?.name}`,
        tags: [
          device?.status && (
            <Badge
              status={
                {
                  normal: 'success',
                  offline: 'default',
                  blocked: 'error',
                  suspect: 'warning',
                }[device.status] as any
              }
              text={device.status}
            />
          ),
          device?.risk_level && getRiskLevelBadge(device.risk_level),
        ],
      }}
    >
      <Tabs items={items} />
    </PageContainer>
  );
};

export default DeviceDetail;
