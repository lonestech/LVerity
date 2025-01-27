import {
  DrawerForm,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { message } from 'antd';
import React from 'react';
import { createRole, updateRole } from '@/services/role';

export type RoleFormProps = {
  onSuccess: () => void;
  values?: API.Role;
  visible: boolean;
  onVisibleChange: (visible: boolean) => void;
};

const RoleForm: React.FC<RoleFormProps> = (props) => {
  const { visible, onVisibleChange, values, onSuccess } = props;

  const handleSubmit = async (formData: API.Role) => {
    try {
      if (values?.id) {
        await updateRole(values.id, formData);
      } else {
        await createRole(formData);
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
      title={values ? '编辑角色' : '新建角色'}
      visible={visible}
      onVisibleChange={onVisibleChange}
      onFinish={handleSubmit}
      initialValues={values}
    >
      <ProFormText
        name="name"
        label="角色名称"
        placeholder="请输入角色名称"
        rules={[{ required: true, message: '请输入角色名称' }]}
      />
      <ProFormSelect
        name="type"
        label="角色类型"
        valueEnum={{
          admin: '管理员',
          operator: '操作员',
          viewer: '访客',
        }}
        rules={[{ required: true, message: '请选择角色类型' }]}
      />
      <ProFormTextArea
        name="description"
        label="描述"
        placeholder="请输入角色描述"
      />
    </DrawerForm>
  );
};

export default RoleForm;
