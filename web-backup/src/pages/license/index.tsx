import { PlusOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import { ActionType, PageContainer, ProTable, ProColumns } from '@ant-design/pro-components';
import { Button, Form, Input, Modal, Select, DatePicker, message } from 'antd';
import { useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import StatusTag from '@/components/StatusTag';
import { License, LicenseCreateRequest, LicenseUpdateRequest } from '@/models/license';
import { licenseService } from '@/services/license';
import { deviceService } from '@/services/device';
import ConfirmModal from '@/components/ConfirmModal';
import DetailDrawer from '@/components/DetailDrawer';

const { RangePicker } = DatePicker;

export default function LicensePage() {
  const [form] = Form.useForm();
  const actionRef = useRef<ActionType>();
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editingLicense, setEditingLicense] = useState<License | null>(null);
  const [revokeModalVisible, setRevokeModalVisible] = useState(false);
  const [selectedLicense, setSelectedLicense] = useState<License | null>(null);
  const [detailVisible, setDetailVisible] = useState(false);
  const [verifyModalVisible, setVerifyModalVisible] = useState(false);
  const [verifyForm] = Form.useForm();
  
  const queryClient = useQueryClient();

  // 获取设备列表
  const { data: devices } = useQuery({
    queryKey: ['devices'],
    queryFn: async () => {
      const response = await deviceService.list({ page: 1, pageSize: 1000 });
      return response.list;
    },
  });

  // 创建许可证
  const createMutation = useMutation({
    mutationFn: (data: LicenseCreateRequest) => licenseService.create(data),
    onSuccess: () => {
      message.success('许可证创建成功');
      setCreateModalVisible(false);
      form.resetFields();
      queryClient.invalidateQueries({ queryKey: ['licenses'] });
    },
  });

  // 更新许可证
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: LicenseUpdateRequest }) => 
      licenseService.update(id, data),
    onSuccess: () => {
      message.success('许可证更新成功');
      setCreateModalVisible(false);
      setEditingLicense(null);
      form.resetFields();
      queryClient.invalidateQueries({ queryKey: ['licenses'] });
    },
  });

  // 禁用许可证
  const revokeMutation = useMutation({
    mutationFn: (id: string) => licenseService.update(id, { status: 'revoked' }),
    onSuccess: () => {
      message.success('许可证已禁用');
      setRevokeModalVisible(false);
      setSelectedLicense(null);
      queryClient.invalidateQueries({ queryKey: ['licenses'] });
    },
  });

  // 处理创建许可证
  const handleCreate = async () => {
    try {
      const values = await form.validateFields();
      createMutation.mutate({
        ...values,
        startTime: values.dateRange[0].format('YYYY-MM-DD'),
        expireTime: values.dateRange[1].format('YYYY-MM-DD'),
        features: values.features || [],
      });
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  // 处理更新许可证
  const handleUpdate = async () => {
    if (!editingLicense) return;
    try {
      const values = await form.validateFields();
      updateMutation.mutate({
        id: editingLicense.id,
        data: {
          ...values,
          expireTime: values.dateRange ? values.dateRange[1].format('YYYY-MM-DD') : undefined,
          features: values.features || [],
        },
      });
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  // 处理吊销许可证
  const handleRevoke = () => {
    if (selectedLicense) {
      revokeMutation.mutate(selectedLicense.id);
    }
  };

  // 打开编辑模态框
  const showEditModal = (record: License) => {
    setEditingLicense(record);
    setCreateModalVisible(true);
    form.setFieldsValue({
      ...record,
      deviceID: record.deviceID || undefined,
      dateRange: record.startTime && record.expireTime ? [dayjs(record.startTime), dayjs(record.expireTime)] : undefined,
    });
  };

  // 显示许可证详情
  const showDetail = (record: License) => {
    setSelectedLicense(record);
    setDetailVisible(true);
  };

  // 处理验证许可证
  const handleVerify = async () => {
    try {
      const values = await verifyForm.validateFields();
      const result = await licenseService.getByCode(values.code);
      if (result) {
        message.success('许可证有效');
        setVerifyModalVisible(false);
        verifyForm.resetFields();
      }
    } catch (error) {
      console.error('验证失败:', error);
    }
  };

  // 表格列配置
  const columns: ProColumns<License>[] = [
    {
      title: '许可证密钥',
      dataIndex: 'key',
      width: 320,
      copyable: true,
      ellipsis: true,
    },
    {
      title: '类型',
      dataIndex: 'type',
      width: 120,
      valueEnum: {
        basic: { text: '基础版', status: 'Default' },
        standard: { text: '标准版', status: 'Processing' },
        pro: { text: '专业版', status: 'Success' },
        enterprise: { text: '企业版', status: 'Success' },
        trial: { text: '试用版', status: 'Warning' },
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 120,
      valueType: 'select',
      valueEnum: {
        unused: { text: '未使用', status: 'Default' },
        used: { text: '已使用', status: 'Processing' },
        expired: { text: '已过期', status: 'Error' },
        revoked: { text: '已吊销', status: 'Warning' },
      },
      render: (_, record) => <StatusTag status={record.status} />,
    },
    {
      title: '设备',
      dataIndex: 'deviceID',
      width: 150,
      render: (_, record) => {
        if (!record.deviceID) return '-';
        const device = devices?.find(d => d.id === record.deviceID);
        return device ? device.name : record.deviceID;
      },
    },
    {
      title: '开始日期',
      dataIndex: 'startTime',
      width: 120,
      valueType: 'date',
    },
    {
      title: '结束日期',
      dataIndex: 'expireTime',
      width: 120,
      valueType: 'date',
    },
    {
      title: '操作',
      width: 180,
      valueType: 'option',
      render: (_, record: License) => [
        <a key="detail" onClick={() => showDetail(record)}>
          详情
        </a>,
        <a key="edit" onClick={() => showEditModal(record)}>
          编辑
        </a>,
        <a key="revoke" onClick={() => {
          setSelectedLicense(record);
          setRevokeModalVisible(true);
        }}>
          禁用
        </a>,
      ],
    },
  ];

  return (
    <PageContainer>
      <ProTable<License>
        headerTitle="许可证管理"
        actionRef={actionRef}
        rowKey="id"
        search={{
          labelWidth: 120,
        }}
        toolBarRender={() => [
          <Button
            key="verify"
            type="default"
            onClick={() => setVerifyModalVisible(true)}
            icon={<SafetyCertificateOutlined />}
          >
            验证许可证
          </Button>,
          <Button
            key="create"
            type="primary"
            onClick={() => {
              setEditingLicense(null);
              setCreateModalVisible(true);
              form.resetFields();
            }}
            icon={<PlusOutlined />}
          >
            创建许可证
          </Button>,
        ]}
        request={async (params) => {
          const { current, pageSize, ...rest } = params;
          const result = await licenseService.list({
            page: current,
            pageSize,
            ...rest,
          });
          return {
            data: result.list,
            success: true,
            total: result.total,
          };
        }}
        columns={columns}
      />

      {/* 创建/编辑许可证表单 */}
      <Modal
        title={editingLicense ? '编辑许可证' : '创建许可证'}
        open={createModalVisible}
        onOk={editingLicense ? handleUpdate : handleCreate}
        onCancel={() => {
          setCreateModalVisible(false);
          setEditingLicense(null);
          form.resetFields();
        }}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
        >
          {!editingLicense && (
            <Form.Item
              name="type"
              label="许可证类型"
              rules={[{ required: true, message: '请选择许可证类型' }]}
            >
              <Select>
                <Select.Option value="basic">基础版</Select.Option>
                <Select.Option value="standard">标准版</Select.Option>
                <Select.Option value="pro">专业版</Select.Option>
                <Select.Option value="enterprise">企业版</Select.Option>
                <Select.Option value="trial">试用版</Select.Option>
              </Select>
            </Form.Item>
          )}

          {!editingLicense && (
            <Form.Item
              name="dateRange"
              label="有效期"
              rules={[{ required: true, message: '请选择有效期' }]}
            >
              <RangePicker />
            </Form.Item>
          )}

          {editingLicense && (
            <Form.Item
              name="dateRange"
              label="结束日期"
            >
              <RangePicker />
            </Form.Item>
          )}

          <Form.Item
            name="deviceID"
            label="关联设备"
          >
            <Select allowClear placeholder="请选择关联设备">
              {devices?.map(device => (
                <Select.Option key={device.id} value={device.id}>
                  {device.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="features"
            label="功能权限"
          >
            <Select mode="multiple" placeholder="请选择功能权限">
              <Select.Option value="basic_stats">基础统计</Select.Option>
              <Select.Option value="advanced_stats">高级统计</Select.Option>
              <Select.Option value="export">导出数据</Select.Option>
              <Select.Option value="api_access">API访问</Select.Option>
              <Select.Option value="admin_panel">管理面板</Select.Option>
            </Select>
          </Form.Item>

          {editingLicense && (
            <Form.Item
              name="status"
              label="状态"
            >
              <Select>
                <Select.Option value="unused">未使用</Select.Option>
                <Select.Option value="used">已使用</Select.Option>
                <Select.Option value="expired">已过期</Select.Option>
                <Select.Option value="revoked">已吊销</Select.Option>
              </Select>
            </Form.Item>
          )}

          <Form.Item
            name="maxDevices"
            label="最大设备数"
            rules={[{ required: !editingLicense, message: '请输入最大设备数' }]}
          >
            <Input type="number" placeholder="可激活的最大设备数量" />
          </Form.Item>

          <Form.Item
            name="description"
            label="备注"
          >
            <Input.TextArea rows={4} placeholder="请输入备注信息" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 许可证详情抽屉 */}
      <DetailDrawer
        title="许可证详情"
        visible={detailVisible}
        onClose={() => setDetailVisible(false)}
        data={selectedLicense}
        fields={[
          { label: '授权码', key: 'code' },
          { label: '类型', key: 'type', render: (val: string) => {
            const types: Record<string, string> = {
              basic: '基础版',
              standard: '标准版',
              pro: '专业版',
              enterprise: '企业版',
              trial: '试用版',
            };
            return types[val] || val;
          }},
          { label: '状态', key: 'status', render: (val: string) => <StatusTag status={val} /> },
          { label: '关联设备', key: 'deviceID', render: (val: string) => {
            if (!val) return '-';
            const device = devices?.find(d => d.id === val);
            return device ? device.name : val;
          }},
          { label: '开始日期', key: 'startTime' },
          { label: '结束日期', key: 'expireTime' },
          { label: '最大设备数', key: 'maxDevices' },
          { label: '功能权限', key: 'features', render: (val: string[]) => (val || []).join(', ') },
          { label: '备注', key: 'description' },
          { label: '创建时间', key: 'createdAt' },
          { label: '更新时间', key: 'updatedAt' },
        ]}
      />

      {/* 吊销许可证确认 */}
      <ConfirmModal
        title="吊销许可证"
        content="确定要吊销此许可证吗？吊销后，该许可证将无法使用。"
        visible={revokeModalVisible}
        onConfirm={handleRevoke}
        onCancel={() => {
          setRevokeModalVisible(false);
          setSelectedLicense(null);
        }}
      />

      {/* 验证许可证模态框 */}
      <Modal
        title="验证许可证"
        open={verifyModalVisible}
        onOk={handleVerify}
        onCancel={() => {
          setVerifyModalVisible(false);
          verifyForm.resetFields();
        }}
      >
        <Form
          form={verifyForm}
          layout="vertical"
        >
          <Form.Item
            name="code"
            label="许可证码"
            rules={[{ required: true, message: '请输入许可证码' }]}
          >
            <Input placeholder="请输入要验证的许可证码" />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
}
