import {
  PageContainer,
  ProTable,
  ModalForm,
  ProFormText,
  ProFormSelect,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { Button, message, Popconfirm } from 'antd';
import React, { useRef } from 'react';
import { PlusOutlined } from '@ant-design/icons';
import {
  getBlacklistRules,
  createBlacklistRule,
  updateBlacklistRule,
  deleteBlacklistRule,
} from '@/services/device';
import type { ActionType } from '@ant-design/pro-components';
import { Access, useAccess } from '@umijs/max';

const BlacklistRulePage: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const access = useAccess();

  const handleCreate = async (values: API.CreateRuleRequest) => {
    try {
      await createBlacklistRule(values);
      message.success('创建成功');
      actionRef.current?.reload();
      return true;
    } catch (error) {
      message.error('创建失败');
      return false;
    }
  };

  const handleUpdate = async (id: string, values: API.BlacklistRule) => {
    try {
      await updateBlacklistRule(id, values);
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
      await deleteBlacklistRule(id);
      message.success('删除成功');
      actionRef.current?.reload();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const ruleTypes = {
    disk_id: '硬盘ID',
    bios: 'BIOS',
    motherboard: '主板',
    network_cards: '网卡',
    display_card: '显卡',
    resolution: '分辨率',
    timezone: '时区',
    language: '语言',
    name: '设备名称',
  };

  const columns = [
    {
      title: '规则类型',
      dataIndex: 'type',
      valueEnum: ruleTypes,
    },
    {
      title: '匹配模式',
      dataIndex: 'pattern',
      ellipsis: true,
    },
    {
      title: '描述',
      dataIndex: 'description',
      ellipsis: true,
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
      render: (_: any, record: API.BlacklistRule) => [
        <Access key="edit" accessible={access.canManageDevice}>
          <ModalForm
            title="编辑规则"
            trigger={<a>编辑</a>}
            initialValues={record}
            onFinish={async (values) => handleUpdate(record.id, values)}
          >
            <ProFormSelect
              name="type"
              label="规则类型"
              options={Object.entries(ruleTypes).map(([value, label]) => ({
                value,
                label,
              }))}
              rules={[{ required: true, message: '请选择规则类型' }]}
            />
            <ProFormText
              name="pattern"
              label="匹配模式"
              rules={[{ required: true, message: '请输入匹配模式' }]}
              tooltip="支持正则表达式"
            />
            <ProFormTextArea
              name="description"
              label="描述"
              placeholder="请输入规则描述"
            />
          </ModalForm>
        </Access>,
        <Access key="delete" accessible={access.canManageDevice}>
          <Popconfirm
            title="确定要删除这条规则吗？"
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
      <ProTable<API.BlacklistRule>
        headerTitle="黑名单规则"
        actionRef={actionRef}
        rowKey="id"
        search={{
          labelWidth: 120,
          filterType: 'light',
        }}
        toolBarRender={() => [
          <Access accessible={access.canManageDevice}>
            <ModalForm
              title="新建规则"
              trigger={
                <Button type="primary">
                  <PlusOutlined />
                  新建
                </Button>
              }
              onFinish={handleCreate}
            >
              <ProFormSelect
                name="type"
                label="规则类型"
                options={Object.entries(ruleTypes).map(([value, label]) => ({
                  value,
                  label,
                }))}
                rules={[{ required: true, message: '请选择规则类型' }]}
              />
              <ProFormText
                name="pattern"
                label="匹配模式"
                rules={[{ required: true, message: '请输入匹配模式' }]}
                tooltip="支持正则表达式"
              />
              <ProFormTextArea
                name="description"
                label="描述"
                placeholder="请输入规则描述"
              />
            </ModalForm>
          </Access>,
        ]}
        request={getBlacklistRules}
        columns={columns}
        pagination={{
          showQuickJumper: true,
          showSizeChanger: true,
        }}
      />
    </PageContainer>
  );
};

export default BlacklistRulePage;
