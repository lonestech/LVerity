import { Tag } from 'antd';
import { ReactNode } from 'react';

interface StatusConfig {
  color: string;
  text: ReactNode;
}

interface StatusTagProps {
  status: string;
  type: 'device' | 'license' | 'user';
}

const statusConfigs: Record<string, Record<string, StatusConfig>> = {
  device: {
    online: { color: 'success', text: '在线' },
    offline: { color: 'default', text: '离线' },
    maintenance: { color: 'warning', text: '维护中' },
  },
  license: {
    active: { color: 'success', text: '生效中' },
    expired: { color: 'error', text: '已过期' },
    revoked: { color: 'default', text: '已吊销' },
  },
  user: {
    active: { color: 'success', text: '正常' },
    inactive: { color: 'default', text: '禁用' },
  },
};

export default function StatusTag({ status, type }: StatusTagProps) {
  const config = statusConfigs[type]?.[status] || { color: 'default', text: status };
  
  return (
    <Tag color={config.color}>
      {config.text}
    </Tag>
  );
}
