import React from 'react';
import { Card, Descriptions, DescriptionsProps } from 'antd';
import { EditOutlined } from '@ant-design/icons';

interface DetailCardProps {
  title: string;
  items: DescriptionsProps['items'];
  loading?: boolean;
  extra?: React.ReactNode;
  onEdit?: () => void;
}

/**
 * 详情卡片组件
 * 用于展示实体的详细信息
 */
const DetailCard: React.FC<DetailCardProps> = ({ title, items, loading = false, extra, onEdit }) => {
  return (
    <Card
      title={title}
      loading={loading}
      extra={
        <>
          {onEdit && (
            <EditOutlined 
              style={{ marginRight: 16, cursor: 'pointer' }} 
              onClick={onEdit} 
            />
          )}
          {extra}
        </>
      }
    >
      <Descriptions layout="vertical" column={{ xs: 1, sm: 2, md: 3 }} items={items} />
    </Card>
  );
};

export default DetailCard;
