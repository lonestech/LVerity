import React, { useState, useEffect } from 'react';
import { 
  Button, 
  Space, 
  Card, 
  DatePicker, 
  message, 
  Modal, 
  Typography,
  Popconfirm,
  Row,
  Col,
  Select,
  Tooltip,
  Drawer,
  Form,
  Switch,
  Divider,
  Tag,
  Input
} from 'antd';
import { 
  SearchOutlined, 
  DeleteOutlined, 
  EyeOutlined, 
  DownloadOutlined, 
  ClearOutlined,
  ExportOutlined,
  SettingOutlined,
  ReloadOutlined,
  FilterOutlined
} from '@ant-design/icons';
import { ProTable } from '@ant-design/pro-components';
import type { ProColumns, ActionType } from '@ant-design/pro-components';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { systemService } from '../../services/system';
import { SystemLog, SystemLogQuery } from '../../models/system';
import { formatDateTime } from '../../utils/utils';
import StatusTag from '../../components/StatusTag';
import { handleProTableRequest } from '../../utils/tableUtils';
import PageContainer from '../../components/PageContainer';

const { RangePicker } = DatePicker;
const { Text, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const SystemLogs: React.FC = () => {
  const actionRef = React.useRef<ActionType>();
  const queryClient = useQueryClient();
  const [viewLogVisible, setViewLogVisible] = useState(false);
  const [currentLog, setCurrentLog] = useState<SystemLog | null>(null);
  const [selectedRows, setSelectedRows] = useState<SystemLog[]>([]);
  const [configDrawerVisible, setConfigDrawerVisible] = useState(false);
  const [form] = Form.useForm();
  const [logConfig, setLogConfig] = useState<{
    levels: string[];
    sources: string[];
  }>({ levels: [], sources: [] });

  // 获取日志配置
  const { isLoading: isLoadingConfig } = useQuery(
    ['logConfig'],
    async () => {
      const response = await systemService.getLogConfig();
      if (response.success) {
        setLogConfig(response.data);
        form.setFieldsValue({
          levels: response.data.levels,
          sources: response.data.sources
        });
        return response.data;
      }
      throw new Error(response.message || '获取日志配置失败');
    },
    {
      onError: (error) => {
        console.error('获取日志配置失败:', error);
        message.error('获取日志配置失败');
      },
    }
  );

  // 更新日志配置
  const updateConfigMutation = useMutation(
    (values: { levels?: string[]; sources?: string[] }) => systemService.updateLogConfig(values),
    {
      onSuccess: (response) => {
        if (response.success) {
          message.success('日志配置更新成功');
          setConfigDrawerVisible(false);
          queryClient.invalidateQueries(['logConfig']);
        } else {
          message.error(response.message || '日志配置更新失败');
        }
      },
      onError: (error) => {
        console.error('更新日志配置失败:', error);
        message.error('更新日志配置失败');
      },
    }
  );

  // 清理日志的变更
  const cleanLogsMutation = useMutation(
    (type: string) => systemService.clearLogs(type),
    {
      onSuccess: (response) => {
        if (response.success) {
          message.success('日志清理成功');
          queryClient.invalidateQueries(['systemLogs']);
          actionRef.current?.reload();
        } else {
          message.error(response.message || '日志清理失败');
        }
      },
      onError: (error) => {
        console.error('清理日志失败:', error);
        message.error('日志清理失败，请查看控制台了解详情');
      },
    }
  );

  // 批量删除日志
  const batchDeleteMutation = useMutation(
    (ids: string[]) => systemService.batchDeleteLogs(ids),
    {
      onSuccess: (response) => {
        if (response.success) {
          message.success(`成功删除 ${response.data.success} 条日志`);
          if (response.data.failed > 0) {
            message.warning(`${response.data.failed} 条日志删除失败`);
          }
          queryClient.invalidateQueries(['systemLogs']);
          actionRef.current?.reload();
          setSelectedRows([]);
        } else {
          message.error(response.message || '批量删除日志失败');
        }
      },
      onError: (error) => {
        console.error('批量删除日志失败:', error);
        message.error('批量删除日志失败');
      },
    }
  );

  // 查看日志详情
  const handleViewLog = (log: SystemLog) => {
    setCurrentLog(log);
    setViewLogVisible(true);
  };

  // 导出日志
  const handleExportLogs = () => {
    // 构建查询参数
    const params: SystemLogQuery = {};
    const formValues = form.getFieldsValue();
    
    // 获取ProTable当前筛选条件
    const searchParams = actionRef.current?.getPageInfo?.() || {};
    
    // 合并参数
    Object.assign(params, searchParams);
    
    // 调用导出API
    systemService.exportLogs(params);
    message.success('日志导出请求已提交，请等待下载开始');
  };

  // 提交表单
  const handleSubmitConfig = async () => {
    try {
      const values = await form.validateFields();
      updateConfigMutation.mutate(values);
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  // 构建日志级别下拉选项
  const logLevelOptions = [
    { value: 'info', label: '信息', color: 'processing' },
    { value: 'warning', label: '警告', color: 'warning' },
    { value: 'error', label: '错误', color: 'error' },
    { value: 'debug', label: '调试', color: 'default' },
  ];

  // ProTable的列定义
  const columns: ProColumns<SystemLog>[] = [
    {
      title: '级别',
      dataIndex: 'level',
      key: 'level',
      width: 100,
      filters: logLevelOptions.map(option => ({ text: option.label, value: option.value })),
      valueEnum: {
        info: { text: '信息', status: 'Processing' },
        warning: { text: '警告', status: 'Warning' },
        error: { text: '错误', status: 'Error' },
        debug: { text: '调试', status: 'Default' },
      },
      render: (_, record) => (
        <StatusTag 
          status={record.level} 
          customMapping={{
            info: { color: 'processing', text: '信息', icon: undefined },
            warning: { color: 'warning', text: '警告', icon: undefined },
            error: { color: 'error', text: '错误', icon: undefined },
            debug: { color: 'default', text: '调试', icon: undefined },
          }}
        />
      ),
    },
    {
      title: '来源',
      dataIndex: 'source',
      key: 'source',
      width: 120,
      ellipsis: true,
      filters: logConfig.sources.map(source => ({ text: source, value: source })),
    },
    {
      title: '消息',
      dataIndex: 'message',
      key: 'message',
      ellipsis: true,
    },
    {
      title: '用户',
      dataIndex: 'username',
      key: 'username',
      width: 120,
      ellipsis: true,
      render: (username: string) => username || '-',
    },
    {
      title: '时间',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 180,
      valueType: 'dateTime',
      sorter: true,
      render: (date: string) => formatDateTime(date),
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      valueType: 'option',
      render: (_, record) => [
        <Button
          key="view"
          type="link"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => handleViewLog(record)}
        >
          查看
        </Button>
      ],
    },
  ];

  return (
    <PageContainer title="系统日志">
      <ProTable<SystemLog, SystemLogQuery>
        actionRef={actionRef}
        rowKey="id"
        columns={columns}
        search={{
          labelWidth: 'auto',
          defaultCollapsed: false,
          filterType: 'query',
          searchText: '搜索',
          resetText: '重置',
        }}
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
        }}
        dateFormatter="string"
        request={(params, sort, filter) => 
          handleProTableRequest<SystemLog, SystemLogQuery>(
            systemService.getSystemLogs, 
            params, 
            sort, 
            filter,
            'keyword',
            (params) => {
              // 处理日期范围
              if (params._timestamp && Array.isArray(params._timestamp) && params._timestamp.length === 2) {
                const [start, end] = params._timestamp;
                params.startTime = start;
                params.endTime = end;
                delete params._timestamp;
              }
              return params;
            }
          )
        }
        rowSelection={{
          onChange: (_, selectedRows) => {
            setSelectedRows(selectedRows);
          },
        }}
        toolBarRender={() => [
          <Button
            key