import { PageContainer } from '@ant-design/pro-components';
import { Card, Row, Col, Statistic, Spin } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { statsService } from '@/services/stats';
import type { SystemOverview, DeviceStats, LicenseStats, AlertStats } from '@/models/stats';

export default function Dashboard() {
  // 获取系统概览数据
  const { data: overview, isLoading: overviewLoading } = useQuery<SystemOverview>({
    queryKey: ['stats', 'overview'],
    queryFn: async () => {
      const response = await statsService.getOverview();
      return response.data as SystemOverview;
    },
  });

  // 获取设备统计数据
  const { data: deviceStats, isLoading: deviceLoading } = useQuery<DeviceStats>({
    queryKey: ['stats', 'devices'],
    queryFn: async () => {
      const response = await statsService.getDeviceStats();
      return response.data as DeviceStats;
    },
  });

  // 获取许可证统计数据
  const { data: licenseStats, isLoading: licenseLoading } = useQuery<LicenseStats>({
    queryKey: ['stats', 'licenses'],
    queryFn: async () => {
      const response = await statsService.getLicenseStats();
      return response.data as LicenseStats;
    },
  });

  // 获取告警统计数据
  const { data: alertStats, isLoading: alertLoading } = useQuery<AlertStats>({
    queryKey: ['stats', 'alerts'],
    queryFn: async () => {
      const response = await statsService.getAlertStats();
      return response.data as AlertStats;
    },
  });

  const isLoading = overviewLoading || deviceLoading || licenseLoading || alertLoading;

  return (
    <PageContainer>
      <Spin spinning={isLoading}>
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Card title="系统概览">
              <Row gutter={16}>
                <Col span={6}>
                  <Statistic title="总用户数" value={overview?.totalUsers || 0} />
                </Col>
                <Col span={6}>
                  <Statistic title="总设备数" value={overview?.totalDevices || 0} />
                </Col>
                <Col span={6}>
                  <Statistic title="总许可证数" value={overview?.totalLicenses || 0} />
                </Col>
                <Col span={6}>
                  <Statistic title="活跃告警数" value={overview?.activeAlerts || 0} />
                </Col>
              </Row>
            </Card>
          </Col>
          <Col span={8}>
            <Card title="设备状态">
              <Row gutter={16}>
                <Col span={8}>
                  <Statistic title="在线" value={deviceStats?.online || 0} />
                </Col>
                <Col span={8}>
                  <Statistic title="离线" value={deviceStats?.offline || 0} />
                </Col>
                <Col span={8}>
                  <Statistic title="维护中" value={deviceStats?.maintenance || 0} />
                </Col>
              </Row>
            </Card>
          </Col>
          <Col span={8}>
            <Card title="许可证状态">
              <Row gutter={16}>
                <Col span={8}>
                  <Statistic title="生效中" value={licenseStats?.active || 0} />
                </Col>
                <Col span={8}>
                  <Statistic title="已过期" value={licenseStats?.expired || 0} />
                </Col>
                <Col span={8}>
                  <Statistic title="已吊销" value={licenseStats?.revoked || 0} />
                </Col>
              </Row>
            </Card>
          </Col>
          <Col span={8}>
            <Card title="系统告警">
              <Row gutter={16}>
                <Col span={8}>
                  <Statistic title="严重" value={alertStats?.critical || 0} />
                </Col>
                <Col span={8}>
                  <Statistic title="警告" value={alertStats?.warning || 0} />
                </Col>
                <Col span={8}>
                  <Statistic title="信息" value={alertStats?.info || 0} />
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
      </Spin>
    </PageContainer>
  );
}
