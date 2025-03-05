import request, { ApiResponse } from '../utils/request';
import { 
  License, 
  LicenseActivation, 
  LicenseQuery,
  Customer,
  Product,
  LicenseStatistics
} from '../models/license';

// 授权服务
export const licenseService = {
  /**
   * 获取授权列表
   * @param query 查询参数
   * @returns 授权列表
   */
  getLicenses: (query: LicenseQuery): Promise<ApiResponse<{ total: number, items: License[] }>> => {
    return request.get('/api/licenses', { params: query });
  },

  /**
   * 获取授权详情
   * @param id 授权ID
   * @returns 授权详情
   */
  getLicenseById: (id: string): Promise<ApiResponse<License>> => {
    return request.get(`/api/licenses/${id}`);
  },

  /**
   * 创建授权
   * @param license 授权数据
   * @returns 创建结果
   */
  createLicense: (license: Partial<License>): Promise<ApiResponse<License>> => {
    return request.post('/api/licenses', license);
  },

  /**
   * 更新授权
   * @param id 授权ID
   * @param license 授权数据
   * @returns 更新结果
   */
  updateLicense: (id: string, license: Partial<License>): Promise<ApiResponse<License>> => {
    return request.put(`/api/licenses/${id}`, license);
  },

  /**
   * 删除授权
   * @param id 授权ID
   * @returns 删除结果
   */
  deleteLicense: (id: string): Promise<ApiResponse<void>> => {
    return request.delete(`/api/licenses/${id}`);
  },

  /**
   * 验证授权密钥
   * @param licenseKey 授权密钥
   * @returns 验证结果
   */
  verifyLicenseKey: (licenseKey: string): Promise<ApiResponse<License>> => {
    return request.post('/api/licenses/verify', { licenseKey });
  },

  /**
   * 激活授权
   * @param id 授权ID
   * @returns 激活结果
   */
  activateLicense: (id: string): Promise<ApiResponse<void>> => {
    return request.post(`/api/licenses/${id}/activate`);
  },

  /**
   * 暂停授权
   * @param id 授权ID
   * @returns 暂停结果
   */
  suspendLicense: (id: string): Promise<ApiResponse<void>> => {
    return request.post(`/api/licenses/${id}/suspend`);
  },

  /**
   * 获取授权激活记录
   * @param id 授权ID
   * @returns 激活记录
   */
  getLicenseActivations: (id: string): Promise<ApiResponse<LicenseActivation[]>> => {
    return request.get(`/api/licenses/${id}/activations`);
  },

  /**
   * 获取客户列表
   * @returns 客户列表
   */
  getCustomers: (): Promise<ApiResponse<Customer[]>> => {
    return request.get('/api/customers');
  },

  /**
   * 获取产品列表
   * @returns 产品列表
   */
  getProducts: (): Promise<ApiResponse<Product[]>> => {
    return request.get('/api/products');
  },

  /**
   * 获取授权统计信息
   * @returns 授权统计信息
   */
  getLicenseStatistics: (): Promise<ApiResponse<LicenseStatistics>> => {
    return request.get('/api/licenses/statistics');
  },

  /**
   * 导出授权列表
   * @param query 查询参数
   * @returns 导出文件URL
   */
  exportLicenses: (query: LicenseQuery): Promise<ApiResponse<{ url: string }>> => {
    return request.post('/api/licenses/export', query, {
      responseType: 'blob'
    }).then((response: any) => {
      // 创建Blob对象并生成临时URL
      const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      return {
        success: true,
        data: { url }
      };
    });
  },

  /**
   * 批量生成授权
   * @param params 批�