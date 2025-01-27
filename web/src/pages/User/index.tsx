import { PlusOutlined } from '@ant-design/icons';
import {
  ActionType,
  FooterToolbar,
  PageContainer,
  ProDescriptions,
  ProTable,
} from '@ant-design/pro-components';
import { Button, Drawer, message, Popconfirm } from 'antd';
import React, { useRef, useState } from 'react';
import { getUserList, deleteUser } from '@/services/user';
import UserForm from './components/UserForm';
import { Access, useAccess } from '@umijs/max';

const UserPage: React.FC = () => {
  const [createModalVisible, handleModalVisible] = useState<boolean>(false);
  const [showDetail, setShowDetail] = useState<boolean>(false);
  const actionRef = useRef<ActionType>();
  const [currentRow, setCurrentRow] = useState<API.User>();
  const [selectedRowsState, setSelectedRows] = useState<API.User[]>([]);
  const access = useAccess();

  const columns = [
    {
      title: '用户名',
      dataIndex: 'username',
      render: (dom: any, entity: API.User) => {
        return (
          <a
            onClick={() => {
              setCurrentRow(entity);
              setShowDetail(true);
            }}
          >
            {dom}
          </a>
        );
      },
    },
    {
      title: '角色',
      dataIndex: 'role_id',
      valueEnum: {
        admin: { text: '管理员', status: 'Success' },
        operator: { text: '操作员', status: 'Processing' },
        viewer: { text: '访客', status: 'Default' },
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      valueEnum: {
        active: { text: '正常', status: 'Success' },
        inactive: { text: '禁用', status: 'Default' },
        locked: { text: '锁定', status: 'Error' },
      },
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      search: false,
    },
    {
      title: '操作',
      dataIndex: 'option',
      valueType: 'option',
      render: (_: any, record: API.User) => [
        <Access key="edit" accessible={access.canManageUser}>
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
        <Access key="delete" accessible={access.canManageUser}>
          <Popconfirm
            key="delete"
            title="确定要删除这个用户吗？"
            onConfirm={async () => {
              await deleteUser(record.id);
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
      <ProTable<API.User>
        headerTitle="用户列表"
        actionRef={actionRef}
        rowKey="id"
        search={{
          labelWidth: 120,
        }}
        toolBarRender={() => [
          <Access accessible={access.canManageUser}>
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
        request={getUserList}
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
          <Access accessible={access.canManageUser}>
            <Popconfirm
              title="确定要批量删除吗？"
              onConfirm={async () => {
                await Promise.all(
                  selectedRowsState.map((record) => deleteUser(record.id))
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
      <UserForm
        visible={createModalVisible}
        onVisibleChange={handleModalVisible}
        onSuccess={() => {
          handleModalVisible(false);
          setCurrentRow(undefined);
          actionRef.current?.reload();
        }}
        values={currentRow}
      />
      <Drawer
        width={600}
        open={showDetail}
        onClose={() => {
          setCurrentRow(undefined);
          setShowDetail(false);
        }}
        closable={false}
      >
        {currentRow?.id && (
          <ProDescriptions<API.User>
            column={2}
            title={currentRow?.username}
            request={async () => ({
              data: currentRow || {},
            })}
            params={{
              id: currentRow?.id,
            }}
            columns={columns}
          />
        )}
      </Drawer>
    </PageContainer>
  );
};

export default UserPage;
