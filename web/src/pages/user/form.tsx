import React, { useEffect, useState } from 'react';
import { 
  Form, 
  Input, 
  Button, 
  Card, 
  Select, 
  Space, 
  message, 
  Switch, 
  Row, 
  Col 
} from 'antd';
import { 
  UserOutlined, 
  MailOutlined, 
  PhoneOutlined, 
  IdcardOutlined,
  SaveOutlined,
  RollbackOutlined
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import PageContainer from '../../components/PageContainer';
import { userService } from '../../services/user';
import { User, UserRole } from '../../models/user';

interface UserFormProps {
  mode: 'create' | 'edit';
}

const UserForm: React.FC<UserFormProps> = ({ mode }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState<boolean>(false);
  const [submitLoading, setSubmitLoading] = useState<boolean>(false);
  const [roles, setRoles] = useState<UserRole[]>([]);

  // 加载角色列表
  const loadRoles = async () => {
    try {
      const response = await userService.getRoles();
      if (response.success) {
        setRoles(response.data);
      }
    } catch (error) {
      console.error('加载角色列表失败:', error);
      message.error('加载角色列表失败');
    }
  };

  // 加载用户数据
  const loadUserData = async () => {
    if (mode === 'create' || !id) return;
    
    setLoading(true);
    try {
      const response = await userService.getUserById(id);
      if (response.success) {
        const user = response.data;
        
        // 填充表单数据
        form.setFieldsValue({
          username: user.username,
          name: user.name,
          email: user.email,
          phone: user.phone,
          roleId: user.roleId,
          status: user.status === 'active',
        });
      } else {
        message.error(response.message || '加载用户信息失败');
        navigate('/user');
      }
    } catch (error) {
      console.error('加载用户信息失败:', error);
      message.error('加载用户信息失败');
      navigate('/user');
    } finally {
      setLoading(false);
    }
  };

  // 组件加载时获取数据
  useEffect(() => {
    loadRoles();
    loadUserData();
  }, [id, mode]);

  // 提交表单
  const handleSubmit = async (values: any) => {
    setSubmitLoading(true);
    try {
      const userData = {
        ...values,
        status: values.status ? 'active' : 'inactive',
      };
      
      let response;
      if (mode === 'create') {
        response = await userService.createUser(userData);
      } else {
        response = await userService.updateUser(id!, userData);
      }
      
      if (response.success) {
        message.success(mode === 'create' ? '用户创建成功' : '用户更新成功');
        navigate('/user');
      } else {
        message.error(response.message || (mode === 'create' ? '用户创建失败' : '用户更新失败'));
      }
    } catch (error) {
      console.error(mode === 'create' ? '用户创建失败:' : '用户更新失败:', error);
      message.error(mode === 'create' ? '用户创建失败' : '用户更新失败');
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <PageContainer 
      title={mode === 'create' ? '创建用户' : '编辑用户'} 
      loading={loading}
      backPath="/user"
    >
      <Card>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{ status: true }}
        >
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="username"
                label="用户名"
                rules={[
                  { required: true, message: '请输入用户名' },
                  { min: 3, message: '用户名至少3个字符' },
                  { max: 20, message: '用户名最多20个字符' },
                  { pattern: /^[a-zA-Z0-9_-]+$/, message: '用户名只能包含字母、数字、下划线和连字符' },
                ]}
              >
                <Input 
                  prefix={<UserOutlined />} 
                  placeholder="用户名" 
                  disabled={mode === 'edit'} // 编辑模式下不允许修改用户名
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="name"
                label="姓名"
                rules={[
                  { max: 50, message: '姓名最多50个字符' },
                ]}
              >
                <Input prefix={<IdcardOutlined />} placeholder="姓名" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="email"
                label="邮箱"
                rules={[
                  { type: 'email', message: '请输入有效的邮箱地址' },
                ]}
              >
                <Input prefix={<MailOutlined />} placeholder="邮箱" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="phone"
                label="手机号"
                rules={[
                  { pattern: /^[0-9-+\s]+$/, message: '请输入有效的手机号码' },
                ]}
              >
                <Input prefix={<PhoneOutlined />} placeholder="手机号" />
              </Form.Item>
            </Col>
          </Row>

          {mode === 'create' && (
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="password"
                  label="密码"
                  rules={[
                    { required: true, message: '请输入密码' },
                    { min: 6, message: '密码至少6个字符' },
                  ]}
                >
                  <Input.Password placeholder="密码" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="confirmPassword"
                  label="确认密码"
                  dependencies={['password']}
                  rules={[
                    { required: true, message: '请确认密码' },
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
                  <Input.Password placeholder="确认密码" />
                </Form.Item>
              </Col>
            </Row>
          )}

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="roleId"
                label="角色"
                rules={[
                  { required: true, message: '请选择角色' },
                ]}
              >
                <Select placeholder="选择角色">
                  {roles.map(role => (
                    <Select.Option key={role.id} value={role.id}>
                      {role.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="status"
                label="状态"
                valuePropName="checked"
              >
                <Switch 
                  checkedChildren="启用" 
                  unCheckedChildren="禁用" 
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item>
            <Space>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={submitLoading}
                icon={<SaveOutlined />}
              >
                {mode === 'create' ? '创建' : '保存'}
              </Button>
              <Button 
                onClick={() => navigate('/user')}
                icon={<RollbackOutlined />}
              >
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </PageContainer>
  );
};

export default UserForm;
