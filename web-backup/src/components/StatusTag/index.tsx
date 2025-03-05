import { Tag } from 'antd';
import { ReactNode } from 'react';

interface StatusConfig {
  color: string;
  text: ReactNode;
}

interface StatusTagProps {
  status: string;
  text?: ReactNode;
}

// 定义通用状态配置
const statusConfigs: Record<string, StatusConfig> = {
  // 设备状态
  normal: { color: 'success', text: '正常' },
  offline: { color: 'default', text: '离线' },
  blocked: { color: 'error', text: '已封禁' },
  suspect: { color: 'warning', text: '可疑' },
  disabled: { color: 'warning', text: '已禁用' },
  
  // 授权状态
  active: { color: 'success', text: '已激活' },
  expired: { color: 'error', text: '已过期' },
  revoked: { color: 'default', text: '已吊销' },
  waiting: { color: 'processing', text: '待激活' },
  
  // 用户状态
  inactive: { color: 'default', text: '禁用' },
  suspended: { color: 'warning', text: '暂停' },
};

export default function StatusTag({ status, text }: StatusTagProps) {
  const config = statusConfigs[status] || { color: 'default', text: status };
  
  return (
    <Tag color={config.color}>
      {text || config.text}
    </Tag>
  );
}
