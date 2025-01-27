import { defineConfig } from '@umijs/max';

export default defineConfig({
  antd: {},
  access: {},
  model: {},
  initialState: {},
  request: {
    dataField: 'data',
  },
  layout: {
    title: 'LVerity授权管理系统',
    locale: false,
  },
  extraPostCSSPlugins: [
    require('tailwindcss'),
    require('autoprefixer'),
  ],
  define: {
    'process.env': {
      NODE_ENV: process.env.NODE_ENV,
      API_URL: '/api',
    },
  },
  proxy: process.env.NODE_ENV === 'development' ? {
    '/api': {
      target: 'http://localhost:8080',
      changeOrigin: true,
      secure: false,
    },
  } : undefined,
  publicPath: process.env.NODE_ENV === 'production' ? './' : '/',
  hash: true,
  history: { type: 'browser' },
  routes: [
    {
      path: '/user',
      layout: false,
      routes: [
        {
          name: '登录',
          path: '/user/login',
          component: './Login',
        },
      ],
    },
    {
      path: '/',
      redirect: '/home',
    },
    {
      path: '/home',
      name: '首页',
      icon: 'home',
      component: './Home',
      access: 'normalRoute',
    },
    {
      path: '/license',
      name: '授权管理',
      icon: 'key',
      access: 'normalRoute',
      routes: [
        {
          path: '/license',
          redirect: '/license/list',
        },
        {
          name: '授权列表',
          path: '/license/list',
          component: './License',
          access: 'normalRoute',
        },
        {
          name: '授权详情',
          path: '/license/:id',
          component: './License/Detail',
          hideInMenu: true,
          access: 'normalRoute',
        },
      ],
    },
    {
      path: '/device',
      name: '设备管理',
      icon: 'laptop',
      access: 'normalRoute',
      routes: [
        {
          path: '/device',
          redirect: '/device/list',
        },
        {
          name: '设备列表',
          path: '/device/list',
          component: './Device',
          access: 'normalRoute',
        },
        {
          name: '设备详情',
          path: '/device/:id',
          component: './Device/Detail',
          hideInMenu: true,
          access: 'normalRoute',
        },
      ],
    },
    {
      path: '/system',
      name: '系统管理',
      icon: 'setting',
      access: 'adminRoute',
      routes: [
        {
          name: '用户管理',
          path: '/system/users',
          component: './User',
          access: 'adminRoute',
          icon: 'user',
        },
        {
          name: '角色管理',
          path: '/system/roles',
          component: './Role',
          access: 'adminRoute',
          icon: 'team',
        },
      ],
    },
    {
      path: '/account',
      name: '个人中心',
      icon: 'user',
      hideInMenu: true,
      routes: [
        {
          name: '个人设置',
          path: '/account/settings',
          component: './Account/Settings',
        },
        {
          name: '修改密码',
          path: '/account/change-password',
          component: './Account/ChangePassword',
        },
      ],
    },
  ],
  npmClient: 'pnpm',
  theme: {
    'primary-color': '#1890ff',
  },
});
