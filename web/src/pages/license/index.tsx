import React, { useState } from 'react';
import { 
  Button, 
  Space, 
  Popconfirm, 
  message, 
  Typography,
  Tooltip
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  PlayCircleOutlined, 
  PauseCircleOutlined, 
  EyeOutlined, 
  DownloadOutlined 
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { ProTable } from '@ant-design/pro-components';
import type { ProColumns, ActionType } from '@ant-design/pro-components';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import PageContainer from '../../components/PageContainer';
import StatusTag from '../../components/StatusTag';
import { licenseService } from '../../services/license';
import { License, LicenseQuery } from '../../models/license';
import { formatDateTime } from '../../utils/utils';

const { Text } = Typography;

const LicensePage: React.FC = () => {
  const navigate = useNavigate();
  const actionRef = React.useRef<ActionType>();
  const queryClient = useQueryClient();
  const [selectedRows, setSelectedRows] = useState<License[]>([]);
  const [exporting, setExporting] = useState(false);

  // 使用React Query获取客户和产品数据
  const { data: customers = [] } = useQuery(
    ['customers'], 
    async () => {
      const response = await licenseService.getCustomers();
      return response.success ? response.data : [];
    },
    {
      staleTime: 5 * 60 * 1000, // 5分钟内不重新获取
      refetchOnWindowFocus: false,
    }
  );

  const { data: products = [] } = useQuery(
    ['products'], 
    async () => {
      const response = await licenseService.getProducts();
      return response.success ? response.data : [];
    },
    {
      staleTime: 5 * 60 * 1000, // 5分钟内不重新获取
      refetchOnWindowFocus: false,
    }
  );

  // 激活授权的变更
  const activateMutation = useMutation(
    (id: string) => licenseService.activateLicense(id),
    {
      onSuccess: () => {
        message.success('授权激活成功');
        queryClient.invalidateQueries(['licenses']);
        actionRef.current?.reload();
      },
      onError: (error) => {
        console.error('授权激活失败:', error);
        message.error('授权激活失败');
      },
    }
  );

  // 暂停授权的变更
  const suspendMutation = useMutation(
    (id: string) => licenseService.suspendLicense(id),
    {
      onSuccess: () => {
        message.success('授权暂停成功');
        queryClient.invalidateQueries(['licenses']);
        actionRef.current?.reload();
      },
      onError: (error) => {
        console.error('授权暂停失败:', error);
        message.error('授权暂停失败');
      },
    }
  );

  // 删除授权的变更
  const deleteMutation = useMutation(
    (id: string) => licenseService.deleteLicense(id),
    {
      onSuccess: () => {
        message.success('删除授权成功');
        queryClient.invalidateQueries(['licenses']);
        actionRef.current?.reload();
      },
      onError: (error) => {
        console.error('删除授权失败:', error);
        message.error('删除授权失败');
      },
    }
  );

  // 导出授权列表
  const handleExport = async (query: LicenseQuery) => {
    setExporting(true);
    try {
      const response = await licenseService.exportLicenses(query);
      if (response.success && response.data.url) {
        // 创建一个隐藏的<a>元素来触发下载
        const link = document.createElement('a');
        link.href = response.data.url;
        link.download = `授权列表_${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        message.success('授权列表导出成功');
      } else {
        message.error(response.message || '导出授权列表失败');
      }
    } catch (error) {
      console.error('导出授权列表失败:', error);
      message.error('导出授权列表失败');
    } finally {
      setExporting(false);
    }
  };

  // 重置授权过滤器
  const handleResetFilters = async () => {
    try {
      await licenseService.resetLicenseFilters();
      message.success('已重置所有过滤条件');
      // 重置表单
      actionRef.current?.reset?.();
      // 重新加载数据
      actionRef.current?.reload();
    } catch (error) {
      console.error('重置过滤条件失败:', error);
      message.error('重置过滤条件失败');
    }
  };

  // ProTable的列定义
  const columns: ProColumns<License>[] = [
    {
      title: '授权密钥',
      dataIndex: 'licenseKey',
      key: 'licenseKey',
      copyable: true,
      ellipsis: true,
      width: 220,
    },
    {
      title: '授权状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      filters: [
        { text: '有效', value: 'active' },
        { text: '过期', value: 'expired' },
        { text: '暂停', value: 'suspended' },
        { text: '未激活', value: 'inactive' },
      ],
      valueEnum: {
        active: { text: '有效', status: 'Success' },
        expired: { text: '过期', status: 'Error' },
        suspended: { text: '暂停', status: 'Warning' },
        inactive: { text: '未激活', status: 'Default' },
      },
      render: (_, record) => (
        <StatusTag 
          status={record.status} 
          customMapping={{
            active: { color: 'success', text: '有效', icon: undefined },
            inactive: { color: 'default', text: '未激活', icon: undefined },
            expired: { color: 'error', text: '过期', icon: undefined },
            suspended: { color: 'warning', text: '暂停', icon: undefined },
          }}
        />
      ),
    },
    {
      title: '授权类型',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      filters: [
        { text: '永久', value: 'perpetual' },
        { text: '订阅', value: 'subscription' },
        { text: '试用', value: 'trial' },
      ],
      valueEnum: {
        perpetual: { text: '永久' },
        subscription: { text: '订阅' },
        trial: { text: '试用' },
      },
    },
    {
      title: '客户',
      dataIndex: 'customerName',
      key: 'customerId',
      ellipsis: true,
      width: 180,
      filters: customers.map(c => ({ text: c.name, value: c.id })),
      filterSearch: true,
      valueType: 'select',
      fieldProps: {
        options: customers.map(c => ({ label: c.name, value: c.id })),
        showSearch: true,
      },
    },
    {
      title: '产品',
      dataIndex: 'productName',
      key: 'productId',
      ellipsis: true,
      width: 180,
      filters: products.map(p => ({ text: p.name, value: p.id })),
      filterSearch: true,
      valueType: 'select',
      fieldProps: {
        options: products.map(p => ({ label: p.name, value: p.id })),
        showSearch: true,
      },
    },
    {
      title: '设备数',
      dataIndex: 'maxDevices',
      key: 'maxDevices',
      width: 120,
      render: (_, record) => (
        <Tooltip title={`已激活: ${record.activeDevices || 0}/${record.maxDevices}`}>
          <div>
            {record.activeDevices || 0}/{record.maxDevices}
          </div>
        </Tooltip>
      ),
      sorter: true,
    },
    {
      title: '发布日期',
      dataIndex: 'issuedAt',
      key: 'issuedAt',
      width: 180,
      valueType: 'dateTime',
      sorter: true,
      render: (_, record) => formatDateTime(record.issuedAt),
    },
    {
      title: '过期日期',
      dataIndex: 'expiresAt',
      key: 'expiresAt',
      width: 180,
      valueType: 'dateTime',
      sorter: true,
      render: (_, record) => record.type === 'perpetual' ? '永不过期' : formatDateTime(record.expiresAt),
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
          onClick={() => navigate(`/license/detail/${record.id}`)}
        >
          查看
        </Button>,
        <Button
          key="edit"
          type="link"
          size="small"
          icon={<EditOutlined />}
          onClick={() => navigate(`/license/edit/${record.id}`)}
        >
          编辑
        </Button>,
        record.status === 'active' ? (
          <Popconfirm
            key="suspend"
            title="确定要暂停此授权吗？"
            onConfirm={() => suspendMutation.mutate(record.id)}
          >
            <Button
              type="link"
              size="small"
              danger
              icon={<PauseCircleOutlined />}
              loading={suspendMutation.isLoading}
            >
              暂停
            </Button>
          </Popconfirm>
        ) : record.status === 'suspended' || record.status === 'inactive' ? (
          <Popconfirm
            key="activate"
            title="确定要激活此授权吗？"
            onConfirm={() => activateMutation.mutate(record.id)}
          >
            <Button
              type="link"
              size="small"
              icon={<PlayCircleOutlined />}
              loading={activateMutation.isLoading}
            >
              激活
            </Button>
          </Popconfirm>
        ) : null,
        <Popconfirm
          key="delete"
          title="确定要删除此授权吗？"
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
      ],
    },
  ];

  return (
    <PageContainer title="授权管理">
      <ProTable<License, LicenseQuery>
        actionRef={actionRef}
        rowKey="id"
        columns={columns}
        search={{
          labelWidth: 'auto',
          defaultCollapsed: false,
          optionRender: ({ searchText, resetText }, { form, submit, reset }) => [
            <Button key="search" type="primary" onClick={submit}>
              {searchText}
            </Button>,
            <Button 
              key="reset" 
              onClick={() => {
                reset();
                // 清除所有筛选条件，重新加载数据
                form.resetFields();
                actionRef.current?.reload();
                // 调用后端的重置过滤器接口
                licenseService.resetLicenseFilters().then(() => {
                  message.success('已重置所有过滤条件');
                }).catch(error => {
                  console.error('重置过滤条件失败:', error);
                });
              }}
            >
              {resetText}
            </Button>,
          ]
        }}
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
        }}
        request={async (params, sort, filter) => {
          // 处理排序
          const sortField = Object.keys(sort)[0];
          const sortOrder = sort[sortField] === 'ascend' ? 'asc' : 'desc';
          
          // 处理查询参数
          const queryParams: LicenseQuery = {
            keyword: params.licenseKey || params.keyword,
            customerId: params.customerId,
            productId: params.productId,
            status: params.status,
            type: params.type,
            page: params.current,
            pageSize: params.pageSize,
          };
          
          if (sortField) {
            queryParams.sortBy = sortField;
            queryParams.sortOrder = sortOrder;
          }
          
          try {
            const response = await licenseService.getLicenses(queryParams);
            if (response.success) {
              return {
                data: response.data.items,
                success: true,
                total: response.data.total,
              };
            } else {
              message.error(response.message || '加载授权列表失败');
              return {
                data: [],
                success: false,
                total: 0,
              };
            }
          } catch (error) {
            console.error('加载授权列表失败:', error);
            message.error('加载授权列表失败');
            return {
              data: [],
              success: false,
              total: 0,
            };
          }
        }}
        rowSelection={{
          onChange: (_, selectedRows) => {
            setSelectedRows(selectedRows);
          },
        }}
        toolBarRender={() => [
          <Button
            key="export"
            icon={<DownloadOutlined />}
            onClick={() => {
              const form = actionRef.current?.getFieldsFormatValue?.();
              handleExport(form as LicenseQuery);
            }}
            loading={exporting}
          >
            导出
          </Button>,
          <Button
            key="add"
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate('/license/form')}
          >
            新增授权
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
              title="确定要批量删除选中的授权吗？"
              onConfirm={async () => {
                try {
                  await Promise.all(
                    selectedRowKeys.map(id => licenseService.deleteLicense(id as string))
                  );
                  message.success('批量删除成功');
                  actionRef.current?.reload();
                  setSelectedRows([]);
                } catch (error) {
                  console.error('批量删除失败:', error);
                  message.error('批量删除失败');
                }
              }}
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

export default LicensePage;
