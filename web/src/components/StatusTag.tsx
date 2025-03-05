import React from 'react';
import { Tag } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, ExclamationCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';

interface StatusTagProps {
  status: string;
  customMapping?: Record<string, { color: string; text: string; icon?: React.ReactNode }>;
}

/**
 * 状态标签组件
 * 根据状态显示不同的标签颜色和图标
 */
const StatusTag: React.FC<StatusTagProps> = ({ status, customMapping }) => {
  // 默认状态映射配置
  const defaultMapping: Record<string, { color: string; text: string; icon: React.ReactNode }> = {
    active: { color: 'success', text: '活跃', icon: <CheckCircleOutlined /> },
    inactive: { color: 'default', text: '未活跃', icon: <ClockCircleOutlined /> },
    online: { color: 'success', text: '在线', icon: <CheckCircleOutlined /> },
    offline: { color: 'default', text: '离线', icon: <ClockCircleOutlined /> },
    expired: { color: 'error', text: '已过期', icon: <CloseCircleOutlined /> },
    suspended: { color: 'warning', text: '已暂停', icon: <ExclamationCircleOutlined /> },
    pending: { color: 'processing', text: '待处理', icon: <ClockCircleOutlined /> },
    approved: { color: 'success', text: '已批准', icon: <CheckCircleOutlined /> },
    rejected: { color: 'error', text: '已拒绝', icon: <CloseCircleOutlined /> },
    warning: { color: 'warning', text: '警告', icon: <ExclamationCircleOutlined /> },
    error: { color: 'error', text: '错误', icon: <CloseCircleOutlined /> },
  };

  // 合并自定义配置
  const mapping = customMapping ? { ...defaultMapping, ...customMapping } : defaultMapping;

  // 获取状态配置，如果没有匹配的状态，则显示原始状态文本
  const statusConfig = mapping[status.toLowerCase()] || {
    color: 'default',
    text: status,
    icon: undefined,
  };

  return (
    <Tag color={statusConfig.color} icon={statusConfig.icon}>
      {statusConfig.text}
    </Tag>
  );
};

export default StatusTag;
