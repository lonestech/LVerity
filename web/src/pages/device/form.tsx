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
  Divider,
  InputNumber,
  Typography
} from 'antd';
import { 
  DesktopOutlined, 
  SafetyCertificateOutlined, 
  GlobalOutlined, 
  CodeOutlined,
  LaptopOutlined,
  EnvironmentOutlined,
  SaveOutlined,
  RollbackOutlined
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import PageContainer from '../../components/PageContainer';
import { deviceService } from '../../services/device';
import { licenseService } from '../../services/license';
import { Device } from '../../models/device';
import { License } from '../../models/license';

interface DeviceFormProps {
  mode: 'create' | 'edit';
}

const { TextArea } = Input;
const { Text } = Typography;

const DeviceForm: React.FC<DeviceFormProps> = ({ mode }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState<boolean>(false);
  const [submitLoading, setSubmitLoading] = useState<boolean>(false);
  const [licenses, setLicenses] = useState<License[]>([]);
  const [checkingHardwareId, setCheckingHardwareId] = useState(false);

  // 加载许可证列表
  const loadLicenses = async () => {
    try {
      const response = await licenseService.getLicenses({ status: 'active' });
      if (response.success) {
        setLicenses(response.data.items);
      }
    } catch (error) {
      console.error('加载许可证列表失败:', error);
      message.error('加载许可证列表失败');
    }
  };

  // 加载设备数据
  const loadDeviceData = async () => {
    if (mode === 'create' || !id) return;
    
    setLoading(true);
    try {
      const response = await deviceService.getDeviceById(id);
      if (response.success) {
        const device = response.data;
        
        // 填充表单数据
        form.setFieldsValue({
          name: device.name,
          type: device.type,
          hardwareId: device.hardwareId,
          macAddress: device.macAddress,
          ipAddress: device.ipAddress,
          osInfo: device.osInfo,
          softwareVersion: device.softwareVersion,
          location: device.location,
          licenseKey: device.licenseKey,
          notes: device.notes,
          status: device.status === 'active',
        });
      } else {
        message.error(response.message || '加载设备信息失败');
        navigate('/device');
      }
    } catch (error) {
      console.error('加载设备信息失败:', error);
      message.error('加载设备信息失败');
      navigate('/device');
    } finally {
      setLoading(false);
    }
  };

  // 检查硬件ID是否已存在
  const checkHardwareIdExists = async (hardwareId: string) => {
    if (!hardwareId || mode === 'edit') return;
    
    setCheckingHardwareId(true);
    try {
      const response = await deviceService.checkHardwareIdExists(hardwareId);
      if (response.success && response.data.exists) {
        message.warning('该硬件ID已被其他设备使用');
      }
    } catch (error) {
      console.error('检查硬件ID失败:', error);
    } finally {
      setCheckingHardwareId(false);
    }
  };

  // 组件加载时获取数据
  useEffect(() => {
    loadLicenses();
    loadDeviceData();
  }, [id, mode]);

  // 提交表单
  const handleSubmit = async (values: any) => {
    setSubmitLoading(true);
    try {
      const deviceData = {
        ...values,
        status: values.status ? 'active' : 'inactive',
      };
      
      let response;
      if (mode === 'create') {
        response = await deviceService.createDevice(deviceData);
      } else {
        response = await deviceService.updateDevice(id!, deviceData);
      }
      
      if (response.success) {
        message.success(mode === 'create' ? '设备创建成功' : '设备更新成功');
        navigate('/device');
      } else {
        message.error(response.message || (mode === 'create' ? '设备创建失败' : '设备更新失败'));
      }
    } catch (error) {
      console.error(mode === 'create' ? '设备创建失败:' : '设备更新失败:', error);
      message.error(mode === 'create' ? '设备创建失败' : '设备更新失败');
    } finally {
      setSubmitLoading(false);
    }
  };

  // 生成硬件ID
  const generateHardwareId = () => {
    const randomId = Math.random().toString(36).substring(2, 15) + 
                    Math.random().toString(36).substring(2, 15);
    form.setFieldsValue({ hardwareId: randomId.toUpperCase() });
  };

  return (
    <PageContainer 
      title={mode === 'create' ? '注册设备' : '编辑设备'} 
      loading={loading}
      backPath="/device"
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
              <DesktopOutlined />
              基本信息
            </Space>
          </Divider>
          
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="name"
                label="设备名称"
                rules={[
                  { required: true, message: '请输入设备名称' },
                  { max: 50, message: '设备名称最多50个字符' },
                ]}
              >
                <Input prefix={<DesktopOutlined />} placeholder="设备名称" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="type"
                label="设备类型"
              >
                <Select placeholder="选择设备类型">
                  <Select.Option value="desktop">台式机</Select.Option>
                  <Select.Option value="laptop">笔记本</Select.Option>
                  <Select.Option value="server">服务器</Select.Option>
                  <Select.Option value="mobile">移动设备</Select.Option>
                  <Select.Option value="embedded">嵌入式设备</Select.Option>
                  <Select.Option value="other">其他</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="hardwareId"
                label="硬件标识"
                rules={[
                  { required: true, message: '请输入硬件标识' },
                ]}
                extra={mode === 'create' ? "创建后不可修改。可以点击按钮自动生成。" : undefined}
              >
                <Input 
                  prefix={<CodeOutlined />} 
                  placeholder="硬件标识" 
                  disabled={mode === 'edit'} // 编辑模式下不允许修改硬件标识
                  onChange={(e) => checkHardwareIdExists(e.target.value)}
                  addonAfter={
                    mode === 'create' ? (
                      <Button 
                        type="link" 
                        size="small" 
                        onClick={generateHardwareId}
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
                name="macAddress"
                label="MAC地址"
              >
                <Input 
                  prefix={<LaptopOutlined />} 
                  placeholder="MAC地址" 
                />
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="ipAddress"
                label="IP地址"
              >
                <Input 
                  prefix={<GlobalOutlined />} 
                  placeholder="IP地址" 
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="location"
                label="位置"
              >
                <Input 
                  prefix={<EnvironmentOutlined />} 
                  placeholder="设备位置" 
                />
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="osInfo"
                label="操作系统"
              >
                <Input placeholder="操作系统信息" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="softwareVersion"
                label="软件版本"
              >
                <Input placeholder="软件版本信息" />
              </Form.Item>
            </Col>
          </Row>
          
          <Divider orientation="left">
            <Space>
              <SafetyCertificateOutlined />
              许可证信息
            </Space>
          </Divider>
          
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="licenseKey"
                label="许可证密钥"
              >
                <Select 
                  placeholder="选择许可证" 
                  allowClear
                  showSearch
                  optionFilterProp="children"
                >
                  {licenses.map(license => (
                    <Select.Option key={license.id} value={license.key}>
                      {license.key} ({license.customerName} - {license.productName})
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
                  placeholder="设备备注信息" 
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
                onClick={() => navigate('/device')}
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

export default DeviceForm;
