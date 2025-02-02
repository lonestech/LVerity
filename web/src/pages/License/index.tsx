import { PlusOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import { ActionType, PageContainer, ProTable } from '@ant-design/pro-components';
import { Button, Form, Input, Modal, Select, DatePicker, Space, message } from 'antd';
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
      const response = await deviceService.list({ current: 1, pageSize: 1000 });
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
    mutationFn: ({ id, data }: { id: number; data: LicenseUpdateRequest }) => 
      licenseService.update(id, data),
    onSuccess: () => {
      message.success('许可证更新成功');
      setCreateModalVisible(false);
      setEditingLicense(null);
      form.resetFields();
      queryClient.invalidateQueries({ queryKey: ['licenses'] });
    },
  });

  // 吊销许可证
  const revokeMutation = useMutation({
    mutationFn: (id: number) => licenseService.revoke(id),
    onSuccess: () => {
      message.success('许可证已吊销');
      setRevokeModalVisible(false);
      setSelectedLicense(null);
      queryClient.invalidateQueries({ queryKey: ['licenses'] });
    },
  });

  // 验证许可证
  const verifyMutation = useMutation({
    mutationFn: (licenseKey: string) => licenseService.verify(licenseKey),
    onSuccess: (data) => {
      message.success('许可证验证成功');
      setVerifyModalVisible(false);
      verifyForm.resetFields();
    },
  });

  // 处理表单提交
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const [startDate, endDate] = values.period;
      const data = {
        ...values,
        startDate: startDate.format('YYYY-MM-DD'),
        endDate: endDate.format('YYYY-MM-DD'),
      };
      delete data.period;

      if (editingLicense) {
        await updateMutation.mutateAsync({ 
          id: editingLicense.id, 
          data: data as LicenseUpdateRequest 
        });
      } else {
        await createMutation.mutateAsync(data as LicenseCreateRequest);
      }
    } catch (error: any) {
      message.error(error.message || '操作失败');
    }
  };

  // 处理吊销许可证
  const handleRevoke = async () => {
    if (!selectedLicense) return;
    try {
      await revokeMutation.mutateAsync(selectedLicense.id);
    } catch (error: any) {
      message.error(error.message || '吊销失败');
    }
  };

  // 处理验证许可证
  const handleVerify = async () => {
    try {
      const values = await verifyForm.validateFields();
      await verifyMutation.mutateAsync(values.licenseKey);
    } catch (error: any) {
      message.error(error.message || '验证失败');
    }
  };

  const columns = [
    {
      title: '许可证密钥',
      dataIndex: 'licenseKey',
      width: 250,
      copyable: true,
    },
    {
      title: '设备',
      dataIndex: 'deviceId',
      width: 200,
      render: (deviceId: number) => 
        devices?.find(d => d.id === deviceId)?.name || deviceId,
    },
    {
      title: '类型',
      dataIndex: 'type',
      width: 150,
      valueEnum: {
        trial: { text: '试用版' },
        standard: { text: '标准版' },
        enterprise: { text: '企业版' },
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (status: string) => <StatusTag status={status} type="license" />,
    },
    {
      title: '有效期',
      dataIndex: 'startDate',
      width: 300,
      render: (_: any, record: License) => 
        `${record.startDate} 至 ${record.endDate}`,
    },
    {
      title: '操作',
      width: 200,
      valueType: 'option',
      render: (_: any, record: License) => [
        <Button
          key="detail"
          type="link"
          onClick={() => {
            setSelectedLicense(record);
            setDetailVisible(true);
          }}
        >
          详情
        </Button>,
        record.status === 'active' && [
          <Button
            key="edit"
            type="link"
            onClick={() => {
              setEditingLicense(record);
              form.setFieldsValue({
                ...record,
                period: [dayjs(record.startDate), dayjs(record.endDate)],
              });
              setCreateModalVisible(true);
            }}
          >
            编辑
          </Button>,
          <Button
            key="revoke"
            type="link"
            danger
            onClick={() => {
              setSelectedLicense(record);
              setRevokeModalVisible(true);
            }}
          >
            吊销
          </Button>,
        ],
      ],
    },
  ];

  return (
    <PageContainer>
      <ProTable<License>
        headerTitle="许可证列表"
        actionRef={actionRef}
        rowKey="id"
        search={{
          labelWidth: 120,
        }}
        toolBarRender={() => [
          <Button
            key="verify"
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
              form.resetFields();
              setCreateModalVisible(true);
            }}
          >
            <PlusOutlined /> 新建
          </Button>,
        ]}
        request={async (params) => {
          const { current, pageSize, ...rest } = params;
          const response = await licenseService.list({
            current,
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
        title={editingLicense ? '编辑许可证' : '新建许可证'}
        open={createModalVisible}
        onOk={handleSubmit}
        onCancel={() => {
          setCreateModalVisible(false);
          setEditingLicense(null);
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
            name="deviceId"
            label="设备"
            rules={[{ required: true, message: '请选择设备' }]}
          >
            <Select
              showSearch
              optionFilterProp="children"
              placeholder="请选择设备"
              options={devices?.map(device => ({
                label: device.name,
                value: device.id,
              }))}
            />
          </Form.Item>
          <Form.Item
            name="type"
            label="许可证类型"
            rules={[{ required: true, message: '请选择许可证类型' }]}
          >
            <Select>
              <Select.Option value="trial">试用版</Select.Option>
              <Select.Option value="standard">标准版</Select.Option>
              <Select.Option value="enterprise">企业版</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="period"
            label="有效期"
            rules={[{ required: true, message: '请选择有效期' }]}
          >
            <RangePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="features"
            label="功能特性"
          >
            <Select
              mode="tags"
              placeholder="请输入功能特性"
              style={{ width: '100%' }}
            />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="验证许可证"
        open={verifyModalVisible}
        onOk={handleVerify}
        onCancel={() => {
          setVerifyModalVisible(false);
          verifyForm.resetFields();
        }}
        confirmLoading={verifyMutation.isPending}
      >
        <Form
          form={verifyForm}
          layout="vertical"
        >
          <Form.Item
            name="licenseKey"
            label="许可证密钥"
            rules={[{ required: true, message: '请输入许可证密钥' }]}
          >
            <Input.TextArea 
              placeholder="请输入要验证的许可证密钥"
              rows={4}
            />
          </Form.Item>
        </Form>
      </Modal>

      <ConfirmModal
        title="确认吊销"
        open={revokeModalVisible}
        onOk={handleRevoke}
        onCancel={() => {
          setRevokeModalVisible(false);
          setSelectedLicense(null);
        }}
        confirmLoading={revokeMutation.isPending}
      >
        确定要吊销此许可证吗？此操作将导致许可证立即失效，且不可恢复。
      </ConfirmModal>

      <DetailDrawer
        title="许可证详情"
        open={detailVisible}
        onClose={() => {
          setDetailVisible(false);
          setSelectedLicense(null);
        }}
        fields={selectedLicense ? [
          { label: '许可证密钥', value: selectedLicense.licenseKey },
          { label: '设备', value: devices?.find(d => d.id === selectedLicense.deviceId)?.name },
          { label: '类型', value: {
            trial: '试用版',
            standard: '标准版',
            enterprise: '企业版',
          }[selectedLicense.type] },
          { label: '状态', value: <StatusTag status={selectedLicense.status} type="license" /> },
          { label: '开始时间', value: selectedLicense.startDate },
          { label: '结束时间', value: selectedLicense.endDate },
          { label: '功能特性', value: selectedLicense.features?.join(', ') || '-' },
          { label: '创建时间', value: selectedLicense.createdAt },
          { label: '更新时间', value: selectedLicense.updatedAt },
        ] : []}
      />
    </PageContainer>
  );
}
