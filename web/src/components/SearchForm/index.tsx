import { Card, Form, Row, Col, Button } from 'antd';
import { SearchOutlined, UndoOutlined } from '@ant-design/icons';
import { ReactNode } from 'react';

interface SearchFormProps {
  children: ReactNode;
  onSearch: (values: any) => void;
  onReset?: () => void;
}

export default function SearchForm({ children, onSearch, onReset }: SearchFormProps) {
  const [form] = Form.useForm();

  const handleReset = () => {
    form.resetFields();
    onReset?.();
  };

  return (
    <Card style={{ marginBottom: 16 }}>
      <Form
        form={form}
        onFinish={onSearch}
        layout="horizontal"
      >
        <Row gutter={16}>
          {children}
          <Col>
            <Form.Item>
              <Button 
                type="primary" 
                htmlType="submit" 
                icon={<SearchOutlined />}
              >
                搜索
              </Button>
              <Button
                style={{ marginLeft: 8 }}
                onClick={handleReset}
                icon={<UndoOutlined />}
              >
                重置
              </Button>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Card>
  );
}
