import {
  DrawerForm,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { message } from 'antd';
import React from 'react';
import { createLicense, updateLicense } from '@/services/license';

export type LicenseFormProps = {
  onSuccess: () => void;
  values?: API.License;
  visible: boolean;
  onVisibleChange: (visible: boolean) => void;
};

const LicenseForm: React.FC<LicenseFormProps> = (props) => {
  const { visible, onVisibleChange, values, onSuccess } = props;

  const handleSubmit = async (formData: API.License) => {
    try {
      if (values?.id) {
        await updateLicense(values.id, formData);
      } else {
        await createLicense(formData);
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
      title={values ? '编辑授权' : '新建授权'}
      visible={visible}
      onVisibleChange={onVisibleChange}
      onFinish={handleSubmit}
      initialValues={values}
    >
      <ProFormText
        name="code"
        label="授权码"
        placeholder="请输入授权码"
        rules={[{ required: true, message: '请输入授权码' }]}
      />
      <ProFormSelect
        name="type"
        label="授权类型"
        valueEnum={{
          trial: '试用版',
          standard: '标准版',
          professional: '专业版',
        }}
        rules={[{ required: true, message: '请选择授权类型' }]}
      />
      <ProFormSelect
        name="status"
        label="状态"
        valueEnum={{
          active: '激活',
          expired: '过期',
          inactive: '未激活',
        }}
        rules={[{ required: true, message: '请选择状态' }]}
      />
      <ProFormText
        name="device_id"
        label="设备ID"
        placeholder="请输入设备ID"
      />
      <ProFormTextArea
        name="description"
        label="描述"
        placeholder="请输入描述"
      />
    </DrawerForm>
  );
};

export default LicenseForm;
