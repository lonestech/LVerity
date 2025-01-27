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
  publicPath: '/',
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
      path: '*',
      layout: false,
      component: './404',
    },
  ],
  npmClient: 'pnpm',
  theme: {
    'primary-color': '#1890ff',
  },
});
