import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { Alert, message } from 'antd';
import React, { useState, useEffect } from 'react';
import { ProFormCheckbox, ProFormText, LoginForm } from '@ant-design/pro-form';
import { useIntl, history, useModel } from '@umijs/max';
import { login } from '@/services/auth/api';
import styles from './index.less';

const LoginMessage: React.FC<{
  content: string;
}> = ({ content }) => {
  return (
    <Alert
      style={{
        marginBottom: 24,
      }}
      message={content}
      type="error"
      showIcon
    />
  );
};

const Login: React.FC = () => {
  const [userLoginState, setUserLoginState] = useState<API.LoginResult>({});
  const { initialState, setInitialState } = useModel('@@initialState');
  const [captchaImage, setCaptchaImage] = useState<string>('');
  const [captchaId, setCaptchaId] = useState<string>('');

  const intl = useIntl();

  const fetchUserInfo = async () => {
    const userInfo = await initialState?.fetchUserInfo?.();
    if (userInfo) {
      await setInitialState((s) => ({
        ...s,
        currentUser: userInfo,
      }));
    }
  };

  const refreshCaptcha = async () => {
    try {
      const response = await fetch('/auth/captcha');
      const data = await response.json();
      if (data.success) {
        setCaptchaImage(data.data.captcha_image);
        setCaptchaId(data.data.captcha_id);
      } else {
        message.error('获取验证码失败');
      }
    } catch (error) {
      message.error('获取验证码失败');
    }
  };

  const handleSubmit = async (values: API.LoginParams) => {
    try {
      // 登录
      const response = await login({
        username: values.username,
        password: values.password,
        captcha: values.captcha,
        captcha_id: captchaId,
      });
      
      if (response.success) {
        const defaultLoginSuccessMessage = intl.formatMessage({
          id: 'pages.login.success',
          defaultMessage: '登录成功！',
        });
        message.success(defaultLoginSuccessMessage);
        
        // 保存 token
        localStorage.setItem('token', response.data.token);
        
        await fetchUserInfo();
        const urlParams = new URL(window.location.href).searchParams;
        history.push(urlParams.get('redirect') || '/');
        return;
      }
      // 如果失败去设置用户错误信息
      setUserLoginState({ status: 'error' });
      message.error(response.error_message || '登录失败');
      // 刷新验证码
      refreshCaptcha();
    } catch (error: any) {
      const defaultLoginFailureMessage = intl.formatMessage({
        id: 'pages.login.failure',
        defaultMessage: '登录失败，请重试！',
      });
      message.error(error.response?.data?.error_message || defaultLoginFailureMessage);
      // 刷新验证码
      refreshCaptcha();
    }
  };

  // 首次加载时获取验证码
  useEffect(() => {
    refreshCaptcha();
  }, []);

  const { status } = userLoginState;

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <LoginForm
          logo={<img alt="logo" src="/logo.svg" />}
          title="LVerity授权管理系统"
          subTitle={intl.formatMessage({ id: 'pages.layouts.userLayout.title' })}
          initialValues={{
            autoLogin: true,
          }}
          onFinish={async (values) => {
            await handleSubmit(values as API.LoginParams);
          }}
        >
          {status === 'error' && (
            <LoginMessage
              content={intl.formatMessage({
                id: 'pages.login.accountLogin.errorMessage',
                defaultMessage: '账户或密码错误',
              })}
            />
          )}
          <ProFormText
            name="username"
            fieldProps={{
              size: 'large',
              prefix: <UserOutlined className={styles.prefixIcon} />,
            }}
            placeholder={intl.formatMessage({
              id: 'pages.login.username.placeholder',
              defaultMessage: '用户名',
            })}
            rules={[
              {
                required: true,
                message: intl.formatMessage({
                  id: 'pages.login.username.required',
                  defaultMessage: '请输入用户名!',
                }),
              },
            ]}
          />
          <ProFormText.Password
            name="password"
            fieldProps={{
              size: 'large',
              prefix: <LockOutlined className={styles.prefixIcon} />,
            }}
            placeholder={intl.formatMessage({
              id: 'pages.login.password.placeholder',
              defaultMessage: '密码',
            })}
            rules={[
              {
                required: true,
                message: intl.formatMessage({
                  id: 'pages.login.password.required',
                  defaultMessage: '请输入密码！',
                }),
              },
            ]}
          />
          <div style={{ display: 'flex', marginBottom: 24 }}>
            <ProFormText
              name="captcha"
              fieldProps={{
                size: 'large',
              }}
              placeholder={intl.formatMessage({
                id: 'pages.login.captcha.placeholder',
                defaultMessage: '请输入验证码',
              })}
              rules={[
                {
                  required: true,
                  message: intl.formatMessage({
                    id: 'pages.login.captcha.required',
                    defaultMessage: '请输入验证码！',
                  }),
                },
              ]}
            />
            <img
              src={captchaImage}
              alt="验证码"
              style={{ height: 40, marginLeft: 8, cursor: 'pointer' }}
              onClick={refreshCaptcha}
            />
          </div>
          <div
            style={{
              marginBottom: 24,
            }}
          >
            <ProFormCheckbox noStyle name="autoLogin">
              自动登录
            </ProFormCheckbox>
          </div>
        </LoginForm>
      </div>
    </div>
  );
};

export default Login;
