import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Button, 
  Tabs, 
  Form, 
  Input, 
  Switch, 
  Select, 
  Radio, 
  Upload, 
  message, 
  Divider, 
  Space, 
  Avatar,
  Typography,
  Row,
  Col,
  Tooltip,
  Alert
} from 'antd';
import { 
  SaveOutlined, 
  UserOutlined, 
  LockOutlined, 
  BellOutlined, 
  SettingOutlined,
  UploadOutlined,
  GlobalOutlined,
  MobileOutlined,
  MailOutlined,
  CheckOutlined,
  SecurityScanOutlined
} from '@ant-design/icons';
import PageContainer from '../../components/PageContainer';
import { userService } from '../../services/user';
import { notificationService } from '../../services/notification';
import { getLoggedInUser } from '../../utils/auth';

const { Title, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

const UserSettings: React.FC = () => {
  const [saving, setSaving] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [profileForm] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [notificationForm] = Form.useForm();
  const [appearanceForm] = Form.useForm();
  const [user, setUser] = useState<any>(null);
  const [notificationPreferences, setNotificationPreferences] = useState<any>(null);
  const [avatar, setAvatar] = useState<string | null>(null);
  const [activeKey, setActiveKey] = useState<string>('profile');

  // 加载数据
  const loadData = async () => {
    setLoading(true);
    try {
      // 获取当前用户信息
      const currentUser = getLoggedInUser();
      if (currentUser && currentUser.id) {
        const userResponse = await userService.getUserById(currentUser.id);
        if (userResponse.success) {
          setUser(userResponse.data);
          // 设置个人资料表单初始值
          profileForm.setFieldsValue({
            name: userResponse.data.name,
            email: userResponse.data.email,
            phone: userResponse.data.phone,
            position: userResponse.data.position,
            bio: userResponse.data.bio,
            language: userResponse.data.preferences?.language || 'zh-CN',
          });
          setAvatar(userResponse.data.avatar);
        }

        // 获取通知偏好设置
        const notificationResponse = await notificationService.getNotificationPreferences();
        if (notificationResponse.success) {
          setNotificationPreferences(notificationResponse.data);
          // 设置通知表单初始值
          notificationForm.setFieldsValue({
            email: notificationResponse.data.email,
            push: notificationResponse.data.push,
            types: notificationResponse.data.types || [],
          });
        }

        // 设置界面设置表单初始值
        appearanceForm.setFieldsValue({
          theme: userResponse.data.preferences?.theme || 'light',
          compactMode: userResponse.data.preferences?.compactMode || false,
          showToolbar: userResponse.data.preferences?.showToolbar !== false,
          sidebarCollapsed: userResponse.data.preferences?.sidebarCollapsed || false,
          dashboardLayout: userResponse.data.preferences?.dashboardLayout || 'default',
        });
      }
    } catch (error) {
      console.error('加载用户数据失败:', error);
      message.error('加载用户数据失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // 更新个人资料
  const handleUpdateProfile = async (values: any) => {
    setSaving(true);
    try {
      const response = await userService.updateProfile({
        ...values,
        avatar: avatar,
      });
      if (response.success) {
        message.success('个人资料已更新');
        // 更新本地用户信息
        setUser({
          ...user,
          ...values,
        });
      } else {
        message.error(response.message || '更新个人资料失败');
      }
    } catch (error) {
      console.error('更新个人资料失败:', error);
      message.error('更新个人资料失败');
    } finally {
      setSaving(false);
    }
  };

  // 更新密码
  const handleUpdatePassword = async (values: any) => {
    setSaving(true);
    try {
      const response = await userService.updatePassword(values);
      if (response.success) {
        message.success('密码已更新');
        passwordForm.resetFields();
      } else {
        message.error(response.message || '更新密码失败');
      }
    } catch (error) {
      console.error('更新密码失败:', error);
      message.error('更新密码失败');
    } finally {
      setSaving(false);
    }
  };

  // 更新通知设置
  const handleUpdateNotifications = async (values: any) => {
    setSaving(true);
    try {
      const response = await notificationService.setNotificationPreferences(values);
      if (response.success) {
        message.success('通知设置已更新');
        setNotificationPreferences(values);
      } else {
        message.error(response.message || '更新通知设置失败');
      }
    } catch (error) {
      console.error('更新通知设置失败:', error);
      message.error('更新通知设置失败');
    } finally {
      setSaving(false);
    }
  };

  // 更新界面设置
  const handleUpdateAppearance = async (values: any) => {
    setSaving(true);
    try {
      const response = await userService.updatePreferences(values);
      if (response.success) {
        message.success('界面设置已更新');
        // 更新用户首选项
        setUser({
          ...user,
          preferences: {
            ...user.preferences,
            ...values,
          },
        });
        
        // 应用主题和布局设置
        document.body.className = values.theme === 'dark' ? 'dark-theme' : 'light-theme';
      } else {
        message.error(response.message || '更新界面设置失败');
      }
    } catch (error) {
      console.error('更新界面设置失败:', error);
      message.error('更新界面设置失败');
    } finally {
      setSaving(false);
    }
  };

  // 头像上传前的处理
  const beforeUpload = (file: File) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) {
      message.error('只能上传JPG/PNG格式的图片!');
    }
    
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('图片必须小于2MB!');
    }
    
    return isJpgOrPng && isLt2M;
  };

  // 头像上传变化时的处理
  const handleAvatarChange = (info: any) => {
    if (info.file.status === 'uploading') {
      return;
    }
    
    if (info.file.status === 'done') {
      if (info.file.response.success) {
        setAvatar(info.file.response.data.url);
        message.success('头像已更新');
      } else {
        message.error(info.file.response.message || '上传头像失败');
      }
    } else if (info.file.status === 'error') {
      message.error('上传头像失败');
    }
  };

  // 处理标签页切换
  const handleTabChange = (key: string) => {
    setActiveKey(key);
  };

  return (
    <PageContainer 
      title="个人设置" 
      loading={loading}
      extra={
        <Space>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            onClick={() => {
              if (activeKey === 'profile') {
                profileForm.submit();
              } else if (activeKey === 'password') {
                passwordForm.submit();
              } else if (activeKey === 'notifications') {
                notificationForm.submit();
              } else if (activeKey === 'appearance') {
                appearanceForm.submit();
              }
            }}
            loading={saving}
          >
            保存设置
          </Button>
        </Space>
      }
    >
      <Card>
        <Tabs
          activeKey={activeKey}
          onChange={handleTabChange}
          tabPosition="left"
          style={{ minHeight: 500 }}
          items={[
            {
              key: 'profile',
              label: (
                <span>
                  <UserOutlined />
                  个人资料
                </span>
              ),
              children: (
                <Row gutter={[24, 0]}>
                  <Col xs={24} sm={8} md={6} style={{ textAlign: 'center' }}>
                    <Space direction="vertical" size="large" style={{ width: '100%' }}>
                      <Avatar 
                        size={120} 
                        src={avatar} 
                        icon={<UserOutlined />} 
                        style={{ marginBottom: 16 }}
                      />
                      
                      <Upload
                        name="avatar"
                        listType="picture"
                        className="avatar-uploader"
                        showUploadList={false}
                        action="/api/users/avatar"
                        beforeUpload={beforeUpload}
                        onChange={handleAvatarChange}
                        headers={{
                          Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
                        }}
                      >
                        <Button icon={<UploadOutlined />}>更改头像</Button>
                      </Upload>
                      
                      {user && (
                        <div>
                          <Title level={4}>{user.name}</Title>
                          <Text type="secondary">{user.role?.name || '用户'}</Text>
                        </div>
                      )}
                    </Space>
                  </Col>
                  
                  <Col xs={24} sm={16} md={18}>
                    <Form
                      form={profileForm}
                      layout="vertical"
                      onFinish={handleUpdateProfile}
                    >
                      <Form.Item
                        name="name"
                        label="姓名"
                        rules={[{ required: true, message: '请输入姓名' }]}
                      >
                        <Input placeholder="请输入姓名" />
                      </Form.Item>
                      
                      <Form.Item
                        name="email"
                        label="电子邮件"
                        rules={[
                          { required: true, message: '请输入电子邮件' },
                          { type: 'email', message: '请输入有效的电子邮件' }
                        ]}
                      >
                        <Input placeholder="请输入电子邮件" />
                      </Form.Item>
                      
                      <Form.Item
                        name="phone"
                        label="手机号码"
                      >
                        <Input placeholder="请输入手机号码" />
                      </Form.Item>
                      
                      <Form.Item
                        name="position"
                        label="职位"
                      >
                        <Input placeholder="请输入职位" />
                      </Form.Item>
                      
                      <Form.Item
                        name="bio"
                        label="个人简介"
                      >
                        <Input.TextArea rows={4} placeholder="请输入个人简介" />
                      </Form.Item>
                      
                      <Form.Item
                        name="language"
                        label="界面语言"
                      >
                        <Select>
                          <Option value="zh-CN">中文(简体)</Option>
                          <Option value="en-US">English(US)</Option>
                        </Select>
                      </Form.Item>
                    </Form>
                  </Col>
                </Row>
              )
            },
            {
              key: 'password',
              label: (
                <span>
                  <LockOutlined />
                  密码安全
                </span>
              ),
              children: (
                <div style={{ maxWidth: 500, margin: '0 auto' }}>
                  <Alert
                    message="密码安全提示"
                    description="请使用包含字母、数字和特殊字符的强密码，并定期更改您的密码以提高账户安全性。"
                    type="info"
                    showIcon
                    style={{ marginBottom: 24 }}
                  />
                  
                  <Form
                    form={passwordForm}
                    layout="vertical"
                    onFinish={handleUpdatePassword}
                  >
                    <Form.Item
                      name="currentPassword"
                      label="当前密码"
                      rules={[{ required: true, message: '请输入当前密码' }]}
                    >
                      <Input.Password placeholder="请输入当前密码" />
                    </Form.Item>
                    
                    <Form.Item
                      name="newPassword"
                      label="新密码"
                      rules={[
                        { required: true, message: '请输入新密码' },
                        { min: 8, message: '密码长度不能少于8个字符' },
                        {
                          pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
                          message: '密码必须包含大小写字母、数字和特殊字符'
                        }
                      ]}
                    >
                      <Input.Password placeholder="请输入新密码" />
                    </Form.Item>
                    
                    <Form.Item
                      name="confirmPassword"
                      label="确认新密码"
                      dependencies={['newPassword']}
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
                      <Input.Password placeholder="请确认新密码" />
                    </Form.Item>
                    
                    <Divider />
                    
                    <Form.Item>
                      <Button
                        type="default"
                        icon={<SecurityScanOutlined />}
                        style={{ marginRight: 16 }}
                      >
                        启用两步验证
                      </Button>
                    </Form.Item>
                  </Form>
                </div>
              )
            },
            {
              key: 'notifications',
              label: (
                <span>
                  <BellOutlined />
                  通知设置
                </span>
              ),
              children: (
                <Form
                  form={notificationForm}
                  layout="vertical"
                  onFinish={handleUpdateNotifications}
                >
                  <Divider orientation="left">通知方式</Divider>
                  
                  <Form.Item
                    name="email"
                    valuePropName="checked"
                    label="电子邮件通知"
                  >
                    <Switch checkedChildren={<CheckOutlined />} />
                  </Form.Item>
                  
                  <Form.Item
                    name="push"
                    valuePropName="checked"
                    label="浏览器推送通知"
                  >
                    <Switch checkedChildren={<CheckOutlined />} />
                  </Form.Item>
                  
                  <Divider orientation="left">通知类型</Divider>
                  
                  <Form.Item
                    name="types"
                    label="接收以下类型的通知"
                  >
                    <Select mode="multiple" placeholder="请选择需要接收的通知类型">
                      <Option value="alert">系统警报</Option>
                      <Option value="license">授权变更</Option>
                      <Option value="device">设备事件</Option>
                      <Option value="update">系统更新</Option>
                      <Option value="security">安全事件</Option>
                    </Select>
                  </Form.Item>
                </Form>
              )
            },
            {
              key: 'appearance',
              label: (
                <span>
                  <SettingOutlined />
                  界面设置
                </span>
              ),
              children: (
                <Form
                  form={appearanceForm}
                  layout="vertical"
                  onFinish={handleUpdateAppearance}
                >
                  <Form.Item
                    name="theme"
                    label="主题"
                  >
                    <Radio.Group>
                      <Radio.Button value="light">浅色</Radio.Button>
                      <Radio.Button value="dark">深色</Radio.Button>
                      <Radio.Button value="system">跟随系统</Radio.Button>
                    </Radio.Group>
                  </Form.Item>
                  
                  <Form.Item
                    name="compactMode"
                    valuePropName="checked"
                    label="紧凑模式"
                  >
                    <Switch checkedChildren={<CheckOutlined />} />
                  </Form.Item>
                  
                  <Form.Item
                    name="showToolbar"
                    valuePropName="checked"
                    label="显示工具栏"
                  >
                    <Switch checkedChildren={<CheckOutlined />} />
                  </Form.Item>
                  
                  <Form.Item
                    name="sidebarCollapsed"
                    valuePropName="checked"
                    label="默认折叠侧边栏"
                  >
                    <Switch checkedChildren={<CheckOutlined />} />
                  </Form.Item>
                  
                  <Form.Item
                    name="dashboardLayout"
                    label="仪表盘布局"
                  >
                    <Select>
                      <Option value="default">默认</Option>
                      <Option value="compact">紧凑</Option>
                      <Option value="expanded">展开</Option>
                      <Option value="custom">自定义</Option>
                    </Select>
                  </Form.Item>
                </Form>
              )
            }
          ]}
        />
      </Card>
    </PageContainer>
  );
};

export default UserSettings;
