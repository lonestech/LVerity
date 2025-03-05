import React, { useState } from 'react';
import { 
  Button, 
  Space, 
  Tooltip, 
  Popconfirm, 
  message, 
  Modal, 
  Form, 
  Select, 
  Input, 
  Alert,
  Result,
  Progress,
  Card
} from 'antd';
import { 
  PlusOutlined, 
  DownloadOutlined, 
  DeleteOutlined, 
  RedoOutlined, 
  ExclamationCircleOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { ProTable } from '@ant-design/pro-components';
import type { ProColumns, ActionType } from '@ant-design/pro-components';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { systemService } from '../../services/system';
import { BackupInfo } from '../../models/system';
import { formatDateTime, formatFileSize } from '../../utils/utils';
import StatusTag from '../../components/StatusTag';
import PageContainer from '../../components/PageContainer';

const SystemBackup: React.FC = () => {
  const actionRef = React.useRef<ActionType>();
  const queryClient = useQueryClient();
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [createForm] = Form.useForm();
  const [progress, setProgress] = useState(0);
  const [progressModalVisible, setProgressModalVisible] = useState(false);
  const [progressType, setProgressType] = useState<'backup' | 'restore'>('backup');

  // 获取备份列表数据
  const { isLoading } = useQuery(
    ['backups'],
    () => systemService.getBackups(),
    {
      onError: (error) => {
        console.error('加载备份列表失败:', error);
        message.error('加载备份列表失败');
      },
      staleTime: 30000, // 30秒内不重新获取
    }
  );

  // 创建备份
  const createBackupMutation = useMutation(
    (type: string) => systemService.createBackup({ name: `backup_${new Date().getTime()}`, type }),
    {
      onMutate: () => {
        setProgressType('backup');
        setProgress(0);
        setProgressModalVisible(true);
        
        // 模拟进度增加
        const interval = setInterval(() => {
          setProgress(prev => {
            if (prev >= 90) {
              clearInterval(interval);
              return prev;
            }
            return prev + Math.floor(Math.random() * 5) + 1;
          });
        }, 500);
        
        return { interval };
      },
      onSuccess: () => {
        setProgress(100);
        setTimeout(() => {
          setProgressModalVisible(false);
          setCreateModalVisible(false);
          createForm.resetFields();
          message.success('备份创建成功');
          queryClient.invalidateQueries(['backups']);
          actionRef.current?.reload();
        }, 500);
      },
      onError: (error) => {
        console.error('创建备份失败:', error);
        message.error('创建备份失败');
        setProgressModalVisible(false);
      },
      onSettled: (_, __, ___, context: any) => {
        if (context?.interval) {
          clearInterval(context.interval);
        }
      }
    }
  );

  // 下载备份
  const downloadBackupMutation = useMutation(
    (id: string) => systemService.downloadBackup(id),
    {
      onSuccess: () => {
        message.success('备份文件已开始下载');
      },
      onError: (error) => {
        console.error('下载备份失败:', error);
        message.error('下载备份失败');
      }
    }
  );

  // 恢复备份
  const restoreBackupMutation = useMutation(
    (id: string) => systemService.restoreBackup(id),
    {
      onMutate: () => {
        setProgressType('restore');
        setProgress(0);
        setProgressModalVisible(true);
        
        // 模拟进度增加
        const interval = setInterval(() => {
          setProgress(prev => {
            if (prev >= 95) {
              clearInterval(interval);
              return prev;
            }
            return prev + Math.floor(Math.random() * 5) + 1;
          });
        }, 400);
        
        return { interval };
      },
      onSuccess: () => {
        setProgress(100);
        setTimeout(() => {
          setProgressModalVisible(false);
          message.success('备份恢复成功，系统已更新');
          queryClient.invalidateQueries(['backups']);
          actionRef.current?.reload();
        }, 500);
      },
      onError: (error) => {
        console.error('恢复备份失败:', error);
        message.error('恢复备份失败');
        setProgressModalVisible(false);
      },
      onSettled: (_, __, ___, context: any) => {
        if (context?.interval) {
          clearInterval(context.interval);
        }
      }
    }
  );

  // 删除备份
  const deleteBackupMutation = useMutation(
    (id: string) => systemService.deleteBackup(id),
    {
      onSuccess: () => {
        message.success('删除备份成功');
        queryClient.invalidateQueries(['backups']);
        actionRef.current?.reload();
      },
      onError: (error) => {
        console.error('删除备份失败:', error);
        message.error('删除备份失败');
      }
    }
  );

  // 处理创建备份
  const handleCreateBackup = (values: any) => {
    createBackupMutation.mutate(values.type);
  };

  // 处理下载备份
  const handleDownloadBackup = (id: string) => {
    downloadBackupMutation.mutate(id);
  };

  // 处理恢复备份
  const handleRestoreBackup = (id: string) => {
    Modal.confirm({
      title: '恢复确认',
      icon: <ExclamationCircleOutlined />,
      content: '恢复备份将会覆盖当前系统数据，确定要继续吗？',
      okText: '确定',
      okButtonProps: { danger: true },
      cancelText: '取消',
      onOk: () => {
        restoreBackupMutation.mutate(id);
      },
    });
  };

  // 处理删除备份
  const handleDeleteBackup = (id: string) => {
    deleteBackupMutation.mutate(id);
  };

  // 表格列配置
  const columns: ProColumns<BackupInfo>[] = [
    {
      title: '备份名称',
      dataIndex: 'filename',
      key: 'filename',
      ellipsis: true,
    },
    {
      title: '备份类型',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      filters: [
        { text: '全量备份', value: 'full' },
        { text: '数据备份', value: 'data' },
        { text: '配置备份', value: 'config' },
        { text: '日志备份', value: 'log' },
      ],
      valueEnum: {
        full: { text: '全量备份' },
        data: { text: '数据备份' },
        config: { text: '配置备份' },
        log: { text: '日志备份' },
      },
      render: (type: string) => {
        let text = '全量备份';
        if (type === 'data') text = '数据备份';
        else if (type === 'config') text = '配置备份';
        else if (type === 'log') text = '日志备份';
        
        return <span>{text}</span>;
      },
    },
    {
      title: '大小',
      dataIndex: 'size',
      key: 'size',
      width: 120,
      sorter: true,
      render: (size: number) => formatFileSize(size),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      filters: [
        { text: '完成', value: 'completed' },
        { text: '进行中', value: 'pending' },
        { text: '失败', value: 'failed' },
      ],
      valueEnum: {
        completed: { text: '完成', status: 'Success' },
        pending: { text: '进行中', status: 'Processing' },
        failed: { text: '失败', status: 'Error' },
      },
      render: (_, record) => {
        // 确保status是字符串，而不是未定义或其他类型
        const statusValue = typeof record.status === 'string' ? record.status : 'completed';
        
        return (
          <StatusTag 
            status={statusValue} 
            customMapping={{
              completed: { color: 'success', text: '完成', icon: undefined },
              pending: { color: 'processing', text: '进行中', icon: undefined },
              failed: { color: 'error', text: '失败', icon: undefined },
            }}
          />
        );
      },
    },
    {
      title: '创建者',
      dataIndex: 'createdBy',
      key: 'createdBy',
      width: 120,
      ellipsis: true,
      render: (user: string) => user || '-',
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
      width: 180,
      valueType: 'option',
      render: (_, record) => [
        <Tooltip key="download" title="下载">
          <Button
            type="text"
            icon={<DownloadOutlined />}
            onClick={() => handleDownloadBackup(record.id)}
            disabled={record.status !== 'completed'}
          />
        </Tooltip>,
        <Tooltip key="restore" title="恢复">
          <Button
            type="text"
            danger
            icon={<RedoOutlined />}
            onClick={() => handleRestoreBackup(record.id)}
            disabled={record.status !== 'completed'}
          />
        </Tooltip>,
        <Tooltip key="delete" title="删除">
          <Popconfirm
            title="确定要删除此备份吗？"
            onConfirm={() => handleDeleteBackup(record.id)}
            okText="确定"
            cancelText="取消"
            placement="left"
          >
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
            />
          </Popconfirm>
        </Tooltip>,
      ],
    },
  ];

  // 新建备份表单
  const CreateBackupForm = (
    <Form form={createForm} layout="vertical" onFinish={handleCreateBackup}>
      <Form.Item
        name="type"
        label="备份类型"
        rules={[{ required: true, message: '请选择备份类型' }]}
        initialValue="full"
      >
        <Select>
          <Select.Option value="full">全量备份</Select.Option>
          <Select.Option value="data">数据备份</Select.Option>
          <Select.Option value="config">配置备份</Select.Option>
          <Select.Option value="log">日志备份</Select.Option>
        </Select>
      </Form.Item>
      <Form.Item name="description" label="备份描述">
        <Input.TextArea rows={3} placeholder="可选，填写备份的相关说明" />
      </Form.Item>
    </Form>
  );

  return (
    <div className="backup-page">
      <Card>
        <Alert
          message="备份与恢复"
          description="定期备份系统数据可以防止数据丢失，恢复备份将会覆盖当前系统数据，请谨慎操作。"
          type="info"
          showIcon
          style={{ marginBottom: 24 }}
        />
        
        <ProTable<BackupInfo>
          headerTitle="系统备份"
          actionRef={actionRef}
          rowKey="id"
          search={false}
          loading={isLoading}
          options={{
            density: true,
            fullScreen: true,
            reload: true,
            setting: true,
          }}
          toolBarRender={() => [
            <Button 
              key="create" 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={() => setCreateModalVisible(true)}
            >
              新建备份
            </Button>,
            <Button 
              key="refresh" 
              icon={<ReloadOutlined />}
              onClick={() => {
                queryClient.invalidateQueries(['backups']);
                actionRef.current?.reload();
              }}
            >
              刷新
            </Button>,
          ]}
          pagination={{
            defaultPageSize: 10,
            showSizeChanger: true,
          }}
          columns={columns}
          request={async (params) => {
            try {
              const response = await systemService.getBackups();
              if (response && response.success && response.data) {
                const backups = Array.isArray(response.data) ? response.data : [];
                return {
                  data: backups,
                  success: true,
                  total: backups.length || 0,
                };
              }
              return {
                data: [],
                success: false,
                total: 0,
              };
            } catch (error) {
              message.error('获取备份列表失败');
              return {
                data: [],
                success: false,
                total: 0,
              };
            }
          }}
        />
      </Card>

      {/* 创建备份对话框 */}
      <Modal
        title="新建系统备份"
        open={createModalVisible}
        onOk={() => createForm.submit()}
        onCancel={() => setCreateModalVisible(false)}
        maskClosable={false}
      >
        {CreateBackupForm}
      </Modal>

      {/* 进度对话框 */}
      <Modal
        title={progressType === 'backup' ? "备份进度" : "恢复进度"}
        open={progressModalVisible}
        footer={null}
        closable={false}
        maskClosable={false}
      >
        <Progress 
          percent={progress} 
          status={progress < 100 ? "active" : "success"} 
          strokeWidth={10}
        />
        <div style={{ textAlign: 'center', marginTop: 20 }}>
          {progress < 100 ? (
            <p>{progressType === 'backup' ? "正在创建备份..." : "正在恢复系统数据..."}</p>
          ) : (
            <Result
              status="success"
              title={progressType === 'backup' ? "备份完成" : "恢复完成"}
              subTitle={progressType === 'backup' ? "系统备份已创建成功" : "系统数据已恢复成功"}
            />
          )}
        </div>
      </Modal>
    </div>
  );
};

export default SystemBackup;
