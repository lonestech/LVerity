import { PageContainer, ProForm, ProFormText } from '@ant-design/pro-components';
import { Card, message, Tabs } from 'antd';
import React from 'react';
import { useModel } from '@umijs/max';

const AccountSettings: React.FC = () => {
  const { initialState } = useModel('@@initialState');
  const { currentUser } = initialState || {};

  const items = [
    {
      key: 'basic',
      label: '基本设置',
      children: (
        <Card>
          <ProForm
            initialValues={{
              username: currentUser?.username,
            }}
            onFinish={async (values) => {
              message.success('更新成功');
              return true;
            }}
          >
            <ProFormText
              name="username"
              label="用户名"
              disabled
            />
            <ProFormText
              name="email"
              label="邮箱"
              placeholder="请输入邮箱"
              rules={[
                { required: true, message: '请输入邮箱' },
                { type: 'email', message: '请输入有效的邮箱地址' },
              ]}
            />
            <ProFormText
              name="phone"
              label="手机号"
              placeholder="请输入手机号"
              rules={[
                { required: true, message: '请输入手机号' },
                { pattern: /^1\d{10}$/, message: '请输入有效的手机号' },
              ]}
            />
          </ProForm>
        </Card>
      ),
    },
    {
      key: 'notification',
      label: '消息通知',
      children: (
        <Card>
          <ProForm
            onFinish={async (values) => {
              message.success('设置成功');
              return true;
            }}
          >
            {/* 添加通知设置表单项 */}
          </ProForm>
        </Card>
      ),
    },
  ];

  return (
    <PageContainer>
      <Tabs items={items} />
    </PageContainer>
  );
};

export default AccountSettings;
