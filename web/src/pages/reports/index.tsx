import React, { useState, useEffect } from 'react';
import { 
  Row, 
  Col, 
  Card, 
  Tabs, 
  Button, 
  Space, 
  DatePicker, 
  Select, 
  Typography, 
  Table, 
  Tooltip, 
  message 
} from 'antd';
import { 
  LineChartOutlined, 
  BarChartOutlined, 
  PieChartOutlined, 
  DownloadOutlined, 
  ReloadOutlined, 
  SearchOutlined,
  CalendarOutlined,
  SyncOutlined
} from '@ant-design/icons';
import { Line, Bar, Pie } from '@ant-design/charts';
import moment from 'moment';
import PageContainer from '../../components/PageContainer';
import { reportService } from '../../services/report';
import { formatDateTime } from '../../utils/utils';

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { RangePicker } = DatePicker;
const { Option } = Select;

interface ChartData {
  name: string;
  value: number;
  type: string;
  date?: string;
}

const ReportPage: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('license');
  const [dateRange, setDateRange] = useState<[moment.Moment, moment.Moment]>([
    moment().subtract(30, 'days'),
    moment()
  ]);
  const [interval, setInterval] = useState<string>('daily');
  const [licenseData, setLicenseData] = useState<ChartData[]>([]);
  const [deviceData, setDeviceData] = useState<ChartData[]>([]);
  const [usageData, setUsageData] = useState<ChartData[]>([]);
  const [tableData, setTableData] = useState<any[]>([]);
  
  // 加载报表数据
  const loadReportData = async () => {
    setLoading(true);
    try {
      const params = {
        startDate: dateRange[0].format('YYYY-MM-DD'),
        endDate: dateRange[1].format('YYYY-MM-DD'),
        interval: interval,
      };
      
      if (activeTab === 'license' || activeTab === 'overview') {
        const licenseResponse = await reportService.getLicenseReport(params);
        if (licenseResponse.success) {
          setLicenseData(licenseResponse.data);
        }
      }
      
      if (activeTab === 'device' || activeTab === 'overview') {
        const deviceResponse = await reportService.getDeviceReport(params);
        if (deviceResponse.success) {
          setDeviceData(deviceResponse.data);
        }
      }
      
      if (activeTab === 'usage' || activeTab === 'overview') {
        const usageResponse = await reportService.getUsageReport(params);
        if (usageResponse.success) {
          setUsageData(usageResponse.data);
        }
      }
      
      // 加载表格数据
      if (activeTab !== 'overview') {
        const tableResponse = await reportService.getReportTable(activeTab, params);
        if (tableResponse.success) {
          setTableData(tableResponse.data);
        }
      }
    } catch (error) {
      console.error('加载报表数据失败:', error);
      message.error('加载报表数据失败');
    } finally {
      setLoading(false);
    }
  };
  
  // 组件加载和参数变化时获取数据
  useEffect(() => {
    loadReportData();
  }, [activeTab, dateRange, interval]);
  
  // 处理标签页切换
  const handleTabChange = (key: string) => {
    setActiveTab(key);
  };
  
  // 处理日期范围变更
  const handleDateRangeChange = (dates: any) => {
    if (dates) {
      setDateRange([dates[0], dates[1]]);
    }
  };
  
  // 处理时间间隔变更
  const handleIntervalChange = (value: string) => {
    setInterval(value);
  };
  
  // 导出报表
  const handleExport = async () => {
    try {
      const params = {
        startDate: dateRange[0].format('YYYY-MM-DD'),
        endDate: dateRange[1].format('YYYY-MM-DD'),
        interval: interval,
        type: activeTab,
      };
      
      const response = await reportService.exportReport(params);
      if (response.success && response.data.url) {
        // 创建一个临时链接并点击下载
        const link = document.createElement('a');
        link.href = response.data.url;
        link.download = `${activeTab}_report.xlsx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        message.success('导出成功');
      } else {
        message.error(response.message || '导出失败');
      }
    } catch (error) {
      console.error('导出失败:', error);
      message.error('导出失败');
    }
  };
  
  // 刷新数据
  const handleRefresh = () => {
    loadReportData();
  };
  
  // 折线图配置
  const lineConfig = {
    data: activeTab === 'license' ? licenseData : 
          activeTab === 'device' ? deviceData : 
          activeTab === 'usage' ? usageData : licenseData,
    xField: 'date',
    yField: 'value',
    seriesField: 'type',
    smooth: true,
    animation: {
      appear: {
        animation: 'path-in',
        duration: 1000,
      },
    },
    point: {
      size: 4,
      shape: 'circle',
    },
    label: {},
    legend: {
      position: 'top',
    },
    tooltip: {
      showMarkers: false,
    },
  };
  
  // 柱状图配置
  const barConfig = {
    data: activeTab === 'license' ? licenseData : 
          activeTab === 'device' ? deviceData : 
          activeTab === 'usage' ? usageData : licenseData,
    isGroup: true,
    xField: 'date',
    yField: 'value',
    seriesField: 'type',
    label: {
      position: 'middle',
      layout: [
        {
          type: 'interval-adjust-position',
        },
        {
          type: 'interval-hide-overlap',
        },
        {
          type: 'adjust-color',
        },
      ],
    },
    legend: {
      position: 'top',
    },
  };
  
  // 饼图配置
  const pieConfig = {
    data: activeTab === 'license' ? 
          licenseData.filter(item => item.date === licenseData[licenseData.length - 1]?.date) : 
          activeTab === 'device' ? 
          deviceData.filter(item => item.date === deviceData[deviceData.length - 1]?.date) : 
          activeTab === 'usage' ? 
          usageData.filter(item => item.date === usageData[usageData.length - 1]?.date) : 
          licenseData.filter(item => item.date === licenseData[licenseData.length - 1]?.date),
    angleField: 'value',
    colorField: 'type',
    radius: 0.8,
    label: {
      type: 'outer',
      content: '{name}: {percentage}',
    },
    interactions: [
      {
        type: 'element-active',
      },
    ],
  };
  
  // 许可证表格列
  const licenseColumns = [
    {
      title: '授权ID',
      dataIndex: 'id',
      key: 'id',
      width: 100,
    },
    {
      title: '授权码',
      dataIndex: 'key',
      key: 'key',
      width: 200,
      ellipsis: true,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
    },
    {
      title: '客户',
      dataIndex: 'customerName',
      key: 'customerName',
      width: 150,
    },
    {
      title: '设备数',
      dataIndex: 'deviceCount',
      key: 'deviceCount',
      width: 100,
    },
    {
      title: '发放日期',
      dataIndex: 'issuedAt',
      key: 'issuedAt',
      width: 150,
      render: (date: string) => formatDateTime(date),
    },
    {
      title: '过期日期',
      dataIndex: 'expiresAt',
      key: 'expiresAt',
      width: 150,
      render: (date: string) => formatDateTime(date),
    },
  ];
  
  // 设备表格列
  const deviceColumns = [
    {
      title: '设备ID',
      dataIndex: 'id',
      key: 'id',
      width: 100,
    },
    {
      title: '设备名称',
      dataIndex: 'name',
      key: 'name',
      width: 150,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
    },
    {
      title: '授权码',
      dataIndex: 'licenseKey',
      key: 'licenseKey',
      width: 150,
      ellipsis: true,
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 100,
    },
    {
      title: '注册时间',
      dataIndex: 'registeredAt',
      key: 'registeredAt',
      width: 150,
      render: (date: string) => formatDateTime(date),
    },
    {
      title: '上次活动',
      dataIndex: 'lastSeen',
      key: 'lastSeen',
      width: 150,
      render: (date: string) => formatDateTime(date),
    },
  ];
  
  // 使用量表格列
  const usageColumns = [
    {
      title: '设备ID',
      dataIndex: 'deviceId',
      key: 'deviceId',
      width: 100,
    },
    {
      title: '设备名称',
      dataIndex: 'deviceName',
      key: 'deviceName',
      width: 150,
    },
    {
      title: '授权码',
      dataIndex: 'licenseKey',
      key: 'licenseKey',
      width: 150,
      ellipsis: true,
    },
    {
      title: '使用时长(小时)',
      dataIndex: 'usageHours',
      key: 'usageHours',
      width: 150,
    },
    {
      title: '会话数',
      dataIndex: 'sessionCount',
      key: 'sessionCount',
      width: 100,
    },
    {
      title: '日期',
      dataIndex: 'date',
      key: 'date',
      width: 150,
    },
  ];
  
  // 根据活动标签获取表格列
  const getColumns = () => {
    if (activeTab === 'license') return licenseColumns;
    if (activeTab === 'device') return deviceColumns;
    if (activeTab === 'usage') return usageColumns;
    return licenseColumns;
  };
  
  // 获取图表标题
  const getChartTitle = () => {
    if (activeTab === 'license') return '授权统计';
    if (activeTab === 'device') return '设备统计';
    if (activeTab === 'usage') return '使用量统计';
    return '概览';
  };

  return (
    <PageContainer 
      title="报表与统计" 
      loading={loading}
      extra={
        <Space>
          <RangePicker 
            value={dateRange}
            onChange={handleDateRangeChange}
            style={{ width: 250 }}
            ranges={{
              '今天': [moment(), moment()],
              '昨天': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
              '本周': [moment().startOf('week'), moment().endOf('week')],
              '本月': [moment().startOf('month'), moment().endOf('month')],
              '上月': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')],
              '最近7天': [moment().subtract(6, 'days'), moment()],
              '最近30天': [moment().subtract(29, 'days'), moment()],
              '最近90天': [moment().subtract(89, 'days'), moment()],
            }}
          />
          <Select
            value={interval}
            onChange={handleIntervalChange}
            style={{ width: 120 }}
          >
            <Option value="daily">按日</Option>
            <Option value="weekly">按周</Option>
            <Option value="monthly">按月</Option>
          </Select>
          <Button 
            icon={<DownloadOutlined />} 
            onClick={handleExport}
          >
            导出报表
          </Button>
          <Button 
            icon={<ReloadOutlined />} 
            onClick={handleRefresh}
          >
            刷新
          </Button>
        </Space>
      }
    >
      <Tabs
        activeKey={activeTab}
        onChange={handleTabChange}
        tabBarStyle={{ marginBottom: 16 }}
        items={[
          {
            key: 'overview',
            label: (
              <span>
                <LineChartOutlined />
                概览
              </span>
            )
          },
          {
            key: 'license',
            label: (
              <span>
                <SafetyCertificateOutlined />
                授权报表
              </span>
            )
          },
          {
            key: 'device',
            label: (
              <span>
                <DesktopOutlined />
                设备报表
              </span>
            )
          },
          {
            key: 'usage',
            label: (
              <span>
                <BarChartOutlined />
                使用量报表
              </span>
            )
          }
        ]}
      />

      {activeTab === 'overview' ? (
        // 概览视图
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Card title="授权统计" className="chart-card">
              <Line {...lineConfig} data={licenseData} height={300} />
            </Card>
          </Col>
          <Col span={24}>
            <Card title="设备统计" className="chart-card">
              <Line {...lineConfig} data={deviceData} height={300} />
            </Card>
          </Col>
          <Col span={24}>
            <Card title="使用量统计" className="chart-card">
              <Bar {...barConfig} data={usageData} height={300} />
            </Card>
          </Col>
        </Row>
      ) : (
        // 详细视图
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={16}>
            <Card title={`${getChartTitle()} - 趋势图`} className="chart-card">
              <Line {...lineConfig} height={300} />
            </Card>
          </Col>
          <Col xs={24} lg={8}>
            <Card title={`${getChartTitle()} - 分布图`} className="chart-card">
              <Pie {...pieConfig} height={300} />
            </Card>
          </Col>
          <Col span={24}>
            <Card title={`${getChartTitle()} - 详细数据`}>
              <Table
                columns={getColumns()}
                dataSource={tableData}
                rowKey="id"
                pagination={{ pageSize: 10 }}
                scroll={{ x: 1000 }}
              />
            </Card>
          </Col>
        </Row>
      )}
    </PageContainer>
  );
};

export default ReportPage;
