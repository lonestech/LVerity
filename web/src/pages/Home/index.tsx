import React from 'react';
import { PageContainer } from '@ant-design/pro-components';
import { Card, Row, Col, Statistic } from 'antd';

const HomePage: React.FC = () => {
  return (
    <PageContainer>
      <Row gutter={16}>
        <Col span={6}>
          <Card>
            <Statistic title="总授权数" value={0} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="活跃设备" value={0} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="用户数" value={0} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="今日授权" value={0} />
          </Card>
        </Col>
      </Row>
    </PageContainer>
  );
};

export default HomePage;
