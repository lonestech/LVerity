import React, { useState, useEffect } from 'react';
import { 
  Button, 
  Space, 
  Popconfirm, 
  message,
  Tag,
  Avatar,
  Typography,
} from 'antd';
import { 
  SearchOutlined, 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  EyeOutlined, 
  UserOutlined,
  LockOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { ProTable } from '@ant-design/pro-components';
import type { ProColumns, ActionType } from '@ant-design/pro-components';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import PageContainer from '../../components/PageContainer';
import StatusTag from '../../components/StatusTag';
import { userService } from '../../services/user';
import { User, UserQuery, UserRole } from '../../models/user';
import { formatDateTime } from '../../utils/utils';
import { handleProTableRequest } from '../../utils/tableUtils';

const { Text } = Typography;

const UserPage: React.FC = () => {
  const navigate = useNavigate();
  const actionRef = React.useRef<ActionType>();
  const queryClient = useQueryClient();
  const [selectedRows, setSelectedRows] = useState<User[]>([]);
  const [roles, setRoles] = useState<UserRole[]>([]);

  // 获取角色列表
  const { isLoading: isLoadingRoles } = useQuery(
    ['roles'],
    async () => {
      const response = await userService.getRoles();
      if (response.success) {
        setRoles(response.data);
        return response.data;
      }
      throw new Error(response.message || '获取角色列表失败');
    },
    {
      onError: (error) => {
        console.error('获取角色列表失败:', error);
        message.error('获取角色列表失败');
      },
    }
  );

  // 删除用户的变更
  const deleteMutation = useMutation(
    (id: string) => userService.deleteUser(id),
    {
      onSuccess: () => {
        message.success('删除用户成功');
        queryClient.invalidateQueries(['users']);
        actionRef.current?.reload();
      },
      onError: (error) => {
        console.error('删除用户失败:', error);
        message.error('删除用户失败');
      },
    }
  );

  // 批量删除用户的变更
  const batchDeleteMutation = useMutation(
    (ids: string[]) => userService.batchDeleteUsers(ids),
    {
      onSuccess: (data) => {
        if (data.success) {
          message.success(`成功删除 ${data.data.success} 个用户`);
          if (data.data.failed > 0) {
            message.warning(`${data.data.failed} 个用户删除失败`);
          }
        } else {
          message.error(data.message || '批量删除用户失败');
        }
        queryClient.invalidateQueries(['users']);
        actionRef.current?.reload();
        setSelectedRows([]);
      },
      onError: (error) => {
        console.error('批量删除用户失败:', error);
        message.error('批量删除用户失败');
      },
    }
  );

  // 重置过滤条件的变更
  const resetFiltersMutation = useMutation(
    () => userService.resetUserFilters(),
    {
      onSuccess: () => {
        message.success('已重置过滤条件');
        queryClient.invalidateQueries(['users']);
        actionRef.current?.reload();
      },
      onError: (error) => {
        console.error('重置过滤条件失败:', error);
        message.error('重置过滤条件失败');
      },
    }
  );

  // 获取角色名称
  const getRoleName = (roleId: string) => {
    const role = roles.find(r => r.id === roleId);
    return role ? role.name : roleId;
  };

  // ProTable的列定义
  const columns: ProColumns<User>[] = [
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
      width: 150,
      render: (username: string, record: User) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Avatar 
            icon={<UserOutlined />} 
            style={{ 
              backgroundColor: record.status === 'active' ? '#1890ff' : '#d9d9d9',
              marginRight: 8 
            }} 
          />
          <div>
            <div>{username}</div>
            {record.name && (
              <div style={{ fontSize: '12px', color: 'rgba(0, 0, 0, 0.45)' }}>
                {record.name}
              </div>
            )}
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
        { text: '活跃', value: 'active' },
        { text: '未激活', value: 'inactive' },
        { text: '已锁定', value: 'locked' },
      ],
      valueEnum: {
        active: { text: '活跃', status: 'Success' },
        inactive: { text: '未激活', status: 'Default' },
        locked: { text: '已锁定', status: 'Error' },
      },
      render: (_, record) => <StatusTag status={record.status} />,
    },
    {
      title: '角色',
      dataIndex: 'roleId',
      key: 'roleId',
      width: 120,
      filters: roles.map(role => ({ text: role.name, value: role.id })),
      render: (roleId: string) => (
        <Tag color="blue">{getRoleName(roleId)}</Tag>
      ),
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
      width: 200,
      ellipsis: true,
      copyable: true,
    },
    {
      title: '手机',
      dataIndex: 'phone',
      key: 'phone',
      width: 150,
      ellipsis: true,
    },
    {
      title: '上次登录',
      dataIndex: 'lastLoginAt',
      key: 'lastLoginAt',
      width: 180,
      valueType: 'dateTime',
      sorter: true,
      render: (date: string) => date ? formatDateTime(date) : '-',
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      valueType: 'dateTime',
      sorter: true,
      render: (date: string) => formatDateTime(date),
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      valueType: 'option',
      render: (_, record) => [
        <Button
          key="view"
          type="link"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => navigate(`/user/detail/${record.id}`)}
        >
          查看
        </Button>,
        <Button
          key="edit"
          type="link"
          size="small"
          icon={<EditOutlined />}
          onClick={() => navigate(`/user/edit/${record.id}`)}
        >
          编辑
        </Button>,
        <Button
          key="reset-password"
          type="link"
          size="small"
          icon={<LockOutlined />}
          onClick={() => navigate(`/user/reset-password/${record.id}`)}
        >
          重置密码
        </Button>,
        <Popconfirm
          key="delete"
          title="确定删除此用户？"
          description="此操作不可恢复。"
          onConfirm={() => deleteMutation.mutate(record.id)}
          disabled={record.isAdmin}
        >
          <Button
            type="link"
            size="small"
            danger
            icon={<DeleteOutlined />}
            disabled={record.isAdmin}
          >
            删除
          </Button>
        </Popconfirm>,
      ],
    },
  ];

  return (
    <PageContainer title="用户管理">
      <ProTable<User, UserQuery>
        actionRef={actionRef}
        rowKey="id"
        columns={columns}
        loading={isLoadingRoles}
        search={{
          labelWidth: 'auto',
          defaultCollapsed: false,
        }}
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
        }}
        request={(params, sort, filter) => 
          handleProTableRequest<User, UserQuery>(
            userService.getUsers, 
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
            icon={<ReloadOutlined />}
            onClick={() => resetFiltersMutation.mutate()}
          >
            重置过滤
          </Button>,
          <Button
            key="query"
            icon={<SearchOutlined />}
            onClick={() => actionRef.current?.reload()}
          >
            查询
          </Button>,
          <Button
            key="add"
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate('/user/create')}
          >
            添加用户
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
            <Popconfirm
              title="确定要批量删除选中的用户吗？"
              description="此操作不可恢复。"
              onConfirm={() => batchDeleteMutation.mutate(selectedRowKeys as string[])}
            >
              <Button type="link" danger>
                批量删除
              </Button>
            </Popconfirm>
          </Space>
        )}
      />
    </PageContainer>
  );
};

export default UserPage;
