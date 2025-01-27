export default [
  {
    path: '/user',
    layout: false,
    routes: [
      {
        name: 'login',
        path: '/user/login',
        component: './User/Login',
      },
    ],
  },
  {
    path: '/welcome',
    name: 'welcome',
    icon: 'smile',
    component: './Welcome',
    access: 'normalRoute',
  },
  {
    path: '/device',
    name: 'device',
    icon: 'laptop',
    access: 'normalRoute',
    routes: [
      {
        path: '/device',
        name: 'list',
        component: './Device',
        access: 'canManageDevice',
      },
      {
        path: '/device/:id',
        name: 'detail',
        component: './Device/Detail',
        access: 'canManageDevice',
        hideInMenu: true,
      },
      {
        path: '/device/group',
        name: 'group',
        component: './DeviceGroup',
        access: 'canManageDeviceGroup',
      },
      {
        path: '/device/blacklist',
        name: 'blacklist',
        component: './BlacklistRule',
        access: 'canManageBlacklist',
      },
    ],
  },
  {
    path: '/monitor',
    name: 'monitor',
    icon: 'dashboard',
    component: './Monitor',
    access: 'canViewMonitor',
  },
  {
    path: '/alert',
    name: 'alert',
    icon: 'warning',
    component: './Alert',
    access: 'canManageAlert',
  },
  {
    path: '/license',
    name: 'license',
    icon: 'key',
    access: 'normalRoute',
    routes: [
      {
        path: '/license',
        name: 'list',
        component: './License',
        access: 'canManageLicense',
      },
      {
        path: '/license/:id',
        name: 'detail',
        component: './License/Detail',
        access: 'canManageLicense',
        hideInMenu: true,
      },
    ],
  },
  {
    path: '/system',
    name: 'system',
    icon: 'setting',
    access: 'adminRoute',
    routes: [
      {
        path: '/system/user',
        name: 'user',
        component: './System/User',
        access: 'canManageUser',
      },
      {
        path: '/system/role',
        name: 'role',
        component: './System/Role',
        access: 'canManageRole',
      },
      {
        path: '/system/log',
        name: 'log',
        component: './System/Log',
        access: 'canViewLog',
      },
    ],
  },
  {
    path: '/',
    redirect: '/welcome',
  },
  {
    path: '*',
    layout: false,
    component: './404',
  },
];
