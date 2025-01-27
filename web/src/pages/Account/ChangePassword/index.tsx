import { PageContainer, ProForm, ProFormText } from '@ant-design/pro-components';
import { Card, message } from 'antd';
import React from 'react';
import { changePassword } from '@/services/user';

const ChangePassword: React.FC = () => {
  return (
    <PageContainer>
      <Card>
        <ProForm
          onFinish={async (values) => {
            try {
              await changePassword({
                old_password: values.oldPassword,
                new_password: values.newPassword,
              });
              message.success('密码修改成功');
              return true;
            } catch (error) {
              message.error('密码修改失败');
              return false;
            }
          }}
        >
          <ProFormText.Password
            name="oldPassword"
            label="当前密码"
            placeholder="请输入当前密码"
            rules={[
              {
                required: true,
                message: '请输入当前密码',
              },
            ]}
          />
          <ProFormText.Password
            name="newPassword"
            label="新密码"
            placeholder="请输入新密码"
            rules={[
              {
                required: true,
                message: '请输入新密码',
              },
              {
                min: 8,
                message: '密码长度不能小于8位',
              },
              {
                pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[^]{8,}$/,
                message: '密码必须包含大小写字母和数字',
              },
            ]}
          />
          <ProFormText.Password
            name="confirmPassword"
            label="确认新密码"
            placeholder="请再次输入新密码"
            rules={[
              {
                required: true,
                message: '请确认新密码',
              },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('两次输入的密码不一致'));
                },
              }),
            ]}
          />
        </ProForm>
      </Card>
    </PageContainer>
  );
};

export default ChangePassword;
