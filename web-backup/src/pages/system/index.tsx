import { PageContainer } from '@ant-design/pro-components';
import { Card, Row, Col, Form, Switch, Select, Button, message } from 'antd';
import { useState, useEffect } from 'react';
import { systemService, SystemSettings } from '@/services/system';

export default function System() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // 加载系统设置
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const settings = await systemService.getSettings();
        form.setFieldsValue(settings);
      } catch (error: any) {
        message.error(error.message || '加载设置失败');
      } finally {
        setLoading(false);
      }
    };
    
    fetchSettings();
  }, [form]);

  // 处理设置保存
  const handleSave = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      await systemService.updateSettings(values as SystemSettings);
      message.success('设置保存成功');
    } catch (error: any) {
      message.error(error.message || '保存失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer>
      <Card title="系统设置">
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            theme: 'light',
            language: 'zh_CN',
            notifications: true,
            autoUpdate: true,
          }}
        >
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item
                name="theme"
                label="界面主题"
                rules={[{ required: true, message: '请选择界面主题' }]}
              >
                <Select>
                  <Select.Option value="light">浅色主题</Select.Option>
                  <Select.Option value="dark">深色主题</Select.Option>
                  <Select.Option value="system">跟随系统</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="language"
                label="语言"
                rules={[{ required: true, message: '请选择语言' }]}
              >
                <Select>
                  <Select.Option value="zh_CN">简体中文</Select.Option>
                  <Select.Option value="en_US">English</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col span={12}>
              <Form.Item
                name="notifications"
                label="通知提醒"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="autoUpdate"
                label="自动更新"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item>
            <Button type="primary" onClick={handleSave} loading={loading}>
              保存设置
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </PageContainer>
  );
}
