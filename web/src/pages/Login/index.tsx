import {
  LockOutlined,
  UserOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons';
import {
  LoginForm,
  ProFormText,
  ProFormCheckbox,
} from '@ant-design/pro-components';
import { useEmotionCss } from '@ant-design/use-emotion-css';
import { history, useModel, Helmet } from '@umijs/max';
import { message, Spin } from 'antd';
import React, { useState, useEffect } from 'react';
import { flushSync } from 'react-dom';
import { login, getCaptcha } from '@/services/user';

const LoginPage: React.FC = () => {
  const { setInitialState } = useModel('@@initialState');
  const [loading, setLoading] = useState(false);
  const [captchaUrl, setCaptchaUrl] = useState('');
  const [loginAttempts, setLoginAttempts] = useState(0);

  // 获取验证码
  const refreshCaptcha = async () => {
    try {
      const response = await getCaptcha();
      if (response.success) {
        setCaptchaUrl(response.data.url);
      }
    } catch (error) {
      message.error('获取验证码失败');
    }
  };

  useEffect(() => {
    refreshCaptcha();
  }, []);

  const containerClassName = useEmotionCss(() => {
    return {
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      overflow: 'auto',
      backgroundColor: '#f0f2f5',
    };
  });

  const handleSubmit = async (values: API.LoginParams) => {
    if (loginAttempts >= 5) {
      message.error('登录失败次数过多，请稍后再试');
      return;
    }

    setLoading(true);
    try {
      // 登录
      const response = await login(values);
      
      if (response.success) {
        const { token, user } = response.data;
        
        // 保存token
        localStorage.setItem('token', token);
        
        // 如果记住密码，保存用户名
        if (values.remember) {
          localStorage.setItem('username', values.username);
        } else {
          localStorage.removeItem('username');
        }
        
        message.success('登录成功！');
        
        // 更新用户信息
        flushSync(() => {
          setInitialState((s) => ({
            ...s,
            currentUser: user,
          }));
        });

        const urlParams = new URL(window.location.href).searchParams;
        history.push(urlParams.get('redirect') || '/');
      } else {
        setLoginAttempts(prev => prev + 1);
        refreshCaptcha();
        message.error(response.error_message || '登录失败，请重试！');
      }
    } catch (error) {
      setLoginAttempts(prev => prev + 1);
      refreshCaptcha();
      message.error('登录失败，请重试！');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={containerClassName}>
      <Helmet>
        <title>登录 - LVerity授权管理系统</title>
      </Helmet>
      <div
        style={{
          flex: '1',
          padding: '32px 0',
        }}
      >
        <Spin spinning={loading}>
          <LoginForm
            contentStyle={{
              minWidth: 280,
              maxWidth: '75vw',
            }}
            title="LVerity授权管理系统"
            subTitle="高效的软件授权管理平台"
            initialValues={{
              username: localStorage.getItem('username') || '',
              remember: !!localStorage.getItem('username'),
            }}
            onFinish={async (values) => {
              await handleSubmit(values);
            }}
          >
            <ProFormText
              name="username"
              fieldProps={{
                size: 'large',
                prefix: <UserOutlined />,
              }}
              placeholder="用户名"
              rules={[
                {
                  required: true,
                  message: '请输入用户名!',
                },
              ]}
            />
            <ProFormText.Password
              name="password"
              fieldProps={{
                size: 'large',
                prefix: <LockOutlined />,
              }}
              placeholder="密码"
              rules={[
                {
                  required: true,
                  message: '请输入密码！',
                },
              ]}
            />
            {loginAttempts >= 3 && (
              <ProFormText
                name="captcha"
                fieldProps={{
                  size: 'large',
                  prefix: <SafetyCertificateOutlined />,
                }}
                placeholder="验证码"
                rules={[
                  {
                    required: true,
                    message: '请输入验证码！',
                  },
                ]}
                addonAfter={
                  <img
                    src={captchaUrl}
                    alt="验证码"
                    style={{ height: '32px', cursor: 'pointer' }}
                    onClick={refreshCaptcha}
                  />
                }
              />
            )}
            <div style={{ marginBottom: 24 }}>
              <ProFormCheckbox name="remember">记住用户名</ProFormCheckbox>
            </div>
          </LoginForm>
        </Spin>
      </div>
    </div>
  );
};

export default LoginPage;
