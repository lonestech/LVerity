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
import { getLicenseList, deleteLicense } from '@/services/license';
import LicenseForm from './components/LicenseForm';
import { Access, useAccess } from '@umijs/max';

const LicensePage: React.FC = () => {
  const [createModalVisible, handleModalVisible] = useState<boolean>(false);
  const [showDetail, setShowDetail] = useState<boolean>(false);
  const actionRef = useRef<ActionType>();
  const [currentRow, setCurrentRow] = useState<API.License>();
  const [selectedRowsState, setSelectedRows] = useState<API.License[]>([]);
  const access = useAccess();

  const columns = [
    {
      title: '授权码',
      dataIndex: 'code',
      render: (dom: any, entity: API.License) => {
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
        trial: { text: '试用版', status: 'Warning' },
        standard: { text: '标准版', status: 'Success' },
        professional: { text: '专业版', status: 'Processing' },
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      valueEnum: {
        active: { text: '激活', status: 'Success' },
        expired: { text: '过期', status: 'Error' },
        inactive: { text: '未激活', status: 'Default' },
      },
    },
    {
      title: '设备ID',
      dataIndex: 'device_id',
      search: false,
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
      render: (_: any, record: API.License) => [
        <Access key="edit" accessible={access.canManageLicense}>
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
        <Access key="delete" accessible={access.canManageLicense}>
          <Popconfirm
            key="delete"
            title="确定要删除这个授权吗？"
            onConfirm={async () => {
              await deleteLicense(record.id);
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
      <ProTable<API.License>
        headerTitle="授权列表"
        actionRef={actionRef}
        rowKey="id"
        search={{
          labelWidth: 120,
        }}
        toolBarRender={() => [
          <Access accessible={access.canManageLicense}>
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
        request={getLicenseList}
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
          <Access accessible={access.canManageLicense}>
            <Popconfirm
              title="确定要批量删除吗？"
              onConfirm={async () => {
                await Promise.all(
                  selectedRowsState.map((record) => deleteLicense(record.id))
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
      <LicenseForm
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
          <ProDescriptions<API.License>
            column={2}
            title={currentRow?.code}
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

export default LicensePage;
