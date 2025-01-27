declare namespace API {
  // 授权状态
  type LicenseStatus = 'active' | 'expired' | 'inactive';

  // 授权类型
  type LicenseType = 'trial' | 'standard' | 'professional';

  // 授权信息
  interface License {
    id: string;
    code: string;
    type: LicenseType;
    status: LicenseStatus;
    device_id?: string;
    description?: string;
    created_at: string;
    updated_at: string;
    created_by?: string;
    updated_by?: string;
  }

  // 设备状态
  type DeviceStatus = 'normal' | 'offline' | 'blocked' | 'suspect';

  // 设备硬件信息
  interface DeviceHardware {
    disk_id: string;
    bios: string;
    motherboard: string;
    network_cards?: string;
    display_card?: string;
    resolution?: string;
  }

  // 设备系统信息
  interface DeviceSystem {
    timezone: string;
    language: string;
    location?: string;
  }

  // 设备使用统计
  interface UsageStats {
    total_usage_time: number;
    daily_usage_time: number;
    monthly_usage_time: number;
    session_count: number;
    peak_usage_time?: string;
    avg_usage_time?: number;
    last_active_date?: string;
    last_session_end_time?: string;
  }

  // 设备信息
  interface Device {
    id: string;
    name: string;
    status: DeviceStatus;
    risk_level: number;
    disk_id: string;
    bios: string;
    motherboard: string;
    network_cards?: string;
    display_card?: string;
    resolution?: string;
    timezone: string;
    language: string;
    location?: string;
    group_id?: string;
    group_name?: string;
    license_id?: string;
    last_seen?: string;
    last_heartbeat?: string;
    alert_count: number;
    last_alert_time?: string;
    created_at: string;
    updated_at: string;
  }

  // 设备分组
  interface DeviceGroup {
    id: string;
    name: string;
    description?: string;
    device_count: number;
    created_by: string;
    created_at: string;
    updated_at: string;
  }

  // 异常行为级别
  type AbnormalBehaviorLevel = 'high' | 'medium' | 'low';

  // 异常行为记录
  interface AbnormalBehavior {
    id: string;
    device_id: string;
    type: string;
    level: AbnormalBehaviorLevel;
    description: string;
    data?: string;
    created_at: string;
  }

  // 黑名单规则类型
  type BlacklistRuleType = 'disk_id' | 'bios' | 'motherboard' | 'network_cards' | 'display_card' | 'resolution' | 'timezone' | 'language' | 'name';

  // 黑名单规则
  interface BlacklistRule {
    id: string;
    type: BlacklistRuleType;
    pattern: string;
    description?: string;
    created_by: string;
    created_at: string;
    updated_at: string;
  }

  // 设备报告
  interface DeviceReport {
    device_id: string;
    name: string;
    status: DeviceStatus;
    risk_level: number;
    usage_stats: UsageStats;
    alert_count: number;
    last_alert_time?: string;
    abnormal_behaviors: AbnormalBehavior[];
    hardware_info: DeviceHardware;
    system_info: DeviceSystem;
    created_at: string;
  }

  // 创建分组请求
  interface CreateGroupRequest {
    name: string;
    description?: string;
  }

  // 分配设备请求
  interface AssignDeviceRequest {
    device_id: string;
    group_id: string;
  }

  // 创建黑名单规则请求
  interface CreateRuleRequest {
    type: BlacklistRuleType;
    pattern: string;
    description?: string;
  }

  // 记录异常行为请求
  interface RecordAbnormalBehaviorRequest {
    device_id: string;
    type: string;
    level: AbnormalBehaviorLevel;
    description: string;
    data?: any;
  }

  // 设备心跳请求
  interface DeviceHeartbeatRequest {
    ip: string;
  }

  // 导出日志请求
  interface ExportLogsRequest {
    start_time: string;
    end_time: string;
    device_id?: string;
    format: 'csv' | 'json';
  }

  // 用户状态
  type UserStatus = 'active' | 'inactive' | 'locked';

  // 用户信息
  interface User {
    id: string;
    username: string;
    role_id: string;
    status: UserStatus;
    created_at: string;
    updated_at: string;
  }

  // 角色类型
  type RoleType = 'admin' | 'operator' | 'viewer';

  // 角色信息
  interface Role {
    id: string;
    name: string;
    type: RoleType;
    description?: string;
    created_at: string;
    updated_at: string;
  }

  // 权限信息
  interface Permission {
    id: string;
    resource: string;
    action: string;
    created_at: string;
    updated_at: string;
  }

  // 角色权限关联
  interface RolePermission {
    role_id: string;
    permission_id: string;
    created_at: string;
  }

  // 用户角色关联
  interface UserRole {
    user_id: string;
    role_id: string;
    created_at: string;
  }

  // 分页请求参数
  interface PageParams {
    current?: number;
    pageSize?: number;
  }

  // 分页响应结果
  interface PageResult<T> {
    data: T[];
    total: number;
  }

  // 通用响应结果
  interface Result<T> {
    success: boolean;
    data?: T;
    error_code?: string;
    error_message?: string;
  }

  // 登录请求参数
  interface LoginParams {
    username: string;
    password: string;
  }

  // 登录响应结果
  interface LoginResult {
    token: string;
    user: User;
  }
}
