import { Drawer, Descriptions, Spin } from 'antd';
import { ReactNode } from 'react';

interface DetailField {
  label: string;
  value: ReactNode;
  span?: number;
}

interface DetailDrawerProps {
  title: string;
  width?: number | string;
  open: boolean;
  onClose: () => void;
  loading?: boolean;
  fields: DetailField[];
}

export default function DetailDrawer({
  title,
  width = 600,
  open,
  onClose,
  loading = false,
  fields,
}: DetailDrawerProps) {
  return (
    <Drawer
      title={title}
      width={width}
      open={open}
      onClose={onClose}
      destroyOnClose
    >
      <Spin spinning={loading}>
        <Descriptions column={2} bordered>
          {fields.map((field, index) => (
            <Descriptions.Item
              key={index}
              label={field.label}
              span={field.span}
            >
              {field.value || '-'}
            </Descriptions.Item>
          ))}
        </Descriptions>
      </Spin>
    </Drawer>
  );
}
