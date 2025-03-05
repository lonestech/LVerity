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
  Col, 
  DatePicker, 
  InputNumber, 
  Divider,
  Tag
} from 'antd';
import { 
  SafetyCertificateOutlined, 
  UserOutlined, 
  ShoppingOutlined, 
  CalendarOutlined,
  MailOutlined,
  PhoneOutlined,
  SaveOutlined,
  RollbackOutlined,
  PlusOutlined
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import PageContainer from '../../components/PageContainer';
import { licenseService } from '../../services/license';
import { License, Customer, Product } from '../../models/license';
import moment from 'moment';

interface LicenseFormProps {
  mode: 'create' | 'edit';
}

const { TextArea } = Input;
const { RangePicker } = DatePicker;

const LicenseForm: React.FC<LicenseFormProps> = ({ mode }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState<boolean>(false);
  const [submitLoading, setSubmitLoading] = useState<boolean>(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [features, setFeatures] = useState<string[]>([]);
  const [inputVisible, setInputVisible] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const inputRef = React.useRef<Input>(null);

  // 加载客户列表
  const loadCustomers = async () => {
    try {
      const response = await licenseService.getCustomers();
      if (response.success) {
        setCustomers(response.data);
      }
    } catch (error) {
      console.error('加载客户列表失败:', error);
      message.error('加载客户列表失败');
    }
  };

  // 加载产品列表
  const loadProducts = async () => {
    try {
      const response = await licenseService.getProducts();
      if (response.success) {
        setProducts(response.data);
      }
    } catch (error) {
      console.error('加载产品列表失败:', error);
      message.error('加载产品列表失败');
    }
  };

  // 加载许可证数据
  const loadLicenseData = async () => {
    if (mode === 'create' || !id) return;
    
    setLoading(true);
    try {
      const response = await licenseService.getLicenseById(id);
      if (response.success) {
        const license = response.data;
        
        // 填充表单数据
        form.setFieldsValue({
          key: license.key,
          customerId: license.customerId,
          productId: license.productId,
          version: license.version,
          maxActivations: license.maxActivations,
          notes: license.notes,
          status: license.status === 'active',
        });
        
        // 设置日期范围
        if (license.startDate && license.expiryDate) {
          form.setFieldsValue({
            dateRange: [
              moment(license.startDate),
              moment(license.expiryDate)
            ]
          });
        }
        
        // 设置功能特性
        if (license.features && license.features.length > 0) {
          setFeatures(license.features);
        }
      } else {
        message.error(response.message || '加载许可证信息失败');
        navigate('/license');
      }
    } catch (error) {
      console.error('加载许可证信息失败:', error);
      message.error('加载许可证信息失败');
      navigate('/license');
    } finally {
      setLoading(false);
    }
  };

  // 组件加载时获取数据
  useEffect(() => {
    loadCustomers();
    loadProducts();
    loadLicenseData();
  }, [id, mode]);

  // 聚焦输入框
  useEffect(() => {
    if (inputVisible) {
      inputRef.current?.focus();
    }
  }, [inputVisible]);

  // 提交表单
  const handleSubmit = async (values: any) => {
    setSubmitLoading(true);
    try {
      const licenseData: any = {
        ...values,
        status: values.status ? 'active' : 'inactive',
        features: features,
      };
      
      // 处理日期范围
      if (values.dateRange && values.dateRange.length === 2) {
        licenseData.startDate = values.dateRange[0].format('YYYY-MM-DD');
        licenseData.expiryDate = values.dateRange[1].format('YYYY-MM-DD');
      }
      
      delete licenseData.dateRange;
      
      let response;
      if (mode === 'create') {
        response = await licenseService.createLicense(licenseData);
      } else {
        response = await licenseService.updateLicense(id!, licenseData);
      }
      
      if (response.success) {
        message.success(mode === 'create' ? '许可证创建成功' : '许可证更新成功');
        navigate('/license');
      } else {
        message.error(response.message || (mode === 'create' ? '许可证创建失败' : '许可证更新失败'));
      }
    } catch (error) {
      console.error(mode === 'create' ? '许可证创建失败:' : '许可证更新失败:', error);
      message.error(mode === 'create' ? '许可证创建失败' : '许可证更新失败');
    } finally {
      setSubmitLoading(false);
    }
  };

  // 生成许可证密钥
  const generateLicenseKey = async () => {
    try {
      const response = await licenseService.generateLicenseKey();
      if (response.success && response.data.key) {
        form.setFieldsValue({ key: response.data.key });
      } else {
        message.error(response.message || '生成许可证密钥失败');
      }
    } catch (error) {
      console.error('生成许可证密钥失败:', error);
      message.error('生成许可证密钥失败');
    }
  };

  // 功能特性标签处理逻辑
  const handleClose = (removedTag: string) => {
    const newTags = features.filter(tag => tag !== removedTag);
    setFeatures(newTags);
  };

  const showInput = () => {
    setInputVisible(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleInputConfirm = () => {
    if (inputValue && features.indexOf(inputValue) === -1) {
      setFeatures([...features, inputValue]);
    }
    setInputVisible(false);
    setInputValue('');
  };

  return (
    <PageContainer 
      title={mode === 'create' ? '创建许可证' : '编辑许可证'} 
      loading={loading}
      backPath="/license"
    >
      <Card>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{ status: true }}
        >
          <Divider orientation="left">
            <Space>
              <SafetyCertificateOutlined />
              许可证基本信息
            </Space>
          </Divider>
          
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="key"
                label="许可证密钥"
                rules={[
                  { required: true, message: '请输入许可证密钥' },
                ]}
                extra={mode === 'create' ? "创建后不可修改。可以点击按钮自动生成密钥。" : undefined}
              >
                <Input 
                  placeholder="许可证密钥" 
                  disabled={mode === 'edit'} // 编辑模式下不允许修改密钥
                  addonAfter={
                    mode === 'create' ? (
                      <Button 
                        type="link" 
                        size="small" 
                        onClick={generateLicenseKey}
                        style={{ padding: 0, height: 'auto' }}
                      >
                        生成
                      </Button>
                    ) : null
                  }
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="version"
                label="版本"
              >
                <Input placeholder="许可证版本" />
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="dateRange"
                label="有效期"
              >
                <RangePicker 
                  style={{ width: '100%' }} 
                  placeholder={['开始日期', '到期日期']}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="maxActivations"
                label="最大激活次数"
                extra="留空表示不限制激活次数"
              >
                <InputNumber 
                  min={1} 
                  style={{ width: '100%' }} 
                  placeholder="最大激活次数" 
                />
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item label="功能特性">
                <div style={{ marginBottom: 16 }}>
                  {features.map((tag, index) => (
                    <Tag
                      key={tag}
                      closable
                      style={{ marginBottom: 8 }}
                      onClose={() => handleClose(tag)}
                    >
                      {tag}
                    </Tag>
                  ))}
                  {inputVisible ? (
                    <Input
                      ref={inputRef}
                      type="text"
                      size="small"
                      style={{ width: 200 }}
                      value={inputValue}
                      onChange={handleInputChange}
                      onBlur={handleInputConfirm}
                      onPressEnter={handleInputConfirm}
                    />
                  ) : (
                    <Tag onClick={showInput} style={{ marginBottom: 8, borderStyle: 'dashed' }}>
                      <PlusOutlined /> 添加功能
                    </Tag>
                  )}
                </div>
              </Form.Item>
            </Col>
          </Row>
          
          <Divider orientation="left">
            <Space>
              <UserOutlined />
              客户信息
            </Space>
          </Divider>
          
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="customerId"
                label="客户"
                rules={[
                  { required: true, message: '请选择客户' },
                ]}
              >
                <Select 
                  placeholder="选择客户" 
                  showSearch
                  optionFilterProp="children"
                >
                  {customers.map(customer => (
                    <Select.Option key={customer.id} value={customer.id}>
                      {customer.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="customerContact"
                label="联系人"
              >
                <Input 
                  prefix={<UserOutlined />} 
                  placeholder="客户联系人" 
                />
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="customerEmail"
                label="联系邮箱"
                rules={[
                  { type: 'email', message: '请输入有效的邮箱地址' },
                ]}
              >
                <Input 
                  prefix={<MailOutlined />} 
                  placeholder="联系邮箱" 
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="customerPhone"
                label="联系电话"
              >
                <Input 
                  prefix={<PhoneOutlined />} 
                  placeholder="联系电话" 
                />
              </Form.Item>
            </Col>
          </Row>
          
          <Divider orientation="left">
            <Space>
              <ShoppingOutlined />
              产品信息
            </Space>
          </Divider>
          
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="productId"
                label="产品"
                rules={[
                  { required: true, message: '请选择产品' },
                ]}
              >
                <Select 
                  placeholder="选择产品"
                  showSearch
                  optionFilterProp="children"
                >
                  {products.map(product => (
                    <Select.Option key={product.id} value={product.id}>
                      {product.name}
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
                  checkedChildren="激活" 
                  unCheckedChildren="未激活" 
                />
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="notes"
                label="备注"
              >
                <TextArea 
                  rows={4} 
                  placeholder="许可证备注信息" 
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
                onClick={() => navigate('/license')}
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

export default LicenseForm;
