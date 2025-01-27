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
import { getRoleList, deleteRole } from '@/services/role';
import RoleForm from './components/RoleForm';
import { Access, useAccess } from '@umijs/max';

const RolePage: React.FC = () => {
  const [createModalVisible, handleModalVisible] = useState<boolean>(false);
  const [showDetail, setShowDetail] = useState<boolean>(false);
  const actionRef = useRef<ActionType>();
  const [currentRow, setCurrentRow] = useState<API.Role>();
  const [selectedRowsState, setSelectedRows] = useState<API.Role[]>([]);
  const access = useAccess();

  const columns = [
    {
      title: '角色名称',
      dataIndex: 'name',
      render: (dom: any, entity: API.Role) => {
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
      title: '类型',
      dataIndex: 'type',
      valueEnum: {
        admin: { text: '管理员', status: 'Success' },
        operator: { text: '操作员', status: 'Processing' },
        viewer: { text: '访客', status: 'Default' },
      },
    },
    {
      title: '描述',
      dataIndex: 'description',
      search: false,
      ellipsis: true,
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
      render: (_: any, record: API.Role) => [
        <Access key="edit" accessible={access.canManageRole}>
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
        <Access key="delete" accessible={access.canManageRole}>
          <Popconfirm
            key="delete"
            title="确定要删除这个角色吗？"
            onConfirm={async () => {
              await deleteRole(record.id);
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
      <ProTable<API.Role>
        headerTitle="角色列表"
        actionRef={actionRef}
        rowKey="id"
        search={{
          labelWidth: 120,
        }}
        toolBarRender={() => [
          <Access accessible={access.canManageRole}>
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
        request={getRoleList}
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
          <Access accessible={access.canManageRole}>
            <Popconfirm
              title="确定要批量删除吗？"
              onConfirm={async () => {
                await Promise.all(
                  selectedRowsState.map((record) => deleteRole(record.id))
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
      <RoleForm
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
          <ProDescriptions<API.Role>
            column={2}
            title={currentRow?.name}
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

export default RolePage;
