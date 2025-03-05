import React, { useState, useEffect } from 'react';
import { Layout, Menu, Avatar, Dropdown, Button, Breadcrumb, theme } from 'antd';
import {
  DashboardOutlined,
  KeyOutlined,
  LaptopOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { getUser, logout } from '../../utils/auth';

const { Header, Sider, Content } = Layout;

/**
 * 主布局组件
 */
const MainLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [user, setUser] = useState(getUser());
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [breadcrumbs, setBreadcrumbs] = useState<{ title: string; path?: string }[]>([]);
  
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  // 根据路径获取选中的菜单项
  useEffect(() => {
    const pathname = location.pathname;
    const key = '/' + pathname.split('/')[1]; // 获取第一级路径
    setSelectedKeys([key]);
    
    // 设置面包屑
    const pathSnippets = pathname.split('/').filter(i => i);
    const breadcrumbItems = pathSnippets.map((_, index) => {
      const url = `/${pathSnippets.slice(0, index + 1).join('/')}`;
      const title = breadcrumbNameMap[url] || url;
      return { title, path: url };
    });
    
    if (breadcrumbItems.length === 0) {
      breadcrumbItems.push({ title: '仪表盘' });
    }
    
    setBreadcrumbs(breadcrumbItems);
  }, [location]);

  // 页面标题映射
  const breadcrumbNameMap: Record<string, string> = {
    '/': '仪表盘',
    '/dashboard': '仪表盘',
    '/license': '授权管理',
    '/license/detail': '授权详情',
    '/license/create': '创建授权',
    '/device': '设备管理',
    '/device/detail': '设备详情',
    '/user': '用户管理',
    '/user/detail': '用户详情',
    '/user/create': '创建用户',
    '/system': '系统设置',
    '/system/log': '系统日志',
    '/system/backup': '系统备份',
    '/system/config': '系统配置',
  };

  // 处理菜单点击
  const handleMenuClick = (key: string) => {
    navigate(key);
  };

  // 处理退出登录
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // 用户下拉菜单
  const userMenu = {
    items: [
      {
        key: 'profile',
        icon: <UserOutlined />,
        label: '个人资料',
      },
      {
        key: 'settings',
        icon: <SettingOutlined />,
        label: '账号设置',
      },
      {
        type: 'divider',
      },
      {
        key: 'logout',
        icon: <LogoutOutlined />,
        label: '退出登录',
      },
    ],
    onClick: ({ key }: { key: string }) => {
      if (key === 'logout') {
        handleLogout();
      } else if (key === 'profile') {
        navigate('/user/profile');
      } else if (key === 'settings') {
        navigate('/user/settings');
      }
    },
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider 
        trigger={null} 
        collapsible 
        collapsed={collapsed}
        theme="light"
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          boxShadow: '2px 0 8px rgba(0,0,0,0.08)'
        }}
      >
        <div style={{ 
          height: 64, 
          margin: 16, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: collapsed ? 'center' : 'flex-start'
        }}>
          <h1 style={{ 
            margin: 0, 
            fontSize: collapsed ? 18 : 20, 
            fontWeight: 600,
            color: '#1890ff' 
          }}>
            {collapsed ? 'LV' : 'LVerity'}
          </h1>
        </div>

        <Menu
          theme="light"
          mode="inline"
          selectedKeys={selectedKeys}
          style={{ borderRight: 0 }}
          items={[
            {
              key: '/',
              icon: <DashboardOutlined />,
              label: '仪表盘',
              onClick: () => handleMenuClick('/'),
            },
            {
              key: '/license',
              icon: <KeyOutlined />,
              label: '授权管理',
              onClick: () => handleMenuClick('/license'),
            },
            {
              key: '/device',
              icon: <LaptopOutlined />,
              label: '设备管理',
              onClick: () => handleMenuClick('/device'),
            },
            {
              key: '/user',
              icon: <UserOutlined />,
              label: '用户管理',
              onClick: () => handleMenuClick('/user'),
            },
            {
              key: '/system',
              icon: <SettingOutlined />,
              label: '系统设置',
              onClick: () => handleMenuClick('/system'),
            },
          ]}
        />
      </Sider>

      <Layout style={{ marginLeft: collapsed ? 80 : 200, transition: 'all 0.2s' }}>
        <Header style={{ 
          padding: '0 24px', 
          background: colorBgContainer,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 1px 4px rgba(0,0,0,0.08)'
        }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ fontSize: '16px', width: 64, height: 64 }}
          />

          <Dropdown menu={userMenu} placement="bottomRight">
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '4px',
              transition: 'background 0.3s',
              '&:hover': {
                background: 'rgba(0, 0, 0, 0.025)'
              }
            }}>
              <Avatar 
                style={{ backgroundColor: '#1890ff' }}
                icon={<UserOutlined />}
              />
              <span style={{ marginLeft: 8, marginRight: 8 }}>
                {user?.name || user?.username || '用户'}
              </span>
            </div>
          </Dropdown>
        </Header>

        <Content style={{ margin: '16px', overflow: 'initial' }}>
          <Breadcrumb 
            style={{ margin: '16px 0' }}
            items={breadcrumbs.map((item) => ({
              title: item.path ? <Link to={item.path}>{item.title}</Link> : item.title,
            }))}
          />
          <div
            style={{
              padding: 24,
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
              minHeight: 'calc(100vh - 180px)',
            }}
          >
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
