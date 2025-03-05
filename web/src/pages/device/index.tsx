import React, { useState } from 'react';
import { 
  Button, 
  Space, 
  Popconfirm, 
  message, 
  Typography,
  Tooltip,
  Tag,
  Badge,
  Dropdown,
  Menu
} from 'antd';
import { 
  SearchOutlined, 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  EyeOutlined, 
  ReloadOutlined,
  ApiOutlined,
  PoweroffOutlined,
  DownOutlined,
  ClearOutlined,
  QuestionCircleOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { ProTable } from '@ant-design/pro-components';
import type { ProColumns, ActionType } from '@ant-design/pro-components';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import PageContainer from '../../components/PageContainer';
import StatusTag from '../../components/StatusTag';
import { deviceService } from '../../services/device';
import { Device, DeviceQuery } from '../../models/device';
import { formatDateTime, formatFileSize } from '../../utils/utils';
import { handleProTableRequest } from '../../utils/tableUtils';

const { Text } = Typography;

const DevicePage: React.FC = () => {
  const navigate = useNavigate();
  const actionRef = React.useRef<ActionType>();
  const queryClient = useQueryClient();
  const [selectedRows, setSelectedRows] = useState<Device[]>([]);
  const [loading, setLoading] = useState({
    activating: false,
    deactivating: false,
    deleting: false,
    unregistering: false
  });

  // 激活设备的变更
  const activateMutation = useMutation(
    (id: string) => deviceService.activateDevice(id),
    {
      onSuccess: () => {
        message.success('设备激活成功');
        queryClient.invalidateQueries(['devices']);
        actionRef.current?.reload();
      },
      onError: (error) => {
        console.error('设备激活失败:', error);
        message.error('设备激活失败');
      },
    }
  );

  // 停用设备的变更
  const deactivateMutation = useMutation(
    (id: string) => deviceService.deactivateDevice(id),
    {
      onSuccess: () => {
        message.success('设备停用成功');
        queryClient.invalidateQueries(['devices']);
        actionRef.current?.reload();
      },
      onError: (error) => {
        console.error('设备停用失败:', error);
        message.error('设备停用失败');
      },
    }
  );

  // 重启设备的变更
  const restartMutation = useMutation(
    (id: string) => deviceService.restartDevice(id),
    {
      onSuccess: () => {
        message.success('设备重启命令已发送');
      },
      onError: (error) => {
        console.error('设备重启失败:', error);
        message.error('设备重启失败');
      },
    }
  );

  // 删除设备的变更
  const deleteMutation = useMutation(
    (id: string) => deviceService.deleteDevice(id),
    {
      onSuccess: () => {
        message.success('删除设备成功');
        queryClient.invalidateQueries(['devices']);
        actionRef.current?.reload();
      },
      onError: (error) => {
        console.error('删除设备失败:', error);
        message.error('删除设备失败');
      },
    }
  );

  // 注销设备的变更
  const unregisterMutation = useMutation(
    (id: string) => deviceService.unregisterDevice(id),
    {
      onSuccess: () => {
        message.success('设备注销成功');
        queryClient.invalidateQueries(['devices']);
        actionRef.current?.reload();
      },
      onError: (error) => {
        console.error('设备注销失败:', error);
        message.error('设备注销失败');
      },
    }
  );

  // 批量管理设备的变更
  const batchManageMutation = useMutation(
    ({ ids, action }: { ids: string[], action: 'activate' | 'deactivate' | 'delete' | 'unregister' }) => 
      deviceService.batchManageDevices(ids, action),
    {
      onSuccess: (_, variables) => {
        const actionText = {
          'activate': '激活',
          'deactivate': '停用',
          'delete': '删除',
          'unregister': '注销'
        }[variables.action];
        
        message.success(`批量${actionText}设备成功`);
        queryClient.invalidateQueries(['devices']);
        actionRef.current?.reload();
        setSelectedRows([]);
      },
      onError: (error, variables) => {
        const actionText = {
          'activate': '激活',
          'deactivate': '停用',
          'delete': '删除',
          'unregister': '注销'
        }[variables.action];
        
        console.error(`批量${actionText}失败:`, error);
        message.error(`批量${actionText}失败`);
      },
    }
  );

  // 重置过滤条件
  const resetFilters = async () => {
    try {
      await deviceService.resetDeviceFilters();
      message.success('过滤条件已重置');
      actionRef.current?.reset?.();
    } catch (error) {
      console.error('重置过滤条件失败:', error);
      message.error('重置过滤条件失败');
    }
  };

  // 在线状态描述
  const getStatusDesc = (status: string, lastSeen?: string) => {
    if (status === 'online') {
      return <Badge status="success" text="在线" />;
    } else if (status === 'offline') {
      const lastSeenText = lastSeen ? `上次在线: ${formatDateTime(lastSeen)}` : '从未在线';
      return (
        <Tooltip title={lastSeenText}>
          <Badge status="default" text="离线" />
        </Tooltip>
      );
    } else if (status === 'inactive') {
      return <Badge status="error" text="停用" />;
    }
    return <Badge status="warning" text="未知" />;
  };

  // ProTable的列定义
  const columns: ProColumns<Device>[] = [
    {
      title: '设备名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      ellipsis: true,
      render: (name: string, record: Device) => (
        <div>
          <div>{name}</div>
          <div style={{ fontSize: '12px', color: 'rgba(0, 0, 0, 0.45)' }}>
            {record.deviceId}
          </div>
        </div>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      filters: [
        { text: '在线', value: 'online' },
        { text: '离线', value: 'offline' },
        { text: '停用', value: 'inactive' },
      ],
      valueEnum: {
        online: { text: '在线', status: 'Success' },
        offline: { text: '离线', status: 'Default' },
        inactive: { text: '停用', status: 'Error' },
      },
      render: (_, record) => getStatusDesc(record.status, record.lastSeen),
    },
    {
      title: '设备类型',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      filters: [
        { text: '工作站', value: 'workstation' },
        { text: '服务器', value: 'server' },
        { text: '终端', value: 'terminal' },
        { text: '移动设备', value: 'mobile' },
      ],
      valueEnum: {
        workstation: { text: '工作站' },
        server: { text: '服务器' },
        terminal: { text: '终端' },
        mobile: { text: '移动设备' },
      },
    },
    {
      title: '授权',
      dataIndex: 'licenseName',
      key: 'licenseName',
      width: 150,
      ellipsis: true,
      render: (_, record) => record.licenseName || '未授权',
    },
    {
      title: 'IP地址',
      dataIndex: 'ipAddress',
      key: 'ipAddress',
      width: 150,
      copyable: true,
    },
    {
      title: '操作系统',
      dataIndex: 'osInfo',
      key: 'osInfo',
      width: 150,
      ellipsis: true,
    },
    {
      title: '版本',
      dataIndex: 'appVersion',
      key: 'appVersion',
      width: 120,
    },
    {
      title: '最后活动',
      dataIndex: 'lastActive',
      key: 'lastActive',
      width: 180,
      valueType: 'dateTime',
      sorter: true,
      render: (_, record) => formatDateTime(record.lastActive),
    },
    {
      title: '存储使用',
      dataIndex: 'storageUsed',
      key: 'storageUsed',
      width: 120,
      render: (_, record) => {
        if (record.storageUsed && record.storageTotal) {
          const percent = Math.round((record.storageUsed / record.storageTotal) * 100);
          return (
            <Tooltip title={`${formatFileSize(record.storageUsed)} / ${formatFileSize(record.storageTotal)}`}>
              <div>
                {formatFileSize(record.storageUsed)}
                <div style={{ fontSize: '12px', color: 'rgba(0, 0, 0, 0.45)' }}>
                  {percent}% 已用
                </div>
              </div>
            </Tooltip>
          );
        }
        return '-';
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 240,
      valueType: 'option',
      render: (_, record) => [
        <Button
          key="view"
          type="link"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => navigate(`/device/detail/${record.id}`)}
        >
          查看
        </Button>,
        <Button
          key="edit"
          type="link"
          size="small"
          icon={<EditOutlined />}
          onClick={() => navigate(`/device/edit/${record.id}`)}
        >
          编辑
        </Button>,
        record.status !== 'inactive' ? (
          <Popconfirm
            key="deactivate"
            title="确定要停用此设备吗？"
            onConfirm={() => deactivateMutation.mutate(record.id)}
          >
            <Button
              type="link"
              size="small"
              danger
              icon={<PoweroffOutlined />}
              loading={deactivateMutation.isLoading}
            >
              停用
            </Button>
          </Popconfirm>
        ) : (
          <Popconfirm
            key="activate"
            title="确定要激活此设备吗？"
            onConfirm={() => activateMutation.mutate(record.id)}
          >
            <Button
              type="link"
              size="small"
              icon={<PoweroffOutlined />}
              loading={activateMutation.isLoading}
            >
              激活
            </Button>
          </Popconfirm>
        ),
        record.status === 'online' && (
          <Popconfirm
            key="restart"
            title="确定要重启此设备吗？"
            onConfirm={() => restartMutation.mutate(record.id)}
          >
            <Button
              type="link"
              size="small"
              icon={<ReloadOutlined />}
              loading={restartMutation.isLoading}
            >
              重启
            </Button>
          </Popconfirm>
        ),
        <Popconfirm
          key="delete"
          title="确定要删除此设备吗？"
          onConfirm={() => deleteMutation.mutate(record.id)}
        >
          <Button
            type="link"
            size="small"
            danger
            icon={<DeleteOutlined />}
            loading={deleteMutation.isLoading}
          >
            删除
          </Button>
        </Popconfirm>,
        <Popconfirm
          key="unregister"
          title="确定要注销此设备吗？注销后需要重新注册。"
          onConfirm={() => unregisterMutation.mutate(record.id)}
        >
          <Button
            type="link"
            size="small"
            danger
            icon={<ApiOutlined />}
            loading={unregisterMutation.isLoading}
          >
            注销
          </Button>
        </Popconfirm>,
      ],
    },
  ];

  // 批量操作菜单
  const batchActionMenu = (
    <Menu onClick={({ key }) => {
      const ids = selectedRows.map(row => row.id);
      
      if (key === 'activate' || key === 'deactivate' || key === 'delete' || key === 'unregister') {
        const actionText = {
          'activate': '激活',
          'deactivate': '停用',
          'delete': '删除',
          'unregister': '注销'
        }[key];
        
        if (window.confirm(`确定要批量${actionText}选中的设备吗？`)) {
          batchManageMutation.mutate({ 
            ids, 
            action: key as 'activate' | 'deactivate' | 'delete' | 'unregister' 
          });
        }
      }
    }}>
      <Menu.Item key="activate" icon={<PoweroffOutlined />}>批量激活</Menu.Item>
      <Menu.Item key="deactivate" icon={<PoweroffOutlined />}>批量停用</Menu.Item>
      <Menu.Item key="delete" icon={<DeleteOutlined />} danger>批量删除</Menu.Item>
      <Menu.Item key="unregister" icon={<ApiOutlined />} danger>批量注销</Menu.Item>
    </Menu>
  );

  return (
    <PageContainer title="设备管理">
      <ProTable<Device, DeviceQuery>
        actionRef={actionRef}
        rowKey="id"
        columns={columns}
        search={{
          labelWidth: 'auto',
          defaultCollapsed: false,
        }}
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
        }}
        request={(params, sort, filter) => 
          handleProTableRequest<Device, DeviceQuery>(
            deviceService.getDevices, 
            params, 
            sort, 
            filter,
            'keyword'
          )
        }
        rowSelection={{
          onChange: (_, selectedRows) => {
            setSelectedRows(selectedRows);
          },
        }}
        toolBarRender={() => [
          <Button
            key="reset"
            icon={<ClearOutlined />}
            onClick={resetFilters}
          >
            重置
          </Button>,
          <Button
            key="search"
            type="primary"
            icon={<SearchOutlined />}
            onClick={() => {
              // 触发搜索
              const searchForm = document.querySelector('.ant-pro-table-search button[type="submit"]') as HTMLButtonElement;
              if (searchForm) {
                searchForm.click();
              }
            }}
          >
            查询
          </Button>,
          <Button
            key="add"
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate('/device/add')}
          >
            注册设备
          </Button>,
        ]}
        tableAlertRender={({ selectedRowKeys, onCleanSelected }) => (
          <Space size={24}>
            <span>
              已选 {selectedRowKeys.length} 项
              <a style={{ marginLeft: 8 }} onClick={onCleanSelected}>
                取消选择
              </a>
            </span>
          </Space>
        )}
        tableAlertOptionRender={({ selectedRowKeys }) => (
          <Space size={16}>
            <Dropdown overlay={batchActionMenu} trigger={['click']}>
              <Button type="primary">
                批量操作 <DownOutlined />
              </Button>
            </Dropdown>
          </Space>
        )}
      />
    </PageContainer>
  );
};

export default DevicePage;
