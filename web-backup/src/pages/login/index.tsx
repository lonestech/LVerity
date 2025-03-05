import React, { useState } from 'react';
import { Form, Input, Button, Card, message, Row, Col, Typography } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { userService } from '../../services/user';
import { isProduction } from '../../utils/env';

const { Title } = Typography;

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // 检查是否为开发环境
  const isDev = !isProduction;

  const onFinish = async (values: { username: string; password: string }) => {
    setLoading(true);
    try {
      // 如果是开发环境，使用开发模式登录
      if (isDev) {
        const response = await fetch('/dev-login');
        const data = await response.json();
        if (data.success) {
          localStorage.setItem('token', data.data.token);
          localStorage.setItem('user', JSON.stringify(data.data.user));
          message.success('登录成功');
          navigate('/');
          return;
        }
      }

      // 正常登录流程
      await userService.login({
        username: values.username,
        password: values.password,
      });
      message.success('登录成功');
      navigate('/');
    } catch (error) {
      console.error('登录失败:', error);
      message.error('登录失败，请检查用户名和密码');
    } finally {
      setLoading(false);
    }
  };

  // 开发环境自动登录
  const handleDevLogin = async () => {
    setLoading(true);
    try {
      const response = await fetch('/dev-login');
      const data = await response.json();
      if (data.success) {
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        message.success('开发者模式登录成功');
        navigate('/');
      } else {
        message.error('开发者模式登录失败');
      }
    } catch (error) {
      console.error('开发者模式登录失败:', error);
      message.error('开发者模式登录失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Row justify="center" align="middle" style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      <Col xs={22} sm={16} md={12} lg={8} xl={6}>
        <Card>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <Title level={2}>LVerity 验证系统</Title>
            <Title level={4} type="secondary">用户登录</Title>
          </div>
          <Form name="login" onFinish={onFinish} layout="vertical">
            <Form.Item
              name="username"
              rules={[{ required: true, message: '请输入用户名' }]}
            >
              <Input 
                prefix={<UserOutlined />} 
                placeholder="用户名" 
                size="large" 
              />
            </Form.Item>
            <Form.Item
              name="password"
              rules={[{ required: true, message: '请输入密码' }]}
            >
              <Input.Password 
                prefix={<LockOutlined />} 
                placeholder="密码" 
                size="large" 
              />
            </Form.Item>
            <Form.Item>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={loading} 
                block
                size="large"
              >
                登录
              </Button>
            </Form.Item>
            {isDev && (
              <Form.Item>
                <Button 
                  onClick={handleDevLogin} 
                  loading={loading} 
                  block
                  size="large"
                >
                  开发者模式登录
                </Button>
              </Form.Item>
            )}
          </Form>
        </Card>
      </Col>
    </Row>
  );
};

export default Login;
