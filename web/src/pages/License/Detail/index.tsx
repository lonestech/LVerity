import { PageContainer } from '@ant-design/pro-components';
import { Card, Descriptions, Tabs, Timeline } from 'antd';
import React, { useEffect, useState } from 'react';
import { useParams } from '@umijs/max';
import { getLicenseDetail } from '@/services/license';

const LicenseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [license, setLicense] = useState<API.License>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLicenseDetail = async () => {
      try {
        const response = await getLicenseDetail(id!);
        if (response.success) {
          setLicense(response.data);
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchLicenseDetail();
    }
  }, [id]);

  const items = [
    {
      key: 'basic',
      label: '基本信息',
      children: (
        <Card loading={loading}>
          <Descriptions column={2}>
            <Descriptions.Item label="授权码">{license?.code}</Descriptions.Item>
            <Descriptions.Item label="类型">{license?.type}</Descriptions.Item>
            <Descriptions.Item label="状态">{license?.status}</Descriptions.Item>
            <Descriptions.Item label="设备ID">{license?.device_id}</Descriptions.Item>
            <Descriptions.Item label="创建时间">{license?.created_at}</Descriptions.Item>
            <Descriptions.Item label="更新时间">{license?.updated_at}</Descriptions.Item>
            <Descriptions.Item label="创建者">{license?.created_by}</Descriptions.Item>
            <Descriptions.Item label="更新者">{license?.updated_by}</Descriptions.Item>
            <Descriptions.Item label="描述" span={2}>
              {license?.description}
            </Descriptions.Item>
          </Descriptions>
        </Card>
      ),
    },
    {
      key: 'usage',
      label: '使用记录',
      children: (
        <Card loading={loading}>
          <Timeline>
            <Timeline.Item>首次激活 2025-01-01 12:00:00</Timeline.Item>
            <Timeline.Item>更新授权 2025-01-02 14:30:00</Timeline.Item>
            <Timeline.Item>设备绑定 2025-01-03 09:15:00</Timeline.Item>
          </Timeline>
        </Card>
      ),
    },
  ];

  return (
    <PageContainer
      header={{
        title: '授权详情',
        subTitle: `授权码：${license?.code}`,
      }}
    >
      <Tabs items={items} />
    </PageContainer>
  );
};

export default LicenseDetail;
