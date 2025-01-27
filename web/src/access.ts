export default function access(initialState: { currentUser?: API.User }) {
  const { currentUser } = initialState || {};

  return {
    // 普通路由权限，登录即可访问
    normalRoute: !!currentUser,
    
    // 管理员路由权限，需要管理员角色
    adminRoute: currentUser?.role_id === 'admin',

    // 授权管理权限
    canManageLicense: currentUser?.role_id === 'admin' || currentUser?.role_id === 'operator',

    // 设备管理权限
    canManageDevice: currentUser?.role_id === 'admin' || currentUser?.role_id === 'operator',

    // 设备分组管理权限
    canManageDeviceGroup: currentUser?.role_id === 'admin' || currentUser?.role_id === 'operator',

    // 黑名单规则管理权限
    canManageBlacklist: currentUser?.role_id === 'admin',

    // 告警管理权限
    canManageAlert: currentUser?.role_id === 'admin' || currentUser?.role_id === 'operator',

    // 监控查看权限
    canViewMonitor: !!currentUser,

    // 用户管理权限
    canManageUser: currentUser?.role_id === 'admin',

    // 角色管理权限
    canManageRole: currentUser?.role_id === 'admin',

    // 系统日志查看权限
    canViewLog: currentUser?.role_id === 'admin',

    // 导出权限
    canExport: currentUser?.role_id === 'admin' || currentUser?.role_id === 'operator',

    // 导入权限
    canImport: currentUser?.role_id === 'admin',
  };
}
