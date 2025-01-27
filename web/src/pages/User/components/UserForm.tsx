import {
  DrawerForm,
  ProFormSelect,
  ProFormText,
} from '@ant-design/pro-components';
import { message } from 'antd';
import React from 'react';
import { createUser, updateUser } from '@/services/user';

export type UserFormProps = {
  onSuccess: () => void;
  values?: API.User;
  visible: boolean;
  onVisibleChange: (visible: boolean) => void;
};

const UserForm: React.FC<UserFormProps> = (props) => {
  const { visible, onVisibleChange, values, onSuccess } = props;

  const handleSubmit = async (formData: API.User) => {
    try {
      if (values?.id) {
        await updateUser(values.id, formData);
      } else {
        await createUser(formData);
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
      title={values ? '编辑用户' : '新建用户'}
      visible={visible}
      onVisibleChange={onVisibleChange}
      onFinish={handleSubmit}
      initialValues={values}
    >
      <ProFormText
        name="username"
        label="用户名"
        placeholder="请输入用户名"
        rules={[{ required: true, message: '请输入用户名' }]}
      />
      {!values && (
        <ProFormText.Password
          name="password"
          label="密码"
          placeholder="请输入密码"
          rules={[{ required: true, message: '请输入密码' }]}
        />
      )}
      <ProFormSelect
        name="role_id"
        label="角色"
        valueEnum={{
          admin: '管理员',
          operator: '操作员',
          viewer: '访客',
        }}
        rules={[{ required: true, message: '请选择角色' }]}
      />
      <ProFormSelect
        name="status"
        label="状态"
        valueEnum={{
          active: '正常',
          inactive: '禁用',
          locked: '锁定',
        }}
        rules={[{ required: true, message: '请选择状态' }]}
      />
    </DrawerForm>
  );
};

export default UserForm;
