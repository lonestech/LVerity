import request from '@/utils/request';
import { ApiResponse } from '@/utils/request';
import { License, LicenseActivation, Customer, Product, LicenseQuery, LicenseStatistics } from '@/models/license';

// 授权服务
export const licenseService = {
  /**
   * 获取授权列表
   * @param query 查询参数
   * @returns 授权列表
   */
  getLicenses: async (query: LicenseQuery): Promise<ApiResponse<any>> => {
    console.log('获取授权列表请求参数:', query);
    
    // 转换参数为API需要的格式
    const apiParams: any = {
      page: query.page || 1,
      pageSize: query.pageSize || 10,
      // 其他查询参数
      status: query.status || '',
      group_id: query.customerId || '',
      keyword: query.keyword || '',
      _t: new Date().getTime()  // 防止缓存
    };
    
    console.log('发送到API的参数:', apiParams);
    
    // 执行请求
    const response = await request.get('/api/licenses', {
      params: apiParams
    });
    
    console.log('原始API响应:', response);
    
    // 标准化响应格式
    const standardResponse: ApiResponse<any> = {
      success: response.success || response.code === 200,
      message: response.message || '',
      code: response.code || 0,
      data: response.data || {}
    };
    
    console.log('标准化后的响应:', standardResponse);
    
    return standardResponse;
  },

  /**
   * 获取授权详情
   * @param id 授权ID
   * @returns 授权详情
   */
  getLicenseById: (id: string): Promise<ApiResponse<License>> => {
    console.log('获取授权详情，ID:', id);
    return request.get(`/api/licenses/${id}`);
  },

  /**
   * 创建许可证
   * @param license 许可证数据
   * @returns 创建结果
   */
  createLicense: async (license: License) => {
    // 确保日期格式正确 - 使用YYYY-MM-DD格式
    const formattedLicense = {
      ...license,
      // 使用后端期望的字段名
      starts_at: license.starts_at || license.StartsAt || formatToAPIDate(new Date()),
      expires_at: license.expires_at || license.ExpiresAt,
      max_devices: license.max_devices || license.maxDevices || 1,
      code: license.code || license.key, // 确保code字段有值
      product_id: license.product_id || license.productId,
      group_id: license.group_id || license.customerId,
      description: license.description || ''
    };

    console.log('API提交的授权数据:', formattedLicense);
    return request.post<ApiResponse<License>>('/api/licenses', formattedLicense);
  },

  /**
   * 更新许可证
   * @param license 许可证数据
   * @returns 更新结果
   */
  updateLicense: async (license: License) => {
    const id = license.id;
    if (!id) {
      throw new Error('更新授权时缺少ID');
    }
    
    // 确保日期格式正确并使用后端期望的字段名
    const formattedLicense = {
      ...license,
      starts_at: license.starts_at || license.StartsAt || formatToAPIDate(new Date()),
      expires_at: license.expires_at || license.ExpiresAt,
      max_devices: license.max_devices || license.maxDevices || 1,
      code: license.code || license.key, // 确保code字段有值
      product_id: license.product_id || license.productId,
      group_id: license.group_id || license.customerId,
      description: license.description || ''
    };

    console.log(`更新授权 ID: ${id}, 数据:`, formattedLicense);
    return request.put<ApiResponse<License>>(`/api/licenses/${id}`, formattedLicense);
  },

  /**
   * 删除授权
   * @param id 授权ID
   * @returns 删除结果
   */
  deleteLicense: (id: string): Promise<ApiResponse<void>> => {
    console.log(`准备删除授权，ID: ${id}`);
    
    return new Promise((resolve, reject) => {
      request.delete(`/api/licenses/${id}`)
        .then(response => {
          console.log('删除授权响应:', response);
          resolve(response);
        })
        .catch(error => {
          console.error('删除授权失败:', error);
          console.error('错误详情:', error.response?.data || error.message);
          
          // 返回标准错误响应
          const errorResponse: ApiResponse<void> = {
            success: false,
            message: error.response?.data?.error_message || error.message || '删除授权失败',
            code: error.response?.status || 500
          };
          
          resolve(errorResponse); // 使用resolve返回错误响应，避免中断调用链
        });
    });
  },

  /**
   * 验证授权密钥
   * @param licenseKey 授权密钥
   * @returns 验证结果
   */
  verifyLicenseKey: (licenseKey: string): Promise<ApiResponse<License>> => {
    console.log('验证授权密钥:', licenseKey);
    return request.post('/api/licenses/verify', { licenseKey });
  },

  /**
   * 激活授权
   * @param id 授权ID
   * @returns 激活结果
   */
  activateLicense: (id: string): Promise<ApiResponse<void>> => {
    console.log('激活授权，ID:', id);
    return request.post(`/api/licenses/${id}/activate`);
  },

  /**
   * 暂停授权
   * @param id 授权ID
   * @returns 暂停结果
   */
  suspendLicense: (id: string): Promise<ApiResponse<void>> => {
    console.log('暂停授权，ID:', id);
    return request.post(`/api/licenses/${id}/suspend`);
  },

  /**
   * 获取授权激活记录
   * @param id 授权ID
   * @returns 激活记录
   */
  getLicenseActivations: (id: string): Promise<ApiResponse<LicenseActivation[]>> => {
    console.log('获取授权激活记录，ID:', id);
    return request.get(`/api/licenses/${id}/activations`);
  },

  /**
   * 获取客户列表
   * @returns 客户列表
   */
  getCustomers: (): Promise<ApiResponse<Customer[]>> => {
    console.log('获取客户列表');
    return request.get('/api/customers');
  },

  /**
   * 获取产品列表
   * @returns 产品列表
   */
  getProducts: (): Promise<ApiResponse<Product[]>> => {
    console.log('获取产品列表');
    return request.get('/api/products');
  },

  /**
   * 获取授权统计信息
   * @returns 授权统计信息
   */
  getLicenseStatistics: (): Promise<ApiResponse<LicenseStatistics>> => {
    console.log('获取授权统计信息');
    return request.get('/api/licenses/statistics');
  },

  /**
   * 导出授权列表
   * @param query 查询参数
   * @returns 导出文件URL
   */
  exportLicenses: (query: LicenseQuery): Promise<ApiResponse<{ url: string }>> => {
    console.log('导出授权列表，查询参数:', query);
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
   * @param params 批量生成参数
   * @returns 生成结果
   */
  batchGenerateLicenses: (params: {
    count: number;
    type: string;
    customerId: string;
    productId: string;
    expiresAt: string;
    maxDevices: number;
  }): Promise<ApiResponse<{ count: number, licenses: License[] }>> => {
    console.log('批量生成授权，参数:', params);
    // 确保字段名称与API一致
    const apiParams = {
      count: params.count,
      type: params.type,
      group_id: params.customerId,
      product_id: params.productId,
      ExpiresAt: params.expiresAt,
      max_devices: params.maxDevices
    };
    return request.post('/api/licenses/batch-generate', apiParams);
  },

  /**
   * 生成许可证密钥
   * @returns 生成的密钥
   */
  generateLicenseKey: (): Promise<ApiResponse<{ key: string }>> => {
    console.log('生成许可证密钥');
    // 添加更多随机参数
    const timestamp = new Date().getTime();
    const random = Math.floor(Math.random() * 1000000);
    const uuid = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    return request.get(`/api/licenses/generate-key?t=${timestamp}&r=${random}&u=${uuid}`);
  },

  /**
   * 重置授权过滤条件
   * @returns 重置结果
   */
  resetLicenseFilters: (): Promise<ApiResponse<void>> => {
    console.log('重置授权过滤条件');
    return request.post('/api/licenses/reset-filters');
  },
};

// 日期格式化辅助函数 - 确保YYYY-MM-DD格式
export const formatToAPIDate = (date: Date | string): string => {
  if (!date) return '';
  
  let dateObj: Date;
  if (typeof date === 'string') {
    dateObj = new Date(date);
  } else {
    dateObj = date;
  }
  
  const year = dateObj.getFullYear();
  // 月份从0开始，需要+1，并确保是两位数
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};
