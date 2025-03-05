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
  Row, 
  Col, 
  message,
  Statistic,
  Badge,
  Progress
} from 'antd';
import { 
  DesktopOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  HistoryOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  StopOutlined,
  LineChartOutlined,
  SafetyCertificateOutlined,
  ExclamationCircleOutlined,
  EnvironmentOutlined,
  GlobalOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import PageContainer from '../../components/PageContainer';
import StatusTag from '../../components/StatusTag';
import DetailCard from '../../components/DetailCard';
import { deviceService } from '../../services/device';
import { Device, DeviceLog } from '../../models/device';
import { formatDateTime } from '../../utils/utils';

const { Text, Title } = Typography;
const { TabPane } = Tabs;

const DeviceDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(false);
  const [device, setDevice] = useState<Device | null>(null);
  const [logs, setLogs] = useState<DeviceLog[]>([]);
  const [activeTab, setActiveTab] = useState<string>('basic');

  // 加载设备数据
  const loadDeviceData = async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      const response = await deviceService.getDeviceById(id);
      if (response.success) {
        setDevice(response.data);
      } else {
        message.error(response.message || '加载设备信息失败');
      }
    } catch (error) {
      console.error('加载设备信息失败:', error);
      message.error('加载设备信息失败');
    } finally {
      setLoading(false);
    }
  };

  // 加载设备日志
  const loadDeviceLogs = async () => {
    if (!id) return;
    
    try {
      const response = await deviceService.getDeviceLogs(id);
      if (response.success) {
        setLogs(response.data);
      }
    } catch (error) {
      console.error('加载设备日志失败:', error);
    }
  };

  // 组件加载时获取数据
  useEffect(() => {
    loadDeviceData();
    loadDeviceLogs();
  }, [id]);

  // 处理标签页切换
  const handleTabChange = (key: string) => {
    setActiveTab(key);
  };

  // 激活操作
  const handleActivate = async () => {
    if (!id) return;
    
    try {
      const response = await deviceService.activateDevice(id);
      if (response.success) {
        message.success('设备激活成功');
        loadDeviceData();
        loadDeviceLogs();
      } else {
        message.error(response.message || '设备激活失败');
      }
    } catch (error) {
      console.error('设备激活失败:', error);
      message.error('设备激活失败');
    }
  };

  // 禁用操作
  const handleDeactivate = async () => {
    if (!id) return;
    
    try {
      const response = await deviceService.deactivateDevice(id);
      if (response.success) {
        message.success('设备已禁用');
        loadDeviceData();
        loadDeviceLogs();
      } else {
        message.error(response.message || '设备禁用失败');
      }
    } catch (error) {
      console.error('设备禁用失败:', error);
      message.error('设备禁用失败');
    }
  };

  // 删除操作
  const handleDelete = async () => {
    if (!id) return;
    
    try {
      const response = await deviceService.deleteDevice(id);
      if (response.success) {
        message.success('设备已删除');
        navigate('/device');
      } else {
        message.error(response.message || '设备删除失败');
      }
    } catch (error) {
      console.error('设备删除失败:', error);
      message.error('设备删除失败');
    }
  };

  // 日志图标
  const getLogIcon = (type: string) => {
    switch (type) {
      case 'register':
        return <DesktopOutlined style={{ color: '#1890ff' }} />;
      case 'activate':
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      case 'deactivate':
        return <StopOutlined style={{ color: '#ff4d4f' }} />;
      case 'heartbeat':
        return <LineChartOutlined style={{ color: '#722ed1' }} />;
      case 'verify':
        return <SafetyCertificateOutlined style={{ color: '#faad14' }} />;
      case 'error':
        return <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />;
      default:
        return <ClockCircleOutlined style={{ color: '#8c8c8c' }} />;
    }
  };

  // 日志列配置
  const logColumns = [
    {
      title: '类型',
      key: 'type',
      width: 120,
      render: (_, record: DeviceLog) => (
        <Space>
          {getLogIcon(record.type)}
          <span>{
            record.type === 'register' ? '注册' :
            record.type === 'activate' ? '激活' :
            record.type === 'deactivate' ? '禁用' :
            record.type === 'heartbeat' ? '心跳' :
            record.type === 'verify' ? '验证' :
            record.type === 'error' ? '错误' :
            record.type
          }</span>
        </Space>
      ),
    },
    {
      title: '消息',
      dataIndex: 'message',
      key: 'message',
      ellipsis: { showTitle: false },
      render: (message: string) => (
        <Tooltip title={message}>
          <span>{message}</span>
        </Tooltip>
      ),
    },
    {
      title: 'IP地址',
      dataIndex: 'ipAddress',
      key: 'ipAddress',
      width: 150,
      render: (ip: string) => ip || '-',
    },
    {
      title: '时间',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 180,
      render: (date: string) => formatDateTime(date),
    },
  ];

  // 获取设备连接状态
  const getConnectionStatus = (device: Device | null) => {
    if (!device) return { text: '未知', color: 'default' };
    
    const lastSeen = device.lastSeen ? new Date(device.lastSeen).getTime() : 0;
    const now = new Date().getTime();
    const diffMinutes = (now - lastSeen) / (1000 * 60);
    
    if (device.status !== 'active') {
      return { text: '离线', color: 'default' };
    }
    
    if (diffMinutes < 5) {
      return { text: '在线', color: 'success' };
    } else if (diffMinutes < 60) {
      return { text: '最近在线', color: 'warning' };
    } else {
      return { text: '离线', color: 'error' };
    }
  };

  // 获取健康状态
  const getHealthStatus = (health: number) => {
    if (health >= 80) return { status: 'success', text: '良好' };
    if (health >= 60) return { status: 'normal', text: '正常' };
    if (health >= 40) return { status: 'warning', text: '注意' };
    return { status: 'exception', text: '异常' };
  };

  const connectionStatus = device ? getConnectionStatus(device) : { text: '未知', color: 'default' };
  const healthStatus = device && device.health ? getHealthStatus(device.health) : { status: 'normal', text: '正常' };

  return (
    <PageContainer 
      title="设备详情" 
      loading={loading}
      backPath="/device"
      extra={
        <Space>
          {device?.status === 'inactive' && (
            <Button 
              type="primary" 
              icon={<CheckCircleOutlined />} 
              onClick={handleActivate}
            >
              激活设备
            </Button>
          )}
          {device?.status === 'active' && (
            <Button 
              danger
              icon={<StopOutlined />} 
              onClick={handleDeactivate}
            >
              禁用设备
            </Button>
          )}
          <Button 
            type="primary" 
            icon={<EditOutlined />} 
            onClick={() => navigate(`/device/edit/${id}`)}
          >
            编辑设备
          </Button>
          <Button 
            danger
            icon={<DeleteOutlined />} 
            onClick={handleDelete}
          >
            删除设备
          </Button>
        </Space>
      }
    >
      {device && (
        <>
          <Row gutter={16}>
            <Col xs={24} md={8}>
              <DetailCard 
                title="设备信息" 
                icon={<DesktopOutlined />}
                extra={<StatusTag status={device.status} />}
              >
                <Statistic 
                  title="设备名称" 
                  value={device.name} 
                  valueStyle={{ fontSize: '16px' }} 
                />
                <div style={{ marginTop: 16 }}>
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <div>
                      <Badge status={connectionStatus.color as any} text={connectionStatus.text} /> 
                      <Text type="secondary" style={{ marginLeft: 16 }}>
                        {device.lastSeen ? `最后在线: ${formatDateTime(device.lastSeen)}` : '尚未上线'}
                      </Text>
                    </div>
                    <div>
                      <Text>设备健康度</Text>
                      <Progress 
                        percent={device.health || 100} 
                        status={healthStatus.status as any}
                        size="small"
                      />
                    </div>
                  </Space>
                </div>
              </DetailCard>
            </Col>
            <Col xs={24} md={8}>
              <DetailCard 
                title="许可证信息" 
                icon={<SafetyCertificateOutlined />}
              >
                {device.licenseKey ? (
                  <>
                    <Statistic 
                      title="许可证" 
                      value={device.licenseKey} 
                      valueStyle={{ fontSize: '14px', wordBreak: 'break-all' }} 
                    />
                    <div style={{ marginTop: 16 }}>
                      {device.licenseStatus && (
                        <Space>
                          <Text>许可状态:</Text>
                          <StatusTag status={device.licenseStatus} />
                        </Space>
                      )}
                    </div>
                  </>
                ) : (
                  <div style={{ textAlign: 'center', padding: '20px 0' }}>
                    <Text type="secondary">设备未绑定许可证</Text>
                  </div>
                )}
              </DetailCard>
            </Col>
            <Col xs={24} md={8}>
              <DetailCard 
                title="位置信息" 
                icon={<EnvironmentOutlined />}
              >
                <Space direction="vertical" style={{ width: '100%' }}>
                  {device.location && (
                    <Statistic 
                      title="地理位置" 
                      value={device.location} 
                      valueStyle={{ fontSize: '14px' }} 
                    />
                  )}
                  {device.ipAddress && (
                    <Statistic 
                      title="IP地址" 
                      value={device.ipAddress} 
                      valueStyle={{ fontSize: '14px' }} 
                      prefix={<GlobalOutlined />}
                    />
                  )}
                  {!device.location && !device.ipAddress && (
                    <div style={{ textAlign: 'center', padding: '20px 0' }}>
                      <Text type="secondary">无位置信息</Text>
                    </div>
                  )}
                </Space>
              </DetailCard>
            </Col>
          </Row>

          <Card style={{ marginTop: 16 }}>
            <Tabs 
              activeKey={activeTab} 
              onChange={handleTabChange}
              items={[
                {
                  key: 'basic',
                  label: (
                    <span>
                      <InfoCircleOutlined />
                      详细信息
                    </span>
                  ),
                  children: (
                    <Descriptions bordered column={{ xs: 1, sm: 2, md: 3 }}>
                      <Descriptions.Item label="设备ID">{device.id}</Descriptions.Item>
                      <Descriptions.Item label="设备名称">{device.name}</Descriptions.Item>
                      <Descriptions.Item label="设备类型">{device.type || '-'}</Descriptions.Item>
                      <Descriptions.Item label="状态">
                        <StatusTag status={device.status} />
                      </Descriptions.Item>
                      <Descriptions.Item label="连接状态">
                        <Badge status={connectionStatus.color as any} text={connectionStatus.text} />
                      </Descriptions.Item>
                      <Descriptions.Item label="许可证密钥">
                        {device.licenseKey || '-'}
                      </Descriptions.Item>
                      <Descriptions.Item label="硬件标识">{device.hardwareId || '-'}</Descriptions.Item>
                      <Descriptions.Item label="MAC地址">{device.macAddress || '-'}</Descriptions.Item>
                      <Descriptions.Item label="IP地址">{device.ipAddress || '-'}</Descriptions.Item>
                      <Descriptions.Item label="操作系统">{device.osInfo || '-'}</Descriptions.Item>
                      <Descriptions.Item label="软件版本">{device.softwareVersion || '-'}</Descriptions.Item>
                      <Descriptions.Item label="位置">{device.location || '-'}</Descriptions.Item>
                      <Descriptions.Item label="首次注册时间">
                        {formatDateTime(device.registeredAt)}
                      </Descriptions.Item>
                      <Descriptions.Item label="最后活动时间">
                        {device.lastSeen ? formatDateTime(device.lastSeen) : '-'}
                      </Descriptions.Item>
                      <Descriptions.Item label="更新时间">
                        {device.updatedAt ? formatDateTime(device.updatedAt) : '-'}
                      </Descriptions.Item>
                      {device.notes && (
                        <Descriptions.Item label="备注" span={3}>
                          {device.notes}
                        </Descriptions.Item>
                      )}
                    </Descriptions>
                  )
                },
                {
                  key: 'logs',
                  label: (
                    <span>
                      <HistoryOutlined />
                      设备日志
                    </span>
                  ),
                  children: (
                    <Table
                      columns={logColumns}
                      dataSource={logs}
                      rowKey="id"
                      pagination={{ pageSize: 10 }}
                    />
                  )
                },
                {
                  key: 'monitoring',
                  label: (
                    <span>
                      <LineChartOutlined />
                      监控信息
                    </span>
                  ),
                  children: (
                    <div>
                      <Alert 
                        message="设备监控功能即将推出" 
                        description="设备实时监控功能正在开发中，敬请期待。" 
                        type="info" 
                        showIcon 
                      />
                    </div>
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

export default DeviceDetailPage;
