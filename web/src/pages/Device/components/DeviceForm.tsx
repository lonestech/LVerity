import {
  DrawerForm,
  ProFormSelect,
  ProFormText,
  ProFormGroup,
  ProFormDigit,
} from '@ant-design/pro-components';
import { message } from 'antd';
import React from 'react';
import { createDevice, updateDevice, getDeviceGroups } from '@/services/device';

export type DeviceFormProps = {
  onSuccess: () => void;
  values?: API.Device;
  visible: boolean;
  onVisibleChange: (visible: boolean) => void;
};

const DeviceForm: React.FC<DeviceFormProps> = (props) => {
  const { visible, onVisibleChange, values, onSuccess } = props;

  const handleSubmit = async (formData: API.Device) => {
    try {
      if (values?.id) {
        await updateDevice(values.id, formData);
      } else {
        await createDevice(formData);
      }
      message.success('保存成功');
      onSuccess();
      return true;
    } catch (error) {
      message.error('保存失败');
      return false;
    }
  };

  return (
    <DrawerForm
      title={values ? '编辑设备' : '新建设备'}
      visible={visible}
      onVisibleChange={onVisibleChange}
      onFinish={handleSubmit}
      initialValues={values}
      width={720}
    >
      <ProFormText
        name="name"
        label="设备名称"
        placeholder="请输入设备名称"
        rules={[{ required: true, message: '请输入设备名称' }]}
      />
      <ProFormSelect
        name="status"
        label="状态"
        valueEnum={{
          normal: '正常',
          offline: '离线',
          blocked: '已禁用',
          suspect: '可疑',
        }}
        rules={[{ required: true, message: '请选择状态' }]}
      />
      <ProFormDigit
        name="risk_level"
        label="风险等级"
        min={0}
        max={100}
        fieldProps={{
          precision: 0,
          step: 10,
        }}
        tooltip="0-100之间的整数，数值越大风险越高"
      />
      <ProFormGroup title="硬件信息" collapsible>
        <ProFormText
          name="disk_id"
          label="硬盘ID"
          placeholder="请输入硬盘ID"
          rules={[{ required: true, message: '请输入硬盘ID' }]}
        />
        <ProFormText
          name="bios"
          label="BIOS"
          placeholder="请输入BIOS信息"
          rules={[{ required: true, message: '请输入BIOS信息' }]}
        />
        <ProFormText
          name="motherboard"
          label="主板"
          placeholder="请输入主板信息"
          rules={[{ required: true, message: '请输入主板信息' }]}
        />
        <ProFormText
          name="network_cards"
          label="网卡"
          placeholder="请输入网卡信息"
        />
        <ProFormText
          name="display_card"
          label="显卡"
          placeholder="请输入显卡信息"
        />
        <ProFormText
          name="resolution"
          label="分辨率"
          placeholder="请输入分辨率"
        />
      </ProFormGroup>
      <ProFormGroup title="系统信息" collapsible>
        <ProFormText
          name="timezone"
          label="时区"
          placeholder="请输入时区"
          rules={[{ required: true, message: '请输入时区' }]}
        />
        <ProFormText
          name="language"
          label="语言"
          placeholder="请输入语言"
          rules={[{ required: true, message: '请输入语言' }]}
        />
        <ProFormText
          name="location"
          label="位置"
          placeholder="请输入位置"
        />
      </ProFormGroup>
      <ProFormSelect
        name="group_id"
        label="设备分组"
        request={async () => {
          const response = await getDeviceGroups();
          if (response.success && response.data) {
            return response.data.map((group) => ({
              label: group.name,
              value: group.id,
            }));
          }
          return [];
        }}
        placeholder="请选择设备分组"
      />
      <ProFormText
        name="license_id"
        label="授权ID"
        placeholder="请输入授权ID"
      />
    </DrawerForm>
  );
};

export default DeviceForm;
