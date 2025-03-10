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
  Tag,
  Tooltip,
  Spin,
  Alert,
  Result
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
  PlusOutlined,
  QuestionCircleOutlined,
  InfoCircleOutlined,
  KeyOutlined
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { useQueryClient } from 'react-query';  
import PageContainer from '../../components/PageContainer';
import { licenseService } from '../../services/license';
import { License, Customer, Product } from '../../models/license';
import moment from 'moment';
import './form.css'; // 添加CSS样式引用

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
  const [formError, setFormError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [licenseTypes] = useState([
    { label: '标准版', value: 'standard' },
    { label: '专业版', value: 'professional' },
    { label: '企业版', value: 'enterprise' },
    { label: '试用版', value: 'trial' },
    { label: '开发版', value: 'development' }
  ]);
  const inputRef = React.useRef<Input>(null);
  const queryClient = useQueryClient();
  const [isGenerating, setIsGenerating] = useState(false);

  // 加载客户列表
  const loadCustomers = async () => {
    try {
      const response = await licenseService.getCustomers();
      if (response.success) {
        setCustomers(response.data);
      } else {
        message.error('加载客户列表失败: ' + response.message);
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
        console.log('加载的产品列表:', response.data);
        setProducts(response.data);
      } else {
        message.error('加载产品列表失败: ' + response.message);
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
    setLoadError(null);
    try {
      const response = await licenseService.getLicenseById(id);
      if (response.success) {
        const license = response.data;
        console.log('获取到的许可证数据:', license);
        
        // 填充表单数据
        form.setFieldsValue({
          code: license.code || license.key,  
          customerId: license.group_id || license.customerId,  
          productId: license.product_id || license.productId,  
          maxActivations: license.max_devices || license.maxActivations || license.usage_limit,  
          notes: license.description || license.notes,  
          status: license.status === 'active',
          type: license.type || 'standard',
        });
        
        // 设置日期范围
        const startDate = license.start_time || license.startDate;
        const endDate = license.expire_time || license.expiryDate;
        
        if (startDate && endDate) {
          form.setFieldsValue({
            dateRange: [
              moment(startDate),
              moment(endDate)
            ]
          });
        }
        
        // 设置功能特性
        if (license.features && license.features.length > 0) {
          setFeatures(license.features);
        }
      } else {
        const errorMsg = '加载许可证信息失败: ' + (response.message || '未知错误');
        setLoadError(errorMsg);
        message.error(errorMsg);
        setTimeout(() => navigate('/license'), 2000);
      }
    } catch (error) {
      console.error('加载许可证信息失败:', error);
      const errorMsg = '加载许可证信息失败: ' + (error.message || '未知错误');
      setLoadError(errorMsg);
      message.error(errorMsg);
      setTimeout(() => navigate('/license'), 2000);
    } finally {
      setLoading(false);
    }
  };

  // 组件挂载后初始化
  useEffect(() => {
    loadCustomers();
    loadProducts();
    
    // 设置创建模式的默认值
    if (mode === 'create') {
      form.setFieldsValue({ 
        status: true, 
        type: 'standard',
        maxActivations: 1,
        dateRange: [moment(), moment().add(1, 'year')]  // 默认1年有效期
      });
    }
    
    // 加载许可证数据（编辑模式）
    loadLicenseData();
  }, [mode, id]);

  // 聚焦输入框
  useEffect(() => {
    if (inputVisible) {
      inputRef.current?.focus();
    }
  }, [inputVisible]);

  // 提交表单
  const onFinish = async (values: any) => {
    setSubmitLoading(true);
    setFormError(null);
    try {
      const formData = {
        ...values,
        // 确保日期格式正确 - 使用YYYY-MM-DD格式
        starts_at: licenseService.formatToAPIDate(values.starts_at || values.StartsAt || new Date()),
        expires_at: licenseService.formatToAPIDate(values.expires_at || values.ExpiresAt),
        // 确保使用正确的字段名
        max_devices: parseInt(values.max_devices || values.maxDevices || 1, 10),
        code: values.code || values.key, // 确保code字段有值
        product_id: values.product_id || values.productId,
        group_id: values.group_id || values.customerId
      };

      console.log('提交表单数据:', formData);

      let response: ApiResponse<License>;
      
      if (id) {
        // 更新现有授权
        formData.id = id;
        response = await licenseService.updateLicense(formData);
      } else {
        // 创建新授权
        response = await licenseService.createLicense(formData);
      }

      if (response.success) {
        message.success(id ? '成功更新授权' : '成功创建授权');
        navigate('/license');
      } else {
        message.error(response.message || '操作失败');
      }
    } catch (error: any) {
      console.error('表单提交错误:', error);
      message.error(error.message || '提交表单时发生错误');
    } finally {
      setSubmitLoading(false);
    }
  };

  // 生成许可证密钥
  const generateKey = async () => {
    try {
      setIsGenerating(true);
      
      // 使用更复杂的随机密钥生成算法
      
      // 定义允许的字符集（排除容易混淆的字符如0,O,1,I等）
      const validChars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
      
      // 生成四段，每段5个字符的随机密钥
      const generateSegment = () => {
        let segment = '';
        for (let i = 0; i < 5; i++) {
          const randomIndex = Math.floor(Math.random() * validChars.length);
          segment += validChars.charAt(randomIndex);
        }
        return segment;
      };
      
      // 生成具有字母数字混合的复杂密钥
      const seg1 = generateSegment();
      const seg2 = generateSegment();
      const seg3 = generateSegment();
      const seg4 = generateSegment();
      
      // 组装最终密钥
      const enhancedKey = `${seg1}-${seg2}-${seg3}-${seg4}`;
      
      console.log('生成的增强密钥:', enhancedKey);
      
      // 设置表单字段值
      form.setFieldsValue({ 
        code: enhancedKey, 
        key: enhancedKey 
      });
      
      message.success('成功生成授权密钥');
    } catch(error) {
      console.error('生成密钥错误:', error);
      message.error('生成授权密钥时发生错误');
    } finally {
      setIsGenerating(false);
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

  // 处理标签输入框的值变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  // 处理按下Enter键事件
  const handleInputConfirm = () => {
    if (inputValue && features.indexOf(inputValue) === -1) {
      setFeatures([...features, inputValue]);
    }
    setInputVisible(false);
    setInputValue('');
  };

  // 样式定义
  const tagInputStyle: React.CSSProperties = {
    width: 78,
    verticalAlign: 'top',
  };

  const tagPlusStyle: React.CSSProperties = {
    borderStyle: 'dashed',
  };

  return (
    <PageContainer 
      title={mode === 'create' ? '创建许可证' : '编辑许可证'} 
      loading={loading}
      backPath="/license"
    >
      {loadError ? (
        <Result
          status="error"
          title="加载失败"
          subTitle={loadError}
          extra={
            <Button type="primary" onClick={() => navigate('/license')}>
              返回列表
            </Button>
          }
        />
      ) : (
        <Card 
          className="license-form-card"
          loading={loading}
        >
          {formError && (
            <Alert
              message="提交错误"
              description={formError}
              type="error"
              showIcon
              closable
              style={{ marginBottom: 24 }}
            />
          )}
          
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            className="license-form"
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
                  label={
                    <Space>
                      许可证密钥
                      <Tooltip title="创建后不可修改。密钥是授权的唯一标识符。">
                        <QuestionCircleOutlined />
                      </Tooltip>
                    </Space>
                  }
                  extra={mode === 'create' ? "创建后不可修改。可以点击按钮自动生成密钥。" : undefined}
                >
                  <Input.Group compact className="input-group-with-button">
                    <Form.Item 
                      name="code" 
                      noStyle
                      rules={[
                        { required: true, message: '请输入许可证密钥' },
                      ]}
                    >
                      <Input 
                        style={{ width: 'calc(100% - 100px)' }} 
                        placeholder="生成或输入许可证密钥"
                        disabled={mode === 'edit'} // 编辑模式下不允许修改密钥
                      />
                    </Form.Item>
                    {mode === 'create' ? (
                      <Button 
                        onClick={generateKey}
                        icon={<KeyOutlined />}
                        loading={isGenerating}
                      >
                        生成密钥
                      </Button>
                    ) : null}
                  </Input.Group>
                  <div className="form-item-description">
                    许可证密钥是唯一标识符，可以由系统自动生成或手动输入。
                  </div>
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="type"
                  label="许可证类型"
                  rules={[{ required: true, message: '请选择许可证类型' }]}
                >
                  <Select placeholder="选择许可证类型">
                    {licenseTypes.map(type => (
                      <Select.Option key={type.value} value={type.value}>
                        {type.label}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="version"
                  label="版本"
                >
                  <Input placeholder="许可证版本" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="status"
                  label={
                    <Space>
                      状态
                      <Tooltip title="许可证的当前状态，激活或未激活">
                        <QuestionCircleOutlined />
                      </Tooltip>
                    </Space>
                  }
                  valuePropName="checked"
                >
                  <Switch 
                    checkedChildren="激活" 
                    unCheckedChildren="未激活" 
                    defaultChecked={mode === 'create'}
                  />
                  <div className="form-item-description">
                    激活状态的许可证可以被客户端使用，未激活状态的许可证将无法进行设备激活。
                  </div>
                </Form.Item>
              </Col>
            </Row>
            
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="dateRange"
                  label={
                    <Space>
                      有效期
                      <Tooltip title="许可证的有效期范围，从开始日期到结束日期">
                        <QuestionCircleOutlined />
                      </Tooltip>
                    </Space>
                  }
                  rules={[
                    { required: true, message: '请选择有效期范围' },
                  ]}
                >
                  <RangePicker 
                    style={{ width: '100%' }} 
                    placeholder={['开始日期', '结束日期']}
                    format="YYYY-MM-DD"
                    disabledDate={(current) => {
                      // 禁止选择过去的日期
                      return current && current < moment().startOf('day');
                    }}
                    ranges={{
                      '1个月': [moment(), moment().add(1, 'month')],
                      '6个月': [moment(), moment().add(6, 'months')],
                      '1年': [moment(), moment().add(1, 'year')],
                      '2年': [moment(), moment().add(2, 'years')],
                      '永久': [moment(), moment().add(99, 'years')],
                    }}
                  />
                  <div className="form-item-description">
                    设置许可证的有效期范围，从开始日期到结束日期。可以选择预设的时间段或自定义日期。
                  </div>
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="maxActivations"
                  label={
                    <Space>
                      最大激活次数
                      <Tooltip title="该许可证可以激活的最大设备数量">
                        <QuestionCircleOutlined />
                      </Tooltip>
                    </Space>
                  }
                  rules={[
                    { required: true, message: '请输入最大激活次数' },
                    { 
                      type: 'number', 
                      min: 1, 
                      message: '激活次数必须大于0' 
                    }
                  ]}
                >
                  <InputNumber
                    min={1}
                    max={999}
                    style={{ width: '100%' }}
                    placeholder="设置可激活的设备数量"
                  />
                  <div className="form-item-description">
                    此许可证最多可以在多少台设备上激活，一般设置为1-10之间的数值。
                  </div>
                </Form.Item>
              </Col>
            </Row>
            
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item 
                  label={
                    <Space>
                      功能特性
                      <Tooltip title="此许可证包含的功能特性">
                        <QuestionCircleOutlined />
                      </Tooltip>
                    </Space>
                  }
                >
                  <div>
                    {features.map((tag, index) => {
                      const isLongTag = tag.length > 20;
                      const tagElem = (
                        <Tag
                          key={tag}
                          closable
                          color="blue"
                          style={{ marginBottom: 8 }}
                          onClose={() => handleClose(tag)}
                        >
                          {isLongTag ? `${tag.slice(0, 20)}...` : tag}
                        </Tag>
                      );
                      return isLongTag ? (
                        <Tooltip title={tag} key={tag}>
                          {tagElem}
                        </Tooltip>
                      ) : (
                        tagElem
                      );
                    })}

                    {inputVisible ? (
                      <Input
                        ref={inputRef}
                        type="text"
                        size="small"
                        style={tagInputStyle}
                        value={inputValue}
                        onChange={handleInputChange}
                        onBlur={handleInputConfirm}
                        onPressEnter={handleInputConfirm}
                      />
                    ) : (
                      <Tag 
                        onClick={showInput} 
                        style={tagPlusStyle}
                        icon={<PlusOutlined />}
                      >
                        添加特性
                      </Tag>
                    )}
                  </div>
                  <div className="form-item-description">
                    添加此许可证包含的功能特性。点击"添加特性"按钮添加新标签，输入后按回车确认。
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
                  label={
                    <Space>
                      客户
                      <Tooltip title="选择许可证所属的客户">
                        <QuestionCircleOutlined />
                      </Tooltip>
                    </Space>
                  }
                  rules={[
                    { required: true, message: '请选择客户' },
                    { 
                      validator: async (_, value) => {
                        if (!value) {
                          return Promise.reject(new Error('请选择客户'));
                        }
                        console.log('验证客户ID:', value);
                        return Promise.resolve();
                      }
                    }
                  ]}
                >
                  <Select 
                    placeholder="选择客户" 
                    showSearch
                    optionFilterProp="children"
                    loading={customers.length === 0}
                    notFoundContent={customers.length === 0 ? <Spin size="small" /> : null}
                    onChange={(value) => {
                      form.setFieldsValue({ customerId: value });
                      console.log('客户选择值:', value);
                    }}
                  >
                    {customers.map(customer => (
                      <Select.Option key={customer.id} value={customer.id}>
                        {customer.name}
                      </Select.Option>
                    ))}
                  </Select>
                  <div className="form-item-description">
                    选择此许可证将被分配给哪个客户。客户信息将用于许可证管理和统计。
                  </div>
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
                  label={
                    <Space>
                      产品
                      <Tooltip title="选择许可证对应的产品">
                        <QuestionCircleOutlined />
                      </Tooltip>
                    </Space>
                  }
                  rules={[
                    { required: true, message: '请选择产品' },
                    { 
                      validator: async (_, value) => {
                        if (!value) {
                          return Promise.reject(new Error('请选择产品'));
                        }
                        console.log('验证产品ID:', value);
                        return Promise.resolve();
                      }
                    }
                  ]}
                >
                  <Select 
                    placeholder="选择产品"
                    showSearch
                    optionFilterProp="children"
                    loading={products.length === 0}
                    notFoundContent={products.length === 0 ? <Spin size="small" /> : null}
                    onChange={(value) => {
                      form.setFieldsValue({ productId: value });
                    }}
                  >
                    {products.map(product => (
                      <Select.Option key={product.id} value={product.id}>
                        {product.name}
                      </Select.Option>
                    ))}
                  </Select>
                  <div className="form-item-description">
                    选择此许可证适用的产品。不同产品可能有不同的功能和权限。
                  </div>
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
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

            <Form.Item className="form-actions">
              <Space size="middle">
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
      )}
    </PageContainer>
  );
};

export default LicenseForm;
