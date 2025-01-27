import { PageContainer, ProTable } from '@ant-design/pro-components';
import { Badge, Button, Space, Tag } from 'antd';
import React, { useRef } from 'react';
import { history } from '@umijs/max';
import { getDeviceAbnormalBehaviors } from '@/services/device';
import type { ActionType } from '@ant-design/pro-components';
import { ExportOutlined } from '@ant-design/icons';

const AlertPage: React.FC = () => {
  const actionRef = useRef<ActionType>();

  const columns = [
    {
      title: '时间',
      dataIndex: 'created_at',
      valueType: 'dateTime',
      sorter: true,
    },
    {
      title: '设备',
      dataIndex: 'device_id',
      render: (device_id: string) => (
        <a onClick={() => history.push(`/device/${device_id}`)}>{device_id}</a>
      ),
    },
    {
      title: '类型',
      dataIndex: 'type',
      valueEnum: {
        login: { text: '登录' },
        hardware: { text: '硬件变更' },
        network: { text: '网络异常' },
        usage: { text: '使用异常' },
        license: { text: '授权异常' },
      },
    },
    {
      title: '级别',
      dataIndex: 'level',
      valueEnum: {
        high: { text: '高', status: 'Error' },
        medium: { text: '中', status: 'Warning' },
        low: { text: '低', status: 'Processing' },
      },
    },
    {
      title: '描述',
      dataIndex: 'description',
      ellipsis: true,
      search: false,
    },
    {
      title: '详细信息',
      dataIndex: 'data',
      search: false,
      render: (data: string) => data && <Tag>{data}</Tag>,
    },
  ];

  return (
    <PageContainer>
      <ProTable<API.AbnormalBehavior>
        headerTitle="异常行为记录"
        actionRef={actionRef}
        rowKey="id"
        search={{
          labelWidth: 120,
          filterType: 'light',
        }}
        toolBarRender={() => [
          <Button
            key="export"
            icon={<ExportOutlined />}
            onClick={() => {
              // TODO: 实现导出功能
            }}
          >
            导出
          </Button>,
        ]}
        request={async (params) => {
          const response = await getDeviceAbnormalBehaviors('all', {
            current: params.current,
            pageSize: params.pageSize,
            ...params,
          });
          return {
            data: response.data,
            success: response.success,
            total: response.total,
          };
        }}
        columns={columns}
        pagination={{
          showQuickJumper: true,
          showSizeChanger: true,
        }}
      />
    </PageContainer>
  );
};

export default AlertPage;
