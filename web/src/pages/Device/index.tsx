import { PlusOutlined } from '@ant-design/icons';
import {
  ActionType,
  FooterToolbar,
  PageContainer,
  ProDescriptions,
  ProTable,
} from '@ant-design/pro-components';
import { Button, Drawer, message, Popconfirm, Tag, Badge, Space } from 'antd';
import React, { useRef, useState } from 'react';
import { getDeviceList, deleteDevice, blockDevice, unblockDevice } from '@/services/device';
import DeviceForm from './components/DeviceForm';
import { Access, useAccess, history } from '@umijs/max';

const DevicePage: React.FC = () => {
  const [createModalVisible, handleModalVisible] = useState<boolean>(false);
  const [showDetail, setShowDetail] = useState<boolean>(false);
  const actionRef = useRef<ActionType>();
  const [currentRow, setCurrentRow] = useState<API.Device>();
  const [selectedRowsState, setSelectedRows] = useState<API.Device[]>([]);
  const access = useAccess();

  const getRiskLevelBadge = (riskLevel: number) => {
    if (riskLevel >= 80) {
      return <Badge status="error" text="高风险" />;
    }
    if (riskLevel >= 50) {
      return <Badge status="warning" text="中风险" />;
    }
    if (riskLevel >= 20) {
      return <Badge status="processing" text="低风险" />;
    }
    return <Badge status="success" text="安全" />;
  };

  const columns = [
    {
      title: '设备名称',
      dataIndex: 'name',
      render: (dom: any, entity: API.Device) => {
        return (
          <a
            onClick={() => {
              history.push(`/device/${entity.id}`);
            }}
          >
            {dom}
          </a>
        );
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      valueEnum: {
        normal: { text: '正常', status: 'Success' },
        offline: { text: '离线', status: 'Default' },
        blocked: { text: '已禁用', status: 'Error' },
        suspect: { text: '可疑', status: 'Warning' },
      },
    },
    {
      title: '风险等级',
      dataIndex: 'risk_level',
      search: false,
      render: (riskLevel: number) => getRiskLevelBadge(riskLevel),
    },
    {
      title: '硬件信息',
      search: false,
      render: (_: any, record: API.Device) => (
        <Space direction="vertical" size="small">
          <Tag>硬盘: {record.disk_id}</Tag>
          <Tag>主板: {record.motherboard}</Tag>
          {record.network_cards && <Tag>网卡: {record.network_cards}</Tag>}
          {record.display_card && <Tag>显卡: {record.display_card}</Tag>}
        </Space>
      ),
    },
    {
      title: '系统信息',
      search: false,
      render: (_: any, record: API.Device) => (
        <Space direction="vertical" size="small">
          <Tag>时区: {record.timezone}</Tag>
          <Tag>语言: {record.language}</Tag>
          {record.location && <Tag>位置: {record.location}</Tag>}
        </Space>
      ),
    },
    {
      title: '分组',
      dataIndex: 'group_name',
      search: false,
    },
    {
      title: '最后在线',
      dataIndex: 'last_seen',
      search: false,
    },
    {
      title: '告警次数',
      dataIndex: 'alert_count',
      search: false,
      render: (count: number, record: API.Device) => (
        <Space>
          <Tag color={count > 0 ? 'error' : 'default'}>{count}</Tag>
          {record.last_alert_time && (
            <span style={{ fontSize: '12px', color: '#999' }}>
              最近: {record.last_alert_time}
            </span>
          )}
        </Space>
      ),
    },
    {
      title: '操作',
      dataIndex: 'option',
      valueType: 'option',
      render: (_: any, record: API.Device) => [
        <Access key="edit" accessible={access.canManageDevice}>
          <a
            key="edit"
            onClick={() => {
              setCurrentRow(record);
              handleModalVisible(true);
            }}
          >
            编辑
          </a>
        </Access>,
        <Access key="block" accessible={access.canManageDevice}>
          <Popconfirm
            key="block"
            title={record.status === 'blocked' ? '确定要解除封禁吗？' : '确定要封禁这个设备吗？'}
            onConfirm={async () => {
              if (record.status === 'blocked') {
                await unblockDevice(record.id);
                message.success('解除封禁成功');
              } else {
                await blockDevice(record.id);
                message.success('封禁成功');
              }
              actionRef.current?.reload();
            }}
          >
            <a>{record.status === 'blocked' ? '解除封禁' : '封禁'}</a>
          </Popconfirm>
        </Access>,
        <Access key="delete" accessible={access.canManageDevice}>
          <Popconfirm
            key="delete"
            title="确定要删除这个设备吗？"
            onConfirm={async () => {
              await deleteDevice(record.id);
              message.success('删除成功');
              actionRef.current?.reload();
            }}
          >
            <a>删除</a>
          </Popconfirm>
        </Access>,
      ],
    },
  ];

  return (
    <PageContainer>
      <ProTable<API.Device>
        headerTitle="设备列表"
        actionRef={actionRef}
        rowKey="id"
        search={{
          labelWidth: 120,
          filterType: 'light',
        }}
        toolBarRender={() => [
          <Access accessible={access.canManageDevice}>
            <Button
              type="primary"
              key="primary"
              onClick={() => {
                setCurrentRow(undefined);
                handleModalVisible(true);
              }}
            >
              <PlusOutlined /> 新建
            </Button>
          </Access>,
        ]}
        request={getDeviceList}
        columns={columns}
        rowSelection={{
          onChange: (_, selectedRows) => {
            setSelectedRows(selectedRows);
          },
        }}
      />
      {selectedRowsState?.length > 0 && (
        <FooterToolbar
          extra={
            <div>
              已选择 <a style={{ fontWeight: 600 }}>{selectedRowsState.length}</a> 项
            </div>
          }
        >
          <Access accessible={access.canManageDevice}>
            <Popconfirm
              title="确定要批量删除吗？"
              onConfirm={async () => {
                await Promise.all(
                  selectedRowsState.map((record) => deleteDevice(record.id))
                );
                setSelectedRows([]);
                actionRef.current?.reload();
                message.success('删除成功');
              }}
            >
              <Button>批量删除</Button>
            </Popconfirm>
          </Access>
        </FooterToolbar>
      )}
      <DeviceForm
        visible={createModalVisible}
        onVisibleChange={handleModalVisible}
        onSuccess={() => {
          handleModalVisible(false);
          setCurrentRow(undefined);
          actionRef.current?.reload();
        }}
        values={currentRow}
      />
    </PageContainer>
  );
};

export default DevicePage;
