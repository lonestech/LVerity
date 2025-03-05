import request, { ApiResponse } from '../utils/request';
import { 
  Device, 
  DeviceStatus,
  DeviceMonitorStatus,
  DeviceRisk,
  DeviceQuery,
  DeviceAnalysis
} from '../models/device';

// 设备服务
export const deviceService = {
  /**
   * 获取设备列表
   * @param query 查询参数
   * @returns 设备列表
   */
  getDevices: (query: DeviceQuery): Promise<ApiResponse<{ total: number, items: Device[] }>> => {
    return request.get('/api/devices', { params: query });
  },

  /**
   * 获取设备详情
   * @param id 设备ID
   * @returns 设备详情
   */
  getDeviceById: (id: string): Promise<ApiResponse<Device>> => {
    return request.get(`/api/devices/${id}`);
  },

  /**
   * 创建设备
   * @param device 设备数据
   * @returns 创建结果
   */
  createDevice: (device: Partial<Device>): Promise<ApiResponse<Device>> => {
    return request.post('/api/devices', device);
  },

  /**
   * 更新设备
   * @param id 设备ID
   * @param device 设备数据
   * @returns 更新结果
   */
  updateDevice: (id: string, device: Partial<Device>): Promise<ApiResponse<Device>> => {
    return request.put(`/api/devices/${id}`, device);
  },

  /**
   * 删除设备
   * @param id 设备ID
   * @returns 删除结果
   */
  deleteDevice: (id: string): Promise<ApiResponse<void>> => {
    return request.delete(`/api/devices/${id}`);
  },

  /**
   * 获取设备状态
   * @param id 设备ID
   * @returns 设备状态
   */
  getDeviceStatus: (id: string): Promise<ApiResponse<DeviceStatus>> => {
    return request.get(`/api/devices/${id}/status`);
  },

  /**
   * 获取设备监控状态
   * @param id 设备ID
   * @returns 设备监控状态
   */
  getDeviceMonitorStatus: (id: string): Promise<ApiResponse<DeviceMonitorStatus>> => {
    return request.get(`/api/devices/${id}/monitor-status`);
  },

  /**
   * 获取设备风险评估
   * @param id 设备ID
   * @returns 设备风险评估
   */
  getDeviceRisk: (id: string): Promise<ApiResponse<DeviceRisk>> => {
    return request.get(`/api/devices/${id}/risk`);
  },

  /**
   * 获取设备行为分析
   * @param id 设备ID
   * @returns 设备行为分析
   */
  analyzeDevice: (id: string): Promise<ApiResponse<DeviceAnalysis>> => {
    return request.get(`/api/devices/${id}/analyze`);
  },

  /**
   * 解绑设备授权
   * @param id 设备ID
   * @returns 解绑结果
   */
  unbindLicense: (id: string): Promise<ApiResponse<void>> => {
    return request.post(`/api/devices/${id}/unbind-license`);
  },

  /**
   * 重启设备
   * @param id 设备ID
   * @returns 重启结果
   */
  restartDevice: (id: string): Promise<ApiResponse<void>> => {
    return request.post(`/api/devices/${id}/restart`);
  },

  /**
   * 激活设备
   * @param id 设备ID
   * @returns 激活结果
   */
  activateDevice: (id: string): Promise<ApiResponse<void>> => {
    return request.post(`/api/devices/${id}/activate`);
  },

  /**
   * 停用设备
   * @param id 设备ID
   * @returns 停用结果
   */
  deactivateDevice: (id: string): Promise<ApiResponse<void>> => {
    return request.post(`/api/devices/${id}/deactivate`);
  },

 