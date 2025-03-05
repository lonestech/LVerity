import { useState } from 'react';
import { 
  BrowserRouter as Router,
  Routes, 
  Route, 
  Navigate, 
  useNavigate, 
  useLocation 
} from 'react-router-dom';
import { Spin, Dropdown, Avatar, Menu } from 'antd';
import type { MenuProps } from 'antd';
import { ProLayout } from '@ant-design/pro-components';
import {
  DashboardOutlined,
  KeyOutlined,
  LaptopOutlined,
  SettingOutlined,
  UserOutlined,
  LogoutOutlined,
  LockOutlined,
} from '@ant-design/icons';

// 页面组件
import Dashboard from './pages/dashboard';
import Login from './pages/login';
import License from './pages/license/router';
import Device from './pages/device';
import User from './pages/user/router'; 
import System from './pages/system';
import { isAuthenticated, getCurrentUser, logout } from './utils/auth';

// 定义菜单项类型
type MenuItem = {
  path: string;
  name: string;
  icon: React.ReactNode;
  component?: React.ReactNode;
  children?: MenuItem[];
};

// 菜单配置
const menuItems: MenuItem[] = [
  {
    path: '/dashboard',
    name: '仪表盘',
    icon: <DashboardOutlined />,
    component: <Dashboard />,
  },
  {
    path: '/license',
    name: '授权管理',
    icon: <KeyOutlined />,
    component: <License />,
  },
  {
    path: '/device',
    name: '设备管理',
    icon: <LaptopOutlined />,
    component: <Device />,
  },
  {
    path: '/user',
    name: '用户管理',
    icon: <UserOutlined />,
    component: <User />,
  },
  {
    path: '/system',
    name: '系统设置',
    icon: <SettingOutlined />,
    component: <System />,
  },
];

// 保护路由组件
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isLoggedIn = isAuthenticated();
  const location = useLocation();

  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

// 应用主体布局
const AppLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  
  // 从菜单配置中获取当前路径对应的菜单项
  const findCurrentMenuItem = (path: string): MenuItem | undefined => {
    return menuItems.find(item => path.startsWith(item.path));
  };
  
  const currentMenuItem = findCurrentMenuItem(location.pathname);
  
  // 如果没有找到对应的菜单项且不是根路径，重定向到仪表盘
  if (!currentMenuItem && location.pathname !== '/') {
    return <Navigate to="/dashboard" replace />;
  }
  
  // 如果是根路径，重定向到仪表盘
  if (location.pathname === '/') {
    return <Navigate to="/dashboard" replace />;
  }

  // 用户菜单项
  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      label: '个人资料',
      icon: <UserOutlined />,
      onClick: () => navigate('/user/profile'),
    },
    {
      key: 'change-password',
      label: '修改密码',
      icon: <LockOutlined />,
      onClick: () => navigate('/user/change-password'),
    },
    {
      key: 'logout',
      label: '退出登录',
      icon: <LogoutOutlined />,
      onClick: () => {
        logout();
        navigate('/login');
      },
    },
  ];

  // 获取当前用户
  const currentUser = getCurrentUser();

  // 构建路由表
  const routes = menuItems.map(item => (
    <Route
      key={item.path}
      path={`${item.path}/*`}
      element={<ProtectedRoute>{item.component}</ProtectedRoute>}
    />
  ));

  return (
    <ProLayout
      title="LVerity"
      logo="/logo.svg"
      collapsed={collapsed}
      onCollapse={setCollapsed}
      location={{
        pathname: location.pathname,
      }}
      route={{
        routes: menuItems.map(item => ({
          path: item.path,
          name: item.name,
          icon: item.icon,
        })),
      }}
      avatarProps={{
        src: currentUser?.avatar || 'https://gw.alipayobjects.com/zos/antfincdn/efFD%24IOql2/weixintupian_20170331104822.jpg',
        size: 'small',
        title: currentUser?.username || '用户',
        render: (props, dom) => (
          <Dropdown menu={{ items: userMenuItems }} trigger={['click']}>
            {dom}
          </Dropdown>
        ),
      }}
      menuItemRender={(item, dom) => (
        <div onClick={() => navigate(item.path || '/')}>{dom}</div>
      )}
      contentStyle={{ padding: '16px', height: '100%' }}
    >
      <Routes>
        {routes}
      </Routes>
    </ProLayout>
  );
};

// 登录页面路由
const LoginRoutes = () => {
  return (
    <div className="login-wrapper" style={{ height: '100vh', width: '100vw', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
};

// 主应用组件
export default function App() {
  // App组件不再使用useLocation，因为它现在是Router的顶层包装
  return (
    <Router>
      <Routes>
        <Route path="/login/*" element={<LoginRoutes />} />
        <Route path="/*" element={<AppLayout />} />
      </Routes>
    </Router>
  );
}
