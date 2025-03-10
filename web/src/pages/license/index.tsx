import React, { useState, useEffect } from 'react';
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
  DownloadOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  PauseCircleOutlined as PauseCircleOutlinedIcon,
  MinusCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { ProTable } from '@ant-design/pro-components';
import type { ProColumns, ActionType } from '@ant-design/pro-components';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import PageContainer from '../../components/PageContainer';
import StatusTag from '../../components/StatusTag';
import { licenseService } from '../../services/license';
import { License, LicenseQuery } from '../../models/license';
import { formatDateTime } from '../../utils/utils';
import { Tag, Badge } from 'antd';

const { Text } = Typography;

const LicensePage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const actionRef = React.useRef<ActionType>();
  const queryClient = useQueryClient();
  const [selectedRows, setSelectedRows] = useState<License[]>([]);
  const [exporting, setExporting] = useState(false);

  // 检查URL中是否有refresh参数
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get('refresh') === 'true') {
      console.log('检测到refresh=true参数，强制刷新授权列表');
      // 清除URL参数
      navigate('/license', { replace: true });
      
      // 强制清空缓存并重新获取
      queryClient.removeQueries(['licenses']);
      
      // 立即刷新表格数据
      setTimeout(() => {
        console.log('强制刷新表格数据');
        actionRef.current?.reload(true); // 传true表示强制刷新
      }, 100);
    }
  }, [location, navigate, queryClient]);

  // 监听licenses查询缓存变化，当缓存失效时刷新表格
  useEffect(() => {
    // 创建订阅以监听licenses查询缓存的变化
    const unsubscribe = queryClient.getQueryCache().subscribe(() => {
      // 检查licenses查询是否已标记为失效
      const query = queryClient.getQueryCache().find(['licenses']);
      if (query && query.state.isInvalidated) {
        console.log('licenses查询已失效，刷新表格数据');
        actionRef.current?.reload();
      }
    });

    // 组件卸载时取消订阅
    return () => {
      unsubscribe();
    };
  }, [queryClient]);

  // 添加自定义样式
  React.useEffect(() => {
    // 添加全局样式以修复表格显示问题
    const styleElement = document.createElement('style');
    styleElement.innerHTML = `
      .license-table .ant-table {
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      }
      
      .license-table .ant-pro-card {
        overflow-x: auto; /* 添加水平滚动条 */
      }
      
      .license-table .ant-table-content {
        overflow-x: auto; /* 加强滑动支持 */
      }
      
      .license-table .ant-table-thead > tr > th {
        background-color: #f7f9fc;
        font-weight: 600;
        color: #323a45;
        padding: 12px 16px;
        border-bottom: 1px solid #e8ecf1;
        white-space: nowrap; /* 防止表头换行 */
      }
      
      .license-table .ant-table-tbody > tr > td {
        padding: 12px 16px;
        border-bottom: 1px solid #f0f2f5;
      }
      
      .license-table .ant-table-tbody > tr:hover > td {
        background-color: #f5f8ff;
      }
      
      .license-table .ant-table-tbody > tr:nth-child(even) {
        background-color: #fafbfc;
      }
      
      .code-column {
        display: inline-block;
        font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
        padding: 4px 8px;
        background-color: #f6f8fa;
        border-radius: 4px;
        border: 1px solid #eaeaea;
        color: #24292e;
        max-width: 200px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      
      .ant-pro-table-search-form {
        padding: 20px;
        background: white;
        border-radius: 8px;
        margin-bottom: 16px;
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
      }
      
      .ant-pro-table-search-form .ant-form-item {
        margin-bottom: 16px;
      }
      
      .ant-table-pagination.ant-pagination {
        margin: 16px 0;
        background: white;
        padding: 8px;
        border-radius: 8px;
      }
      
      .action-button {
        padding: 0 8px;
        border: none;
        border-radius: 4px;
        background-color: #f7f7f7;
        color: #333;
        cursor: pointer;
        transition: background-color 0.2s ease-in-out;
      }
      
      .action-button:hover {
        background-color: #e6e6e6;
      }
      
      .action-button.edit-button {
        background-color: #87d068;
        color: #fff;
      }
      
      .action-button.edit-button:hover {
        background-color: #64bd5d;
      }
      
      .action-button.delete-button {
        background-color: #f5222d;
        color: #fff;
      }
      
      .action-button.delete-button:hover {
        background-color: #ff3737;
      }
    `;
    document.head.appendChild(styleElement);
    
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  // 请求授权数据的函数（用于手动触发刷新）
  const requestLicenseList = async (params: any) => {
    console.log('ProTable触发request调用，参数:', params);
    
    // 设置页码和每页数量
    const queryParams: LicenseQuery = {
      page: params.current || 1,
      pageSize: params.pageSize || 10,
      
      // 关键字搜索
      keyword: params.keyword || '',
      
      // 状态过滤
      status: params.status || '',
      
      // 客户过滤
      customerId: params.group_id || '',
      
      // 排序
      sortBy: params.sortBy || '',
      sortOrder: params.sortOrder || ''
    };
    
    // 处理排序参数
    if (params.sorter && params.sorter.field) {
      const sortField = params.sorter.field.toString();
      const sortOrder = params.sorter.order === 'descend' ? 'desc' : 'asc';
      
      queryParams.sortBy = sortField;
      queryParams.sortOrder = sortOrder;
    }
    
    try {
      console.log('ProTable将获取授权列表，发送参数:', JSON.stringify(queryParams));
      
      // 直接从API获取最新数据，不依赖缓存
      const response = await licenseService.getLicenses(queryParams);
      console.log('授权列表API响应对象:', JSON.stringify(response));
      
      if (response && response.success) {
        // 确保data格式正确，支持不同的数据结构
        const items = response.data?.list || response.data?.items || [];
        const total = response.data?.total || 0;
        
        console.log(`授权列表数据处理：获取到${items.length}条记录，总计${total}条`);
        
        // 对每个项目进行处理，确保所有必要字段都存在
        const processedItems = items.map(item => ({
          ...item,
          // 确保这些字段有默认值
          code: item.code || '-',
          status: item.status || 'unknown'
        }));
        
        if (processedItems.length > 0) {
          console.log('处理后的第一条授权数据:', processedItems[0]);
        }
        
        return {
          data: processedItems,
          success: true,
          total: total
        };
      }
      
      return {
        data: [],
        success: false,
        total: 0
      };
    } catch (error) {
      console.error('获取授权列表失败:', error);
      return {
        data: [],
        success: false,
        total: 0
      };
    }
  };

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
      onSuccess: (response) => {
        console.log('删除授权结果:', response);
        
        if (response && response.success) {
          message.success('删除授权成功');
          queryClient.invalidateQueries(['licenses']);
          actionRef.current?.reload();
        } else {
          // 处理API成功返回但业务失败的情况
          console.error('删除授权业务处理失败:', response);
          message.error(`删除授权失败: ${response.message || '未知错误'}`);
        }
      },
      onError: (error: any) => {
        console.error('删除授权请求失败:', error);
        let errorMsg = '删除授权失败';
        
        if (error.response && error.response.data) {
          errorMsg = `删除授权失败: ${error.response.data.error_message || error.response.data.message || '服务器错误'}`;
        } else if (error.message) {
          errorMsg = `删除授权失败: ${error.message}`;
        }
        
        message.error(errorMsg);
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
      dataIndex: 'code',
      key: 'code',
      copyable: true,
      ellipsis: true,
      width: 250,
      render: (text, record) => {
        // 优先使用code字段，如果没有则尝试使用key字段
        const keyText = text || record.key || '-';
        
        // 确保key是显示出来的
        return (
          <span className="code-column" title={keyText}>
            {keyText}
          </span>
        );
      }
    },
    {
      title: '授权状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      align: 'center',
      filters: [
        { text: '有效', value: 'active' },
        { text: '过期', value: 'expired' },
        { text: '暂停', value: 'suspended' },
        { text: '未使用', value: 'unused' },
        { text: '未激活', value: 'inactive' },
      ],
      valueEnum: {
        active: { text: '有效', status: 'Success' },
        expired: { text: '过期', status: 'Error' },
        suspended: { text: '暂停', status: 'Warning' },
        inactive: { text: '未激活', status: 'Default' },
        unused: { text: '未使用', status: 'Default' },
      },
      render: (_, record) => {
        // 根据状态设置不同的样式
        const statusConfig = {
          active: { color: '#52c41a', text: '有效', icon: <CheckCircleOutlined /> },
          expired: { color: '#f5222d', text: '过期', icon: <CloseCircleOutlined /> },
          suspended: { color: '#faad14', text: '暂停', icon: <PauseCircleOutlinedIcon /> },
          inactive: { color: '#d9d9d9', text: '未激活', icon: <MinusCircleOutlined /> },
          unused: { color: '#1890ff', text: '未使用', icon: <ExclamationCircleOutlined /> },
        };
        
        const config = statusConfig[record.status] || { color: '#d9d9d9', text: record.status || '未知', icon: null };
        
        return (
          <Tag 
            color={config.color}
            icon={config.icon}
            style={{ 
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 8px',
              fontWeight: 500
            }}
          >
            {config.text}
          </Tag>
        );
      },
    },
    {
      title: '授权类型',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      align: 'center',
      filters: [
        { text: '标准版', value: 'standard' },
        { text: '企业版', value: 'enterprise' },
        { text: '永久版', value: 'perpetual' },
      ],
      valueEnum: {
        standard: { text: '标准版', status: 'Default' },
        enterprise: { text: '企业版', status: 'Processing' },
        perpetual: { text: '永久版', status: 'Success' },
      },
      render: (text) => {
        const typeMap = {
          standard: { text: '标准版', color: '#8c8c8c' },
          enterprise: { text: '企业版', color: '#1890ff' },
          perpetual: { text: '永久版', color: '#52c41a' },
        };
        const type = typeMap[text] || { text: text || '-', color: '#8c8c8c' };
        return <Tag color={type.color}>{type.text}</Tag>;
      }
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      width: 150,
      render: (val) => val || '-',
    },
    {
      title: '客户',
      dataIndex: 'group_id',
      key: 'group_id',
      ellipsis: true,
      width: 150,
      filters: customers.map(c => ({ text: c.name, value: c.id })),
      filterSearch: true,
      render: (_, record) => {
        const customer = customers.find(c => c.id === (record.group_id || record.customerId));
        return <Tag color="blue">{customer?.name || record.group_id || record.customerId || '-'}</Tag>;
      },
    },
    {
      title: '产品',
      dataIndex: 'productName',
      key: 'productId',
      width: 100,
      ellipsis: true,
      filters: products.map(p => ({ text: p.name, value: p.id })),
      render: (_, record) => {
        const product = products.find(p => p.id === (record.product_id || record.productId));
        return product?.name || '-';
      },
    },
    {
      title: '设备数',
      dataIndex: 'max_devices',
      key: 'max_devices',
      align: 'center',
      width: 80,
      sorter: true,
      render: (val) => <Badge count={val || 0} overflowCount={99} showZero style={{ backgroundColor: val ? '#52c41a' : '#d9d9d9' }} />,
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 160,
      sorter: true,
      render: (val) => <span style={{ color: '#666' }}>{formatDateTime(val)}</span>,
    },
    {
      title: '过期时间',
      dataIndex: 'expire_time',
      key: 'expire_time',
      width: 160,
      sorter: true,
      render: (_, record) => {
        if (record.type === 'perpetual') {
          return <Tag color="green">永不过期</Tag>;
        }
        
        // 检查所有可能的过期时间字段
        const expireTimeValue = record.expire_time || record.expiryDate || record.expires_at || record.ExpiresAt;
        
        // 如果没有过期时间，显示提示
        if (!expireTimeValue) {
          return <Tag color="orange">未设置</Tag>;
        }
        
        // 检查是否过期
        const expireDate = new Date(expireTimeValue);
        const now = new Date();
        const isExpired = expireDate < now;
        
        // 格式化日期显示
        let formattedDate;
        try {
          formattedDate = formatDateTime(expireTimeValue);
        } catch (e) {
          console.error('日期格式化错误:', e, expireTimeValue);
          formattedDate = String(expireTimeValue);
        }
        
        return (
          <span style={{ color: isExpired ? '#ff4d4f' : '#666' }} title={formattedDate}>
            {formattedDate}
          </span>
        );
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      align: 'center',
      fixed: 'right',
      render: (_, record) => (
        <Space size={4} style={{ display: 'flex', justifyContent: 'center' }}>
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            className="action-button"
            style={{ marginRight: 0, padding: '2px 4px' }}
            onClick={() => navigate(`/license/detail/${record.id}`)}
          />
          
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            className="action-button edit-button"
            style={{ marginRight: 0, padding: '2px 4px' }}
            onClick={() => navigate(`/license/form/${record.id}`)}
          />
          
          <Popconfirm
            key="delete"
            title="确定要删除此授权吗？"
            onConfirm={() => {
              console.log(`开始删除授权，ID: ${record.id}，类型: ${typeof record.id}`);
              console.log('授权完整数据:', record);
              deleteMutation.mutate(record.id);
            }}
          >
            <Button
              type="link"
              size="small"
              danger
              icon={<DeleteOutlined />}
              className="action-button delete-button"
              style={{ marginRight: 0, padding: '2px 4px' }}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <PageContainer title="授权管理">
      <ProTable<License, LicenseQuery>
        className="license-table"
        actionRef={actionRef}
        rowKey="id"
        columns={columns}
        cardBordered
        scroll={{ x: 'max-content' }}
        search={{
          labelWidth: 'auto',
          defaultCollapsed: false,
        }}
        form={{
          colon: false,
          labelAlign: 'right',
        }}
        dateFormatter="string"
        headerTitle={<Typography.Title level={4} style={{ margin: 0 }}>授权列表</Typography.Title>}
        toolBarRender={() => [
          <Button
            key="export"
            type="default"
            icon={<DownloadOutlined />}
            onClick={() => {
              const form = actionRef.current?.getFieldsValue?.();
              handleExport(form as LicenseQuery);
            }}
            loading={exporting}
            style={{ marginRight: 8 }}
          >
            导出
          </Button>,
          <Button
            key="add"
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate('/license/form')}
            style={{ marginRight: 8 }}
          >
            新增授权
          </Button>,
        ]}
        options={{
          density: true,
          fullScreen: true,
          reload: () => {
            console.log('检测到refresh=true参数，强制刷新授权列表');
            actionRef.current?.reload(true);
          },
          setting: true,
        }}
        pagination={{
          showQuickJumper: true,
          pageSize: 10,
          defaultPageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `共 ${total} 条记录`
        }}
        request={requestLicenseList}
        rowSelection={{
          onChange: (_, selectedRows) => {
            setSelectedRows(selectedRows);
          },
        }}
      />
    </PageContainer>
  );
};

export default LicensePage;
