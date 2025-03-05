import { Drawer, Descriptions, Spin } from 'antd';
import { ReactNode } from 'react';

interface DetailField {
  label: string;
  key: string;
  span?: number;
  render?: (value: any, record: any) => ReactNode;
}

interface DetailDrawerProps {
  title: string;
  width?: number | string;
  visible: boolean;
  onClose: () => void;
  loading?: boolean;
  data: any;
  fields: DetailField[];
}

export default function DetailDrawer({
  title,
  width = 600,
  visible,
  onClose,
  loading = false,
  data,
  fields,
}: DetailDrawerProps) {
  return (
    <Drawer
      title={title}
      width={width}
      open={visible}
      onClose={onClose}
      destroyOnClose
    >
      <Spin spinning={loading}>
        {data ? (
          <Descriptions column={2} bordered>
            {fields.map((field, index) => {
              const value = data[field.key];
              let displayValue: ReactNode = value;
              
              if (field.render) {
                displayValue = field.render(value, data);
              }
              
              return (
                <Descriptions.Item
                  key={index}
                  label={field.label}
                  span={field.span}
                >
                  {displayValue !== undefined && displayValue !== null ? displayValue : '-'}
                </Descriptions.Item>
              );
            })}
          </Descriptions>
        ) : (
          <div style={{ textAlign: 'center', padding: '30px 0' }}>
            暂无数据
          </div>
        )}
      </Spin>
    </Drawer>
  );
}
