import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, message, Row, Col, Typography, Spin, Divider } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { userService } from '../../services/user';
import { setAuth } from '../../utils/auth';
import { InitAdminParams, SystemInitStatus } from '../../models/user';

const { Title, Text } = Typography;

const Login: React.FC = () => {
  const [form] = Form.useForm();
  const [adminForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [systemStatus, setSystemStatus] = useState<SystemInitStatus | null>(null);
  const [statusLoading, setStatusLoading] = useState(true);
  const navigate = useNavigate();

  // 检查系统初始化状态
  const checkSystemStatus = async () => {
    try {
      setStatusLoading(true);
      const response = await userService.checkInitStatus();
      if (response.success) {
        setSystemStatus(response.data);
      } else {
        // 如果API调用失败，假设系统已初始化（但没有管理员）
        setSystemStatus({
          initialized: false,
          hasAdmin: false,
          systemConfigured: false
        });
        message.error('获取系统状态失败');
      }
    } catch (error) {
      console.error('获取系统状态失败:', error);
      // 默认状态：系统未初始化
      setSystemStatus({
        initialized: false,
        hasAdmin: false,
        systemConfigured: false
      });
    } finally {
      setStatusLoading(false);
    }
  };

  // 页面加载时获取系统状态
  useEffect(() => {
    checkSystemStatus();
  }, []);

  // 登录提交
  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const response = await userService.login({
        username: values.username,
        password: values.password,
      });
      
      if (response.success) {
        const { token, user } = response.data;
        setAuth(token, user);
        message.success('登录成功');
        navigate('/');
      } else {
        message.error(response.message || '登录失败');
      }
    } catch (error) {
      console.error('登录失败:', error);
      message.error('登录失败，请检查用户名和密码');
    } finally {
      setLoading(false);
    }
  };

  // 初始化管理员账户提交
  const onInitAdminFinish = async (values: any) => {
    if (values.password !== values.confirmPassword) {
      message.error('两次输入的密码不一致');
      return;
    }

    setLoading(true);
    try {
      const params: InitAdminParams = {
        username: values.username,
        password: values.password,
        confirmPassword: values.confirmPassword,
        email: values.email,
        name: values.name
      };

      const response = await userService.initializeAdmin(params);
      
      if (response.success) {
        message.success('管理员账户创建成功，系统已初始化');
        // 自动登录
        const { token, user } = response.data;
        setAuth(token, user);
        navigate('/');
      } else {
        message.error(response.message || '初始化失败');
      }
    } catch (error) {
      console.error('初始化管理员账户失败:', error);
      message.error('初始化管理员账户失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  // 渲染创建管理员表单
  const renderInitAdminForm = () => (
    <Form
      form={adminForm}
      name="initAdmin"
      layout="vertical"
      onFinish={onInitAdminFinish}
    >
      <Form.Item
        name="username"
        rules={[
          { required: true, message: '请输入管理员用户名' },
          { min: 4, message: '用户名至少4个字符' }
        ]}
      >
        <Input 
          prefix={<UserOutlined />} 
          placeholder="管理员用户名" 
          size="large" 
          disabled={loading}
        />
      </Form.Item>
      
      <Form.Item
        name="name"
      >
        <Input 
          placeholder="姓名（可选）" 
          size="large" 
          disabled={loading}
        />
      </Form.Item>
      
      <Form.Item
        name="email"
        rules={[
          { type: 'email', message: '邮箱格式不正确' }
        ]}
      >
        <Input 
          prefix={<MailOutlined />} 
          placeholder="电子邮箱（可选）" 
          size="large" 
          disabled={loading}
        />
      </Form.Item>
      
      <Form.Item
        name="password"
        rules={[
          { required: true, message: '请输入管理员密码' },
          { min: 8, message: '密码长度不能少于8个字符' },
          {
            pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
            message: '密码必须包含大小写字母和数字'
          }
        ]}
      >
        <Input.Password 
          prefix={<LockOutlined />} 
          placeholder="管理员密码" 
          size="large" 
          disabled={loading}
        />
      </Form.Item>
      
      <Form.Item
        name="confirmPassword"
        rules={[
          { required: true, message: '请确认管理员密码' },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || getFieldValue('password') === value) {
                return Promise.resolve();
              }
              return Promise.reject(new Error('两次输入的密码不一致'));
            },
          }),
        ]}
      >
        <Input.Password 
          prefix={<LockOutlined />} 
          placeholder="确认密码" 
          size="large" 
          disabled={loading}
        />
      </Form.Item>
      
      <Form.Item>
        <Button 
          type="primary" 
          htmlType="submit" 
          size="large" 
          block 
          loading={loading}
        >
          创建管理员账户并初始化系统
        </Button>
      </Form.Item>
    </Form>
  );

  // 渲染登录表单
  const renderLoginForm = () => (
    <Form
      form={form}
      name="login"
      layout="vertical"
      initialValues={{ remember: true }}
      onFinish={onFinish}
    >
      <Form.Item
        name="username"
        rules={[{ required: true, message: '请输入用户名' }]}
      >
        <Input 
          prefix={<UserOutlined />} 
          placeholder="用户名" 
          size="large" 
          disabled={loading}
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
          disabled={loading}
        />
      </Form.Item>
      
      <Form.Item>
        <Button 
          type="primary" 
          htmlType="submit" 
          size="large" 
          block 
          loading={loading}
        >
          登录
        </Button>
      </Form.Item>
    </Form>
  );

  return (
    <>
      {statusLoading ? (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Spin size="large" />
          <div style={{ marginTop: 16 }}>
            <Text type="secondary">正在检查系统状态...</Text>
          </div>
        </div>
      ) : (
        <Card 
          bordered={false} 
          style={{ 
            borderRadius: 8, 
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            overflow: 'hidden',
            maxWidth: '400px',
            width: '100%'
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <Title level={2} style={{ margin: 0, color: '#1a5bb5' }}>LVerity</Title>
            <Text type="secondary">设备验证管理系统</Text>
          </div>
          
          {systemStatus && !systemStatus.hasAdmin ? (
            <>
              <div style={{ 
                textAlign: 'center', 
                marginBottom: 24, 
                padding: '10px 15px', 
                backgroundColor: '#fffbe6', 
                border: '1px solid #ffe58f', 
                borderRadius: '4px' 
              }}>
                <Text style={{ color: '#ad6800' }}>系统需要初始化，请创建管理员账户</Text>
              </div>
              {renderInitAdminForm()}
            </>
          ) : (
            <>
              <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <Text>请输入您的账号和密码</Text>
              </div>
              {renderLoginForm()}
            </>
          )}
        </Card>
      )}
    </>
  );
};

export default Login;
