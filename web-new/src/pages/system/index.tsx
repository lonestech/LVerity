import React, { useState } from 'react';
import { Tabs, Card, Alert } from 'antd';
import { 
  AreaChartOutlined, 
  FileTextOutlined, 
  SaveOutlined, 
  SettingOutlined 
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import PageContainer from '../../components/PageContainer';
import SystemLogs from './logs';
import SystemBackup from './backup';
import SystemConfig from './config';
import SystemStats from './stats';

const { TabPane } = Tabs;

// 错误边界组件
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("组件渲染错误:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // 自定义回退UI
      return (
        <Card>
          <Alert
            message="模块加载错误"
            description="此模块加载失败，可能是由于数据不可用或接口问题。请稍后再试或联系管理员。"
            type="error"
            showIcon
          />
        </Card>
      );
    }

    return this.props.children;
  }
}

const SystemPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // 确定当前激活的标签页
  const getActiveKey = () => {
    const path = location.pathname;
    if (path.includes('/system/logs')) return 'logs';
    if (path.includes('/system/backup')) return 'backup';
    if (path.includes('/system/config')) return 'config';
    return 'stats'; // 默认为统计信息
  };
  
  const [activeKey, setActiveKey] = useState<string>(getActiveKey());

  // 处理标签页切换
  const handleTabChange = (key: string) => {
    setActiveKey(key);
    
    // 根据选择的标签页更新路由
    switch (key) {
      case 'logs':
        navigate('/system/logs');
        break;
      case 'backup':
        navigate('/system/backup');
        break;
      case 'config':
        navigate('/system/config');
        break;
      default:
        navigate('/system');
        break;
    }
  };

  return (
    <PageContainer title="系统管理">
      <Card>
        <Tabs 
          activeKey={activeKey} 
          onChange={handleTabChange}
          items={[
            {
              key: 'stats',
              label: (
                <span>
                  <AreaChartOutlined />
                  系统状态
                </span>
              ),
              children: (
                <ErrorBoundary>
                  <SystemStats />
                </ErrorBoundary>
              )
            },
            {
              key: 'logs',
              label: (
                <span>
                  <FileTextOutlined />
                  系统日志
                </span>
              ),
              children: (
                <ErrorBoundary>
                  <SystemLogs />
                </ErrorBoundary>
              )
            },
            {
              key: 'backup',
              label: (
                <span>
                  <SaveOutlined />
                  备份恢复
                </span>
              ),
              children: (
                <ErrorBoundary>
                  <SystemBackup />
                </ErrorBoundary>
              )
            },
            {
              key: 'config',
              label: (
                <span>
                  <SettingOutlined />
                  系统配置
                </span>
              ),
              children: (
                <ErrorBoundary>
                  <SystemConfig />
                </ErrorBoundary>
              )
            }
          ]}
        />
      </Card>
    </PageContainer>
  );
};

export default SystemPage;
