import { get, post, put, del } from '@/utils/request';

// 获取设备列表
export async function getDeviceList(params: API.PageParams & Record<string, any>) {
  return get<API.PageResult<API.Device>>('/devices', params);
}

// 获取设备详情
export async function getDeviceDetail(id: string) {
  return get<API.Device>(`/devices/${id}`);
}

// 创建设备
export async function createDevice(data: Partial<API.Device>) {
  return post<API.Device>('/devices', data);
}

// 更新设备
export async function updateDevice(id: string, data: Partial<API.Device>) {
  return put<API.Device>(`/devices/${id}`, data);
}

// 删除设备
export async function deleteDevice(id: string) {
  return del(`/devices/${id}`);
}

// 获取设备状态
export async function getDeviceStatus(id: string) {
  return get<{
    status: API.DeviceStatus;
    risk_level: number;
    last_seen: string;
    last_heartbeat: string;
    alert_count: number;
    last_alert_time: string;
  }>(`/devices/${id}/status`);
}

// 获取设备使用统计
export async function getDeviceUsageStats(id: string) {
  return get<API.UsageStats>(`/devices/${id}/usage-stats`);
}

// 获取设备异常行为记录
export async function getDeviceAbnormalBehaviors(id: string, params?: API.PageParams) {
  return get<API.PageResult<API.AbnormalBehavior>>(`/devices/${id}/abnormal-behaviors`, params);
}

// 记录设备异常行为
export async function recordAbnormalBehavior(data: API.RecordAbnormalBehaviorRequest) {
  return post<API.AbnormalBehavior>('/devices/abnormal-behaviors', data);
}

// 封禁设备
export async function blockDevice(id: string) {
  return post(`/devices/${id}/block`);
}

// 解封设备
export async function unblockDevice(id: string) {
  return post(`/devices/${id}/unblock`);
}

// 更新设备心跳
export async function updateDeviceHeartbeat(id: string, data: API.DeviceHeartbeatRequest) {
  return post(`/devices/${id}/heartbeat`, data);
}

// 获取设备分组列表
export async function getDeviceGroups(params?: API.PageParams) {
  return get<API.PageResult<API.DeviceGroup>>('/device-groups', params);
}

// 创建设备分组
export async function createDeviceGroup(data: API.CreateGroupRequest) {
  return post<API.DeviceGroup>('/device-groups', data);
}

// 更新设备分组
export async function updateDeviceGroup(id: string, data: Partial<API.DeviceGroup>) {
  return put<API.DeviceGroup>(`/device-groups/${id}`, data);
}

// 删除设备分组
export async function deleteDeviceGroup(id: string) {
  return del(`/device-groups/${id}`);
}

// 分配设备到分组
export async function assignDeviceToGroup(data: API.AssignDeviceRequest) {
  return post('/device-groups/assign', data);
}

// 获取黑名单规则列表
export async function getBlacklistRules(params?: API.PageParams) {
  return get<API.PageResult<API.BlacklistRule>>('/blacklist-rules', params);
}

// 创建黑名单规则
export async function createBlacklistRule(data: API.CreateRuleRequest) {
  return post<API.BlacklistRule>('/blacklist-rules', data);
}

// 更新黑名单规则
export async function updateBlacklistRule(id: string, data: Partial<API.BlacklistRule>) {
  return put<API.BlacklistRule>(`/blacklist-rules/${id}`, data);
}

// 删除黑名单规则
export async function deleteBlacklistRule(id: string) {
  return del(`/blacklist-rules/${id}`);
}

// 获取设备报告
export async function getDeviceReport(id: string) {
  return get<API.DeviceReport>(`/devices/${id}/report`);
}

// 导出设备日志
export async function exportDeviceLogs(params: API.ExportLogsRequest) {
  return get('/devices/logs/export', params, { responseType: 'blob' });
}

// 导出设备列表
export async function exportDevices(params: Record<string, any>) {
  return get('/devices/export', params, { responseType: 'blob' });
}

// 导出异常行为记录
export async function exportAbnormalBehaviors(params: Record<string, any>) {
  return get('/devices/abnormal-behaviors/export', params, { responseType: 'blob' });
}

// 获取设备统计信息
export async function getDeviceStats() {
  return get<{
    total: number;
    online: number;
    offline: number;
    blocked: number;
    suspect: number;
    high_risk: number;
  }>('/devices/stats');
}

// 获取设备位置信息
export async function getDeviceLocation(id: string) {
  return get<{
    timezone: string;
    language: string;
    location: string;
  }>(`/devices/${id}/location`);
}
