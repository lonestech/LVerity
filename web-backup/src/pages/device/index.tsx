import { PlusOutlined } from '@ant-design/icons';
import { ActionType, PageContainer, ProTable, ProColumns } from '@ant-design/pro-components';
import { Button, Form, Input, Modal, Select, message } from 'antd';
import { useRef, useState } from 'react';
import StatusTag from '@/components/StatusTag';
import { Device, DeviceCreateRequest, DeviceUpdateRequest } from '@/models/device';
import { deviceService } from '@/services/device';
import ConfirmModal from '@/components/ConfirmModal';

export default function DevicePage() {
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [editingDevice, setEditingDevice] = useState<Device | null>(null);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [form] = Form.useForm();
  const actionRef = useRef<ActionType>();

  // 删除设备
  const handleDelete = async () => {
    if (selectedDevice) {
      try {
        await deviceService.delete(selectedDevice.id);
        message.success('设备删除成功');
        if (actionRef.current) {
          actionRef.current.reload();
        }
        setDeleteModalVisible(false);
      } catch (error: any) {
        message.error(error.message || '删除失败');
      }
    }
  };

  // 提交表单
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
      if (actionRef.current) {
        actionRef.current.reload();
      }
    } catch (error: any) {
      message.error(error.message || '操作失败');
    }
  };

  // 表格列配置
  const columns: ProColumns<Device>[] = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 220,
      copyable: true,
      ellipsis: true,
    },
    {
      title: '名称',
      dataIndex: 'name',
      width: 150,
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      valueType: 'select',
      valueEnum: {
        normal: { text: '正常', status: 'Success' },
        offline: { text: '离线', status: 'Default' },
        blocked: { text: '已封禁', status: 'Error' },
        suspect: { text: '可疑', status: 'Warning' },
        disabled: { text: '已禁用', status: 'Warning' },
      },
      render: (_, record) => <StatusTag status={record.status} />,
    },
    {
      title: '最后心跳',
      dataIndex: 'lastHeartbeat',
      width: 180,
    },
    {
      title: '最后在线',
      dataIndex: 'lastSeen',
      width: 180,
    },
    {
      title: '操作',
      width: 180,
      valueType: 'option',
      render: (_: any, record: Device) => [
        <a
          key="edit"
          onClick={() => {
            setEditingDevice(record);
            form.setFieldsValue(record);
            setCreateModalVisible(true);
          }}
        >
          编辑
        </a>,
        <a
          key="delete"
          style={{ color: '#ff4d4f' }}
          onClick={() => {
            setSelectedDevice(record);
            setDeleteModalVisible(true);
          }}
        >
          删除
        </a>,
      ],
    },
  ];

  return (
    <PageContainer>
      <ProTable<Device>
        headerTitle="设备管理"
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
            icon={<PlusOutlined />}
          >
            添加设备
          </Button>,
        ]}
        request={async (params) => {
          const response = await deviceService.list({
            page: params.current,
            pageSize: params.pageSize,
            ...params,
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
        title={editingDevice ? '编辑设备' : '添加设备'}
        open={createModalVisible}
        onOk={handleSubmit}
        onCancel={() => setCreateModalVisible(false)}
        width={540}
      >
        <Form
          form={form}
          layout="vertical"
          name="deviceForm"
          initialValues={{ status: 'normal' }}
        >
          <Form.Item
            name="name"
            label="设备名称"
            rules={[{ required: true, message: '请输入设备名称' }]}
          >
            <Input placeholder="请输入设备名称" />
          </Form.Item>
          
          {!editingDevice && (
            <>
              <Form.Item
                name="diskID"
                label="磁盘ID"
                rules={[{ required: true, message: '请输入磁盘ID' }]}
              >
                <Input placeholder="请输入磁盘ID" />
              </Form.Item>
              
              <Form.Item
                name="bios"
                label="BIOS序列号"
                rules={[{ required: true, message: '请输入BIOS序列号' }]}
              >
                <Input placeholder="请输入BIOS序列号" />
              </Form.Item>
              
              <Form.Item
                name="motherboard"
                label="主板序列号"
                rules={[{ required: true, message: '请输入主板序列号' }]}
              >
                <Input placeholder="请输入主板序列号" />
              </Form.Item>
            </>
          )}
          
          {editingDevice && (
            <Form.Item
              name="status"
              label="状态"
              rules={[{ required: true, message: '请选择状态' }]}
            >
              <Select>
                <Select.Option value="normal">正常</Select.Option>
                <Select.Option value="blocked">已封禁</Select.Option>
                <Select.Option value="disabled">已禁用</Select.Option>
              </Select>
            </Form.Item>
          )}
          
          <Form.Item
            name="description"
            label="描述"
          >
            <Input.TextArea rows={4} placeholder="请输入设备描述" />
          </Form.Item>
        </Form>
      </Modal>

      <ConfirmModal
        title="删除设备"
        visible={!!deleteModalVisible}
        onConfirm={handleDelete}
        onCancel={() => setDeleteModalVisible(false)}
        content={
          <div>
            <p>确定要删除设备 "{selectedDevice?.name}" 吗？</p>
            <p>此操作不可逆，删除后将无法恢复。</p>
          </div>
        }
      />
    </PageContainer>
  );
}
