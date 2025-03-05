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
  Tag, 
  Row, 
  Col, 
  message,
  Statistic
} from 'antd';
import { 
  SafetyCertificateOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  HistoryOutlined,
  ClockCircleOutlined,
  KeyOutlined,
  CheckCircleOutlined,
  StopOutlined,
  SyncOutlined,
  DesktopOutlined,
  UserOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import PageContainer from '../../components/PageContainer';
import StatusTag from '../../components/StatusTag';
import DetailCard from '../../components/DetailCard';
import { licenseService } from '../../services/license';
import { License, LicenseActivation } from '../../models/license';
import { formatDateTime } from '../../utils/utils';

const { Text, Title } = Typography;
const { TabPane } = Tabs;

const LicenseDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(false);
  const [license, setLicense] = useState<License | null>(null);
  const [activations, setActivations] = useState<LicenseActivation[]>([]);
  const [activeTab, setActiveTab] = useState<string>('basic');

  // 加载许可证数据
  const loadLicenseData = async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      const response = await licenseService.getLicenseById(id);
      if (response.success) {
        setLicense(response.data);
      } else {
        message.error(response.message || '加载许可证信息失败');
      }
    } catch (error) {
      console.error('加载许可证信息失败:', error);
      message.error('加载许可证信息失败');
    } finally {
      setLoading(false);
    }
  };

  // 加载许可证激活记录
  const loadActivations = async () => {
    if (!id) return;
    
    try {
      const response = await licenseService.getLicenseActivations(id);
      if (response.success) {
        setActivations(response.data);
      }
    } catch (error) {
      console.error('加载激活记录失败:', error);
    }
  };

  // 组件加载时获取数据
  useEffect(() => {
    loadLicenseData();
    loadActivations();
  }, [id]);

  // 处理标签页切换
  const handleTabChange = (key: string) => {
    setActiveTab(key);
  };

  // 激活操作
  const handleActivate = async () => {
    if (!id) return;
    
    try {
      const response = await licenseService.activateLicense(id);
      if (response.success) {
        message.success('许可证激活成功');
        loadLicenseData();
        loadActivations();
      } else {
        message.error(response.message || '许可证激活失败');
      }
    } catch (error) {
      console.error('许可证激活失败:', error);
      message.error('许可证激活失败');
    }
  };

  // 暂停操作
  const handleSuspend = async () => {
    if (!id) return;
    
    try {
      const response = await licenseService.suspendLicense(id);
      if (response.success) {
        message.success('许可证已暂停');
        loadLicenseData();
        loadActivations();
      } else {
        message.error(response.message || '许可证暂停失败');
      }
    } catch (error) {
      console.error('许可证暂停失败:', error);
      message.error('许可证暂停失败');
    }
  };

  // 删除操作
  const handleDelete = async () => {
    if (!id) return;
    
    try {
      const response = await licenseService.deleteLicense(id);
      if (response.success) {
        message.success('许可证已删除');
        navigate('/license');
      } else {
        message.error(response.message || '许可证删除失败');
      }
    } catch (error) {
      console.error('许可证删除失败:', error);
      message.error('许可证删除失败');
    }
  };

  // 激活记录列配置
  const activationColumns = [
    {
      title: '操作类型',
      key: 'type',
      width: 120,
      render: (_, record: LicenseActivation) => (
        <Space>
          {record.type === 'activate' ? (
            <CheckCircleOutlined style={{ color: '#52c41a' }} />
          ) : (
            <StopOutlined style={{ color: '#ff4d4f' }} />
          )}
          <span>{record.type === 'activate' ? '激活' : '暂停'}</span>
        </Space>
      ),
    },
    {
      title: '设备',
      dataIndex: 'deviceId',
      key: 'deviceId',
      width: 180,
      render: (deviceId: string, record: LicenseActivation) => (
        <Space>
          <DesktopOutlined />
          <span>{record.deviceName || deviceId}</span>
        </Space>
      ),
    },
    {
      title: '操作人',
      dataIndex: 'operatorId',
      key: 'operatorId',
      width: 150,
      render: (operatorId: string, record: LicenseActivation) => (
        <Space>
          <UserOutlined />
          <span>{record.operatorName || operatorId}</span>
        </Space>
      ),
    },
    {
      title: '原因',
      dataIndex: 'reason',
      key: 'reason',
      ellipsis: { showTitle: false },
      render: (reason: string) => (
        <Tooltip title={reason || '无'}>
          <span>{reason || '无'}</span>
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
      title="许可证详情" 
      loading={loading}
      backPath="/license"
      extra={
        <Space>
          {license?.status === 'inactive' && (
            <Button 
              type="primary" 
              icon={<CheckCircleOutlined />} 
              onClick={handleActivate}
            >
              激活许可证
            </Button>
          )}
          {license?.status === 'active' && (
            <Button 
              danger
              icon={<StopOutlined />} 
              onClick={handleSuspend}
            >
              暂停许可证
            </Button>
          )}
          <Button 
            type="primary" 
            icon={<EditOutlined />} 
            onClick={() => navigate(`/license/edit/${id}`)}
          >
            编辑许可证
          </Button>
          <Button 
            danger
            icon={<DeleteOutlined />} 
            onClick={handleDelete}
          >
            删除许可证
          </Button>
        </Space>
      }
    >
      {license && (
        <>
          <Row gutter={16}>
            <Col xs={24} md={8}>
              <DetailCard 
                title="许可证信息" 
                icon={<SafetyCertificateOutlined />}
                extra={<StatusTag status={license.status} />}
              >
                <Statistic 
                  title="许可证密钥" 
                  value={license.key} 
                  valueStyle={{ fontSize: '16px', wordBreak: 'break-all' }} 
                />
                <div style={{ marginTop: 16 }}>
                  <Row gutter={[16, 16]}>
                    <Col span={12}>
                      <Statistic 
                        title="激活次数" 
                        value={license.activationCount || 0}
                        prefix={<KeyOutlined />} 
                      />
                    </Col>
                    <Col span={12}>
                      <Statistic 
                        title="最大激活次数" 
                        value={license.maxActivations || '不限'}
                        prefix={<InfoCircleOutlined />} 
                      />
                    </Col>
                  </Row>
                </div>
              </DetailCard>
            </Col>
            <Col xs={24} md={8}>
              <DetailCard 
                title="客户信息" 
                icon={<UserOutlined />}
              >
                <Statistic 
                  title="客户名称" 
                  value={license.customerName} 
                  valueStyle={{ fontSize: '16px' }} 
                />
                {license.customerContact && (
                  <Statistic 
                    title="联系人" 
                    value={license.customerContact} 
                    valueStyle={{ fontSize: '14px' }} 
                  />
                )}
                {license.customerEmail && (
                  <Statistic 
                    title="联系邮箱" 
                    value={license.customerEmail} 
                    valueStyle={{ fontSize: '14px' }} 
                  />
                )}
              </DetailCard>
            </Col>
            <Col xs={24} md={8}>
              <DetailCard 
                title="产品信息" 
                icon={<InfoCircleOutlined />}
              >
                <Statistic 
                  title="产品名称" 
                  value={license.productName} 
                  valueStyle={{ fontSize: '16px' }} 
                />
                <div style={{ marginTop: 16 }}>
                  <Row gutter={[16, 16]}>
                    <Col span={12}>
                      <Statistic 
                        title="开始日期" 
                        value={license.startDate ? formatDateTime(license.startDate).split(' ')[0] : '不限'}
                        valueStyle={{ fontSize: '14px' }} 
                      />
                    </Col>
                    <Col span={12}>
                      <Statistic 
                        title="到期日期" 
                        value={license.expiryDate ? formatDateTime(license.expiryDate).split(' ')[0] : '不限'}
                        valueStyle={{ fontSize: '14px' }} 
                      />
                    </Col>
                  </Row>
                </div>
                {license.features && license.features.length > 0 && (
                  <div style={{ marginTop: 16 }}>
                    <Text strong>功能特性：</Text>
                    <div style={{ marginTop: 8 }}>
                      {license.features.map((feature, index) => (
                        <Tag key={index} color="blue" style={{ margin: '0 8px 8px 0' }}>
                          {feature}
                        </Tag>
                      ))}
                    </div>
                  </div>
                )}
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
                      <SafetyCertificateOutlined />
                      详细信息
                    </span>
                  ),
                  children: (
                    <Descriptions bordered column={{ xs: 1, sm: 2, md: 3 }}>
                      <Descriptions.Item label="许可证ID">{license.id}</Descriptions.Item>
                      <Descriptions.Item label="许可证密钥">{license.key}</Descriptions.Item>
                      <Descriptions.Item label="状态">
                        <StatusTag status={license.status} />
                      </Descriptions.Item>
                      <Descriptions.Item label="客户">{license.customerName}</Descriptions.Item>
                      <Descriptions.Item label="产品">{license.productName}</Descriptions.Item>
                      <Descriptions.Item label="版本">{license.version || '-'}</Descriptions.Item>
                      <Descriptions.Item label="开始日期">
                        {license.startDate ? formatDateTime(license.startDate).split(' ')[0] : '不限'}
                      </Descriptions.Item>
                      <Descriptions.Item label="到期日期">
                        {license.expiryDate ? formatDateTime(license.expiryDate).split(' ')[0] : '不限'}
                      </Descriptions.Item>
                      <Descriptions.Item label="激活次数">
                        {license.activationCount || 0} / {license.maxActivations || '不限'}
                      </Descriptions.Item>
                      {license.notes && (
                        <Descriptions.Item label="备注" span={3}>
                          {license.notes}
                        </Descriptions.Item>
                      )}
                      <Descriptions.Item label="创建时间">
                        {formatDateTime(license.createdAt)}
                      </Descriptions.Item>
                      <Descriptions.Item label="创建人">
                        {license.createdBy || '-'}
                      </Descriptions.Item>
                      <Descriptions.Item label="更新时间">
                        {license.updatedAt ? formatDateTime(license.updatedAt) : '-'}
                      </Descriptions.Item>
                    </Descriptions>
                  )
                },
                {
                  key: 'activations',
                  label: (
                    <span>
                      <HistoryOutlined />
                      激活记录
                    </span>
                  ),
                  children: (
                    <Table
                      columns={activationColumns}
                      dataSource={activations}
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

export default LicenseDetailPage;
