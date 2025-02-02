import { PlusOutlined } from '@ant-design/icons';
import { ActionType, PageContainer, ProTable } from '@ant-design/pro-components';
import { Button, Form, Input, Modal, message } from 'antd';
import { useRef, useState } from 'react';
import StatusTag from '@/components/StatusTag';
import { Device, DeviceCreateRequest, DeviceUpdateRequest } from '@/models/device';
import { deviceService } from '@/services/device';
import ConfirmModal from '@/components/ConfirmModal';

export default function DevicePage() {
  const [form] = Form.useForm();
  const actionRef = useRef<ActionType>();
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editingDevice, setEditingDevice] = useState<Device | null>(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);

  // 处理创建或更新设备
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingDevice) {
        await deviceService.update(editingDevice.id, values as DeviceUpdateRequest);
        message.success('设备更新成功');
      } else {
        await deviceService.create(values as DeviceCreateRequest);
        message.success('设备创建成功');
      }
      setCreateModalVisible(false);
      setEditingDevice(null);
      form.resetFields();
      actionRef.current?.reload();
    } catch (error: any) {
      message.error(error.message || '操作失败');
    }
  };

  // 处理删除设备
  const handleDelete = async () => {
    if (!selectedDevice) return;
    try {
      await deviceService.delete(selectedDevice.id);
      message.success('设备删除成功');
      setDeleteModalVisible(false);
      setSelectedDevice(null);
      actionRef.current?.reload();
    } catch (error: any) {
      message.error(error.message || '删除失败');
    }
  };

  const columns = [
    {
      title: '设备名称',
      dataIndex: 'name',
      width: 200,
    },
    {
      title: '序列号',
      dataIndex: 'serialNumber',
      width: 200,
    },
    {
      title: '设备类型',
      dataIndex: 'type',
      width: 150,
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (status: string) => <StatusTag status={status} type="device" />,
    },
    {
      title: '位置',
      dataIndex: 'location',
      width: 150,
    },
    {
      title: '最后在线时间',
      dataIndex: 'lastOnlineTime',
      width: 200,
    },
    {
      title: '操作',
      width: 180,
      valueType: 'option',
      render: (_: any, record: Device) => [
        <Button
          key="edit"
          type="link"
          onClick={() => {
            setEditingDevice(record);
            form.setFieldsValue(record);
            setCreateModalVisible(true);
          }}
        >
          编辑
        </Button>,
        <Button
          key="delete"
          type="link"
          danger
          onClick={() => {
            setSelectedDevice(record);
            setDeleteModalVisible(true);
          }}
        >
          删除
        </Button>,
      ],
    },
  ];

  return (
    <PageContainer>
      <ProTable<Device>
        headerTitle="设备列表"
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
              setEditingDevice(null);
              form.resetFields();
              setCreateModalVisible(true);
            }}
          >
            <PlusOutlined /> 新建
          </Button>,
        ]}
        request={async (params) => {
          const { current, pageSize, ...rest } = params;
          const response = await deviceService.list({
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
        title={editingDevice ? '编辑设备' : '新建设备'}
        open={createModalVisible}
        onOk={handleSubmit}
        onCancel={() => {
          setCreateModalVisible(false);
          setEditingDevice(null);
          form.resetFields();
        }}
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            name="name"
            label="设备名称"
            rules={[{ required: true, message: '请输入设备名称' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="serialNumber"
            label="序列号"
            rules={[{ required: true, message: '请输入序列号' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="type"
            label="设备类型"
            rules={[{ required: true, message: '请输入设备类型' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="location"
            label="位置"
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="description"
            label="描述"
          >
            <Input.TextArea rows={4} />
          </Form.Item>
        </Form>
      </Modal>

      <ConfirmModal
        title="确认删除"
        open={deleteModalVisible}
        onOk={handleDelete}
        onCancel={() => {
          setDeleteModalVisible(false);
          setSelectedDevice(null);
        }}
      >
        确定要删除设备 "{selectedDevice?.name}" 吗？此操作不可恢复。
      </ConfirmModal>
    </PageContainer>
  );
}
