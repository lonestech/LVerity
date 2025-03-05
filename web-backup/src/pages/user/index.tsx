import { PlusOutlined } from '@ant-design/icons';
import { ActionType, PageContainer, ProTable, ProColumns } from '@ant-design/pro-components';
import { Button, Form, Input, Modal, Select, message } from 'antd';
import { useRef, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import StatusTag from '@/components/StatusTag';
import { User, UserCreateRequest, UserUpdateRequest } from '@/models/user';
import { userService } from '@/services/user';
import ConfirmModal from '@/components/ConfirmModal';

export default function UserPage() {
  const [form] = Form.useForm();
  const actionRef = useRef<ActionType>();
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  const queryClient = useQueryClient();

  // 创建用户
  const createMutation = useMutation({
    mutationFn: (data: UserCreateRequest) => userService.create(data),
    onSuccess: () => {
      message.success('用户创建成功');
      setCreateModalVisible(false);
      form.resetFields();
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  // 更新用户
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UserUpdateRequest }) => 
      userService.update(id, data),
    onSuccess: () => {
      message.success('用户更新成功');
      setCreateModalVisible(false);
      setEditingUser(null);
      form.resetFields();
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  // 删除用户
  const deleteMutation = useMutation({
    mutationFn: (id: string) => userService.delete(id),
    onSuccess: () => {
      message.success('用户删除成功');
      setDeleteModalVisible(false);
      setSelectedUser(null);
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  // 处理表单提交
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingUser) {
        await updateMutation.mutateAsync({ id: editingUser.id, data: values });
      } else {
        await createMutation.mutateAsync(values);
      }
    } catch (error: any) {
      message.error(error.message || '操作失败');
    }
  };

  // 处理删除用户
  const handleDelete = async () => {
    if (!selectedUser) return;
    try {
      await deleteMutation.mutateAsync(selectedUser.id);
    } catch (error: any) {
      message.error(error.message || '删除失败');
    }
  };

  // 表格列配置
  const columns: ProColumns<User>[] = [
    {
      title: '用户名',
      dataIndex: 'username',
      width: 200,
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      width: 250,
    },
    {
      title: '角色',
      dataIndex: 'roleID',
      width: 150,
      valueEnum: {
        admin: { text: '管理员' },
        user: { text: '普通用户' },
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      valueType: 'select',
      valueEnum: {
        active: { text: '正常', status: 'Success' },
        inactive: { text: '禁用', status: 'Default' },
        suspended: { text: '暂停', status: 'Warning' },
      },
      render: (_, record) => <StatusTag status={record.status} />,
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      width: 200,
    },
    {
      title: '操作',
      width: 180,
      valueType: 'option',
      render: (_: any, record: User) => [
        <a
          key="edit"
          onClick={() => {
            setEditingUser(record);
            form.setFieldsValue(record);
            setCreateModalVisible(true);
          }}
        >
          编辑
        </a>,
        record.roleID !== 'admin' && (
          <a
            key="delete"
            style={{ color: '#ff4d4f' }}
            onClick={() => {
              setSelectedUser(record);
              setDeleteModalVisible(true);
            }}
          >
            删除
          </a>
        ),
      ],
    },
  ];

  return (
    <PageContainer>
      <ProTable<User>
        headerTitle="用户管理"
        actionRef={actionRef}
        rowKey="id"
        search={{
          labelWidth: 120,
        }}
        toolBarRender={() => [
          <Button
            key="create"
            type="primary"
            onClick={() => {
              setEditingUser(null);
              form.resetFields();
              setCreateModalVisible(true);
            }}
            icon={<PlusOutlined />}
          >
            添加用户
          </Button>,
        ]}
        request={async (params) => {
          const { current, pageSize, ...rest } = params;
          const response = await userService.list({
            page: current,
            pageSize,
            ...rest,
          });
          return {
            data: response.list,
            total: response.total,
            success: true,
          };
        }}
        columns={columns}
      />

      <Modal
        title={editingUser ? '编辑用户' : '添加用户'}
        open={createModalVisible}
        onOk={handleSubmit}
        onCancel={() => {
          setCreateModalVisible(false);
          setEditingUser(null);
          form.resetFields();
        }}
        confirmLoading={createMutation.isPending || updateMutation.isPending}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            name="username"
            label="用户名"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input placeholder="请输入用户名" />
          </Form.Item>

          <Form.Item
            name="email"
            label="邮箱"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入有效的邮箱格式' }
            ]}
          >
            <Input placeholder="请输入邮箱" />
          </Form.Item>

          {!editingUser && (
            <Form.Item
              name="password"
              label="密码"
              rules={[
                { required: true, message: '请输入密码' },
                { min: 6, message: '密码长度不能少于6位' }
              ]}
            >
              <Input.Password placeholder="请输入密码" />
            </Form.Item>
          )}

          <Form.Item
            name="roleID"
            label="角色"
            rules={[{ required: true, message: '请选择角色' }]}
          >
            <Select placeholder="请选择角色">
              <Select.Option value="admin">管理员</Select.Option>
              <Select.Option value="user">普通用户</Select.Option>
            </Select>
          </Form.Item>

          {editingUser && (
            <Form.Item
              name="status"
              label="状态"
            >
              <Select placeholder="请选择状态">
                <Select.Option value="active">正常</Select.Option>
                <Select.Option value="inactive">禁用</Select.Option>
                <Select.Option value="suspended">暂停</Select.Option>
              </Select>
            </Form.Item>
          )}
        </Form>
      </Modal>

      <ConfirmModal
        title="删除用户"
        content="确定要删除此用户吗？删除后将无法恢复。"
        visible={deleteModalVisible}
        onConfirm={handleDelete}
        onCancel={() => {
          setDeleteModalVisible(false);
          setSelectedUser(null);
        }}
      />
    </PageContainer>
  );
}
