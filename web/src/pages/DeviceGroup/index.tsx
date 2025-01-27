import {
  PageContainer,
  ProTable,
  ModalForm,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { Button, message, Popconfirm, Space } from 'antd';
import React, { useRef } from 'react';
import { PlusOutlined } from '@ant-design/icons';
import { getDeviceGroups, createDeviceGroup, updateDeviceGroup, deleteDeviceGroup } from '@/services/device';
import type { ActionType } from '@ant-design/pro-components';
import { Access, useAccess } from '@umijs/max';

const DeviceGroupPage: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const access = useAccess();

  const handleCreate = async (values: API.CreateGroupRequest) => {
    try {
      await createDeviceGroup(values);
      message.success('创建成功');
      actionRef.current?.reload();
      return true;
    } catch (error) {
      message.error('创建失败');
      return false;
    }
  };

  const handleUpdate = async (id: string, values: API.DeviceGroup) => {
    try {
      await updateDeviceGroup(id, values);
      message.success('更新成功');
      actionRef.current?.reload();
      return true;
    } catch (error) {
      message.error('更新失败');
      return false;
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDeviceGroup(id);
      message.success('删除成功');
      actionRef.current?.reload();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const columns = [
    {
      title: '分组名称',
      dataIndex: 'name',
      render: (name: string) => <a>{name}</a>,
    },
    {
      title: '描述',
      dataIndex: 'description',
      ellipsis: true,
      search: false,
    },
    {
      title: '设备数量',
      dataIndex: 'device_count',
      search: false,
    },
    {
      title: '创建人',
      dataIndex: 'created_by',
      search: false,
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      valueType: 'dateTime',
      sorter: true,
      search: false,
    },
    {
      title: '操作',
      dataIndex: 'option',
      valueType: 'option',
      render: (_: any, record: API.DeviceGroup) => [
        <Access key="edit" accessible={access.canManageDevice}>
          <ModalForm
            title="编辑分组"
            trigger={<a>编辑</a>}
            initialValues={record}
            onFinish={async (values) => handleUpdate(record.id, values)}
          >
            <ProFormText
              name="name"
              label="分组名称"
              rules={[{ required: true, message: '请输入分组名称' }]}
            />
            <ProFormTextArea
              name="description"
              label="描述"
              placeholder="请输入分组描述"
            />
          </ModalForm>
        </Access>,
        <Access key="delete" accessible={access.canManageDevice}>
          <Popconfirm
            title="确定要删除这个分组吗？"
            onConfirm={() => handleDelete(record.id)}
          >
            <a>删除</a>
          </Popconfirm>
        </Access>,
      ],
    },
  ];

  return (
    <PageContainer>
      <ProTable<API.DeviceGroup>
        headerTitle="设备分组"
        actionRef={actionRef}
        rowKey="id"
        search={{
          labelWidth: 120,
          filterType: 'light',
        }}
        toolBarRender={() => [
          <Access accessible={access.canManageDevice}>
            <ModalForm
              title="新建分组"
              trigger={
                <Button type="primary">
                  <PlusOutlined />
                  新建
                </Button>
              }
              onFinish={handleCreate}
            >
              <ProFormText
                name="name"
                label="分组名称"
                rules={[{ required: true, message: '请输入分组名称' }]}
              />
              <ProFormTextArea
                name="description"
                label="描述"
                placeholder="请输入分组描述"
              />
            </ModalForm>
          </Access>,
        ]}
        request={getDeviceGroups}
        columns={columns}
        pagination={{
          showQuickJumper: true,
          showSizeChanger: true,
        }}
      />
    </PageContainer>
  );
};

export default DeviceGroupPage;
