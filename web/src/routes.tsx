import {
  DashboardOutlined,
  KeyOutlined,
  LaptopOutlined,
  SettingOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { lazy } from 'react';

const Dashboard = lazy(() => import('./pages/dashboard'));
const License = lazy(() => import('./pages/license'));
const Device = lazy(() => import('./pages/device'));
const User = lazy(() => import('./pages/user'));
const System = lazy(() => import('./pages/system'));

export const routes = [
  {
    path: '/',
    name: '统计分析',
    icon: <DashboardOutlined />,
    element: <Dashboard />,
  },
  {
    path: '/license',
    name: '授权管理',
    icon: <KeyOutlined />,
    element: <License />,
  },
  {
    path: '/device',
    name: '设备管理',
    icon: <LaptopOutlined />,
    element: <Device />,
  },
  {
    path: '/user',
    name: '用户管理',
    icon: <UserOutlined />,
    element: <User />,
  },
  {
    path: '/system',
    name: '系统设置',
    icon: <SettingOutlined />,
    element: <System />,
  },
];
