import React, { useState } from 'react';
import { 
  Card, 
  Table, 
  Typography, 
  Button, 
  Tooltip, 
  Tag, 
  Space, 
  Modal, 
  message 
} from 'antd';
import {
  DeleteOutlined,
  ExclamationCircleOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { LicenseActivation } from '../models/license';
import { formatDateTime } from '../utils/utils';
import { useLicenseActivations } from '../hooks/useLicenseActivations';

const { Text, Title } = Typography;
const { confirm } = Modal;

interface LicenseActivationManagerProps {
  licenseId: string;
  title?: string;
  showActions?: boolean;
}

/**
 * 许可证激活管理组件
 */
const LicenseActivationManager: React.FC<LicenseActivationManagerProps> = ({
  licenseId,
  title = '激活记录',
  showActions = true
}) => {
  const {
    data: activations = [],
    isLoading,
    refetch
  } = useLicenseActivations(licenseId);

  /**
   * 撤销激活（此功能需要后端实现对应的API）
   */
  const handleRevokeActivation = (activationId: string) => {
    confirm({
      title: '确认撤销此激活?',
      icon: <ExclamationCircleOutlined />,
      content: '撤销后，此设备将无法使用此许可证，除非重新激活。',
      okText: '确认',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          // 这里需要实现撤销激活的API调用
          // const response = await licenseService.revokeActivation(licenseId, activationId);
          // if (response.success) {
          //   message.success('激活已撤销');
          //   refetch();
          // } else {
          //   message.error(response.message || '撤销激活失败');
          // }
          
          // 模拟成功响应
          message.info('此功能需要实现对应的后端API');
        } catch (error) {
          console.error('撤销激活失败:', error);
          message.error('撤销激活失败');
        }
      }
    });
  };

  // 表格列定义
  const columns = [
    {
      title: '设备名称',
      dataIndex: 'deviceName',
      key: 'deviceName',
      render: (text: string, record: LicenseActivation) => (
        <Text>
          {text || record.deviceId || '未知设备'}
          {record.deviceId && 
            <Tooltip title="设备ID">
              <Text type="secondary" style={{ fontSize: '12px', marginLeft: '4px' }}>
                ({record.deviceId.substring(0, 8)}...)
              </Text>
            </Tooltip>
          }
        </Text>
      )
    },
    {
      title: '激活时间',
      dataIndex: 'activatedAt',
      key: 'activatedAt',
      render: (text: string) => formatDateTime(text)
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        let color = 'default';
        let text = '未知';
        
        switch (status) {
          case 'active':
            color = 'success';
            text = '已激活';
            break;
          case 'revoked':
            color = 'error';
            text = '已撤销';
            break;
          case 'expired':
            color = 'warning';
            text = '已过期';
            break;
          default:
            break;
        }
        
        return <Tag color={color}>{text}</Tag>;
      }
    },
    {
      title: 'IP地址',
      dataIndex: 'ipAddress',
      key: 'ipAddress',
      render: (text: string) => text || '-'
    },
    {
      title: '位置',
      dataIndex: 'location',
      key: 'location',
      render: (text: string) => text || '-'
    }
  ];

  // 如果需要显示操作按钮，添加操作列
  if (showActions) {
    columns.push({
      title: '操作',
      key: 'action',
      render: (_: any, record: LicenseActivation) => (
        <Space size="small">
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleRevokeActivation(record.id)}
            disabled={record.status !== 'active'}
          >
            撤销
          </Button>
        </Space>
      )
    } as any);
  }

  return (
    <Card 
      title={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>{title}</span>
          <Button type="link" icon={<ReloadOutlined />} onClick={() => refetch()}>
            刷新
          </Button>
        </div>
      }
      className="detail-card"
    >
      <Table 
        dataSource={activations} 
        columns={columns} 
        rowKey="id"
        pagination={{ pageSize: 5 }}
        loading={isLoading}
        locale={{ emptyText: '暂无激活记录' }}
      />
    </Card>
  );
};

export default LicenseActivationManager;
