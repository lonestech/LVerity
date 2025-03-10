import React, { useState } from 'react';
import { Form, Input, Button, Card, message, Row, Col, Typography } from 'antd';
import { LockOutlined } from '@ant-design/icons';
import { userService } from '../../services/user';
import { ChangePasswordParams } from '../../models/user';

const { Title, Text } = Typography;

const PasswordChange: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: {
    oldPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) => {
    if (values.newPassword !== values.confirmPassword) {
      message.error('新密码与确认密码不一致');
      return;
    }

    setLoading(true);
    try {
      const params: ChangePasswordParams = {
        old_password: values.oldPassword,
        new_password: values.newPassword,
      };

      const response = await userService.changePassword(params);
      
      if (response.success) {
        message.success('密码修改成功');
        form.resetFields();
      } else {
        message.error(response.message || '密码修改失败');
      }
    } catch (error) {
      console.error('密码修改失败:', error);
      message.error('密码修改失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card bordered={false} title="修改密码">
      <Row justify="center">
        <Col xs={24} sm={20} md={16} lg={12} xl={10}>
          <Form
            form={form}
            name="changePassword"
            layout="vertical"
            onFinish={onFinish}
          >
            <Form.Item
              name="oldPassword"
              label="当前密码"
              rules={[{ required: true, message: '请输入当前密码' }]}
            >
              <Input.Password 
                prefix={<LockOutlined />} 
                placeholder="请输入当前密码" 
                disabled={loading}
              />
            </Form.Item>
            
            <Form.Item
              name="newPassword"
              label="新密码"
              rules={[
                { required: true, message: '请输入新密码' },
                { min: 8, message: '密码长度不能少于8个字符' },
                {
                  pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
                  message: '密码必须包含大小写字母和数字'
                }
              ]}
            >
              <Input.Password 
                prefix={<LockOutlined />} 
                placeholder="请输入新密码" 
                disabled={loading}
              />
            </Form.Item>
            
            <Form.Item
              name="confirmPassword"
              label="确认新密码"
              rules={[
                { required: true, message: '请确认新密码' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('newPassword') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('两次输入的密码不一致'));
                  },
                }),
              ]}
            >
              <Input.Password 
                prefix={<LockOutlined />} 
                placeholder="请再次输入新密码" 
                disabled={loading}
              />
            </Form.Item>
            
            <Form.Item>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={loading}
              >
                修改密码
              </Button>
            </Form.Item>
          </Form>
        </Col>
      </Row>
    </Card>
  );
};

export default PasswordChange;
