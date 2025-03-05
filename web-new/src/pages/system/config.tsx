import React, { useState } from 'react';
import { 
  Button, 
  Space, 
  Card, 
  message, 
  Modal, 
  Form, 
  Input, 
  Select,
  Tooltip,
  Typography,
  Divider
} from 'antd';
import { 
  EditOutlined, 
  SaveOutlined, 
  ReloadOutlined,
  SearchOutlined
} from '@ant-design/icons';
import { ProTable } from '@ant-design/pro-components';
import type { ProColumns, ActionType } from '@ant-design/pro-components';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { systemService } from '../../services/system';
import { SystemConfig as SystemConfigType } from '../../models/system';
import { formatDateTime } from '../../utils/utils';
import PageContainer from '../../components/PageContainer';

const { Text } = Typography;

const SystemConfig: React.FC = () => {
  const actionRef = React.useRef<ActionType>();
  const queryClient = useQueryClient();
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [currentConfig, setCurrentConfig] = useState<SystemConfigType | null>(null);
  const [editForm] = Form.useForm();
  
  // 获取系统配置数据
  const { isLoading } = useQuery(
    ['systemConfig'],
    () => systemService.getSystemConfig(),
    {
      onError: (error) => {
        console.error('加载系统配置失败:', error);
        message.error('加载系统配置失败');
      },
      staleTime: 300000, // 5分钟内不重新获取
    }
  );

  // 更新配置的变更
  const updateConfigMutation = useMutation(
    (values: any) => systemService.updateSystemConfig(values.name, values.value),
    {
      onSuccess: () => {
        message.success('配置更新成功');
        setEditModalVisible(false);
        queryClient.invalidateQueries(['systemConfig']);
        actionRef.current?.reload();
      },
      onError: (error) => {
        console.error('更新配置失败:', error);
        message.error('更新配置失败');
      }
    }
  );

  // 重置系统配置
  const resetConfigMutation = useMutation(
    () => systemService.resetSystemConfig(),
    {
      onSuccess: () => {
        message.success('系统配置已重置为默认值');
        queryClient.invalidateQueries(['systemConfig']);
        actionRef.current?.reload();
      },
      onError: (error) => {
        console.error('重置配置失败:', error);
        message.error('重置配置失败');
      }
    }
  );

  // 处理编辑配置
  const handleEditConfig = (record: SystemConfigType) => {
    setCurrentConfig(record);
    editForm.setFieldsValue({
      id: record.id,
      name: record.name,
      value: record.value,
      description: record.description
    });
    setEditModalVisible(true);
  };

  // 处理提交编辑
  const handleSubmitEdit = (values: any) => {
    updateConfigMutation.mutate(values);
  };

  // 表格列配置
  const columns: ProColumns<SystemConfigType>[] = [
    {
      title: '配置键',
      dataIndex: 'name',
      key: 'name',
      copyable: true,
      ellipsis: true,
      width: 180,
    },
    {
      title: '配置值',
      dataIndex: 'value',
      key: 'value',
      copyable: true,
      ellipsis: true,
      render: (text: string, record: SystemConfigType) => {
        // 确保text始终为字符串
        const value = text === undefined || text === null ? '' : String(text);
        
        // 根据记录中的name值来决定如何渲染
        if (record.name.includes('password') || record.name.includes('secret')) {
          return '*'.repeat(8); // 敏感信息用星号代替
        }
        
        // 布尔值特殊处理
        if (value === 'true' || value === 'false') {
          return <Text type={value === 'true' ? 'success' : 'secondary'}>{value}</Text>;
        }
        
        return value;
      },
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: 180,
      valueType: 'dateTime',
      render: (text: string) => formatDateTime(text || ''),
    },
    {
      title: '操作',
      key: 'action',
      width: 80,
      valueType: 'option',
      render: (_, record: SystemConfigType) => [
        <Tooltip key="edit" title="编辑">
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEditConfig(record)}
          />
        </Tooltip>,
      ],
    },
  ];

  return (
    <div className="config-page">
      <Card>
        <ProTable<SystemConfigType>
          headerTitle="系统配置"
          actionRef={actionRef}
          rowKey="id"
          search={{
            labelWidth: 120,
            filterType: 'light',
          }}
          options={{
            density: true,
            fullScreen: true,
            reload: true,
            setting: true,
          }}
          loading={isLoading}
          toolBarRender={() => [
            <Button
              key="reset"
              danger
              onClick={() => {
                Modal.confirm({
                  title: '重置确认',
                  content: '确定要将所有配置重置为默认值吗？此操作无法撤销。',
                  okText: '确定',
                  okButtonProps: { danger: true },
                  cancelText: '取消',
                  onOk: () => {
                    resetConfigMutation.mutate();
                  },
                });
              }}
            >
              重置所有
            </Button>,
            <Button
              key="reload"
              icon={<ReloadOutlined />}
              onClick={() => {
                queryClient.invalidateQueries(['systemConfig']);
                actionRef.current?.reload();
              }}
            >
              刷新
            </Button>,
          ]}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
          }}
          columns={columns}
          request={async (params, sort, filter) => {
            try {
              const response = await systemService.getSystemConfig();
              const data = response.data || [];
              
              let filteredData = [...data];
              
              // 处理搜索
              if (params.keyword) {
                const keyword = params.keyword.toLowerCase();
                filteredData = filteredData.filter(
                  item => 
                    item.name.toLowerCase().includes(keyword) || 
                    (item.description && item.description.toLowerCase().includes(keyword))
                );
              }
              
              return {
                data: filteredData,
                success: true,
                total: filteredData.length,
              };
            } catch (error) {
              message.error('获取系统配置失败');
              return {
                data: [],
                success: false,
                total: 0,
              };
            }
          }}
        />
      </Card>
      
      {/* 编辑配置对话框 */}
      <Modal
        title="编辑系统配置"
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setEditModalVisible(false)}>
            取消
          </Button>,
          <Button
            key="submit"
            type="primary"
            icon={<SaveOutlined />}
            loading={updateConfigMutation.isLoading}
            onClick={() => editForm.submit()}
          >
            保存
          </Button>,
        ]}
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={handleSubmitEdit}
        >
          <Form.Item name="id" hidden>
            <Input />
          </Form.Item>
          <Form.Item
            label="配置键"
            name="name"
          >
            <Input disabled />
          </Form.Item>
          <Form.Item
            label="配置值"
            name="value"
            rules={[{ required: true, message: '请输入配置值' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="描述"
            name="description"
          >
            <Input disabled />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default SystemConfig;
