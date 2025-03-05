import React, { useEffect, useState } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Statistic, 
  Space, 
  Divider, 
  Progress, 
  List, 
  Typography, 
  Button,
  Tooltip,
  Alert
} from 'antd';
import { 
  AreaChartOutlined, 
  DashboardOutlined, 
  DatabaseOutlined, 
  CloudServerOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  HourglassOutlined
} from '@ant-design/icons';
import { systemService } from '../../services/system';
import { SystemStatus } from '../../models/system';

const { Text, Title } = Typography;

// 格式化工具函数
const formatStorage = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
  if (bytes < 1024 * 1024 * 1024) return (bytes / 1024 / 1024).toFixed(2) + ' MB';
  return (bytes / 1024 / 1024 / 1024).toFixed(2) + ' GB';
};

const parsePercentage = (percentStr: string): number => {
  const match = percentStr.match(/(\d+(\.\d+)?)/);
  return match ? parseFloat(match[1]) : 0;
};

const SystemStats: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 加载数据
  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await systemService.getSystemStatus();
      if (response.success) {
        setSystemStatus(response.data);
      } else {
        // 如果API返回失败但没有抛出异常
        setError(response.message || '加载系统状态失败');
        // 使用演示数据
        setSystemStatus(renderDemoData());
      }
    } catch (error) {
      console.error('加载系统状态失败:', error);
      setError('加载系统状态失败，使用模拟数据');
      // 使用演示数据
      setSystemStatus(renderDemoData());
    } finally {
      setLoading(false);
    }
  };

  // 组件加载时获取数据
  useEffect(() => {
    loadData();
    
    // 设置定时刷新
    const intervalId = setInterval(loadData, 60000); // 每分钟刷新
    
    return () => clearInterval(intervalId);
  }, []);

  // 获取状态指示图标
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      case 'stopped':
        return <CloseCircleOutlined style={{ color: '#ff4d4f' }} />;
      case 'error':
        return <CloseCircleOutlined style={{ color: '#ff4d4f' }} />;
      case 'warning':
        return <ExclamationCircleOutlined style={{ color: '#faad14' }} />;
      default:
        return <HourglassOutlined style={{ color: '#1890ff' }} />;
    }
  };

  // 获取进度条状态
  const getProgressStatus = (usage: number) => {
    if (usage >= 90) return 'exception';
    if (usage >= 70) return 'warning';
    return 'normal';
  };

  // 渲染示例数据，实际应从API获取
  const renderDemoData = (): SystemStatus => {
    return {
      status: "running",
      uptime: "1d 12h 30m",
      cpuUsage: "35.5%",
      memoryUsage: "52.0%",
      diskUsage: "70.0%",
      hostname: "SERVER-DEV",
      platform: "Microsoft Windows",
      platformVersion: "10.0.19045",
      kernelVersion: "10.0.19045",
      connections: 24,
      lastBackup: "2025-03-04T12:00:00Z",
      updates: {
        available: false,
        version: ""
      },
      services: [
        { name: '授权服务', status: 'running', uptime: '25d 12h 30m' },
        { name: '设备监控', status: 'running', uptime: '25d 12h 30m' },
        { name: '数据同步', status: 'running', uptime: '25d 12h 30m' },
        { name: '邮件通知', status: 'warning', uptime: '10d 5h 15m' },
        { name: '备份服务', status: 'stopped', uptime: '0' }
      ]
    };
  };

  // 获取显示数据
  const getDisplayData = (): SystemStatus => {
    return systemStatus || renderDemoData();
  };

  const data = getDisplayData();

  return (
    <>
      <Card 
        title={
          <Space>
            <DashboardOutlined />
            <span>系统状态</span>
          </Space>
        }
        extra={
          <Button 
            icon={<ReloadOutlined />} 
            loading={loading}
            onClick={loadData}
          >
            刷新
          </Button>
        }
        style={{ marginBottom: 16 }}
        variant="outlined"
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Card variant="outlined">
              <Statistic
                title="CPU 使用率"
                value={parsePercentage(data.cpuUsage)}
                suffix="%"
                precision={1}
              />
              <Progress 
                percent={parsePercentage(data.cpuUsage)} 
                status={getProgressStatus(parsePercentage(data.cpuUsage))}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Card variant="outlined">
              <Statistic
                title="内存使用率"
                value={parsePercentage(data.memoryUsage)}
                suffix="%"
                precision={1}
              />
              <Progress 
                percent={parsePercentage(data.memoryUsage)} 
                status={getProgressStatus(parsePercentage(data.memoryUsage))}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Card variant="outlined">
              <Statistic
                title="磁盘使用率"
                value={parsePercentage(data.diskUsage)}
                suffix="%"
                precision={1}
              />
              <Progress 
                percent={parsePercentage(data.diskUsage)} 
                status={getProgressStatus(parsePercentage(data.diskUsage))}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Card variant="outlined">
              <Statistic
                title="运行时间"
                value={data.uptime}
                valueStyle={{ fontSize: '16px' }}
              />
              <div style={{ marginTop: 10 }}>
                <Text type="secondary">主机名: {data.hostname}</Text>
              </div>
            </Card>
          </Col>
        </Row>
      </Card>
      
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card 
            title={
              <Space>
                <CloudServerOutlined />
                <span>服务状态</span>
              </Space>
            }
            variant="outlined"
          >
            <List
              itemLayout="horizontal"
              dataSource={data.services}
              renderItem={item => (
                <List.Item
                  extra={getStatusIcon(item.status)}
                >
                  <List.Item.Meta
                    title={item.name}
                    description={`运行时间: ${item.uptime}`}
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
        
        <Col xs={24} lg={12}>
          <Card 
            title={
              <Space>
                <DatabaseOutlined />
                <span>系统信息</span>
              </Space>
            }
            variant="outlined"
          >
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Statistic
                  title="连接数"
                  value={data.connections}
                  valueStyle={{ fontSize: '24px' }}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="最后备份时间"
                  value={new Date(data.lastBackup).toLocaleString()}
                  valueStyle={{ fontSize: '14px' }}
                />
              </Col>
            </Row>
            <Divider />
            <Row gutter={[16, 8]}>
              <Col span={24}>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Text><strong>平台:</strong> {data.platform} {data.platformVersion}</Text>
                  <Text><strong>内核版本:</strong> {data.kernelVersion}</Text>
                  <Text><strong>系统状态:</strong> {data.status === 'running' ? '正常运行' : '异常'}</Text>
                </Space>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
      
      {error && (
        <Alert
          message="加载错误"
          description={error}
          type="error"
          showIcon
          style={{ marginTop: 16 }}
        />
      )}
    </>
  );
};

export default SystemStats;
