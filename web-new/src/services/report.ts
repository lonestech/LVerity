import { request } from '../utils/request';
import { ApiResponse } from '../models/common';
import { 
  ReportQuery, 
  ReportType, 
  ReportDataItem,
  ExportReportParams,
  ExportReportResponse
} from '../models/report';

// 报表服务
export const reportService = {
  /**
   * 获取许可证报表数据
   * @param params 报表查询参数
   * @returns 许可证报表数据
   */
  getLicenseReport: async (params: ReportQuery): Promise<ApiResponse<ReportDataItem[]>> => {
    return request.get('/api/reports/license', { params });
  },

  /**
   * 获取设备报表数据
   * @param params 报表查询参数
   * @returns 设备报表数据
   */
  getDeviceReport: async (params: ReportQuery): Promise<ApiResponse<ReportDataItem[]>> => {
    return request.get('/api/reports/device', { params });
  },

  /**
   * 获取使用量报表数据
   * @param params 报表查询参数
   * @returns 使用量报表数据
   */
  getUsageReport: async (params: ReportQuery): Promise<ApiResponse<ReportDataItem[]>> => {
    return request.get('/api/reports/usage', { params });
  },

  /**
   * 获取报表表格数据
   * @param reportType 报表类型
   * @param params 报表查询参数
   * @returns 报表表格数据
   */
  getReportTable: async (reportType: ReportType, params: ReportQuery): Promise<ApiResponse<any[]>> => {
    return request.get(`/api/reports/${reportType}/table`, { params });
  },

  /**
   * 导出报表
   * @param params 导出报表参数
   * @returns 导出报表响应
   */
  exportReport: async (params: ExportReportParams): Promise<ApiResponse<ExportReportResponse>> => {
    return request.post('/api/reports/export', params);
  },

  /**
   * 获取许可证使用趋势
   * @param params 报表查询参数
   * @returns 许可证使用趋势数据
   */
  getLicenseUsageTrend: async (params: ReportQuery): Promise<ApiResponse<ReportDataItem[]>> => {
    return request.get('/api/reports/license/trend', { params });
  },

  /**
   * 获取设备活跃度趋势
   * @param params 报表查询参数
   * @returns 设备活跃度趋势数据
   */
  getDeviceActivityTrend: async (params: ReportQuery): Promise<ApiResponse<ReportDataItem[]>> => {
    return request.get('/api/reports/device/trend', { params });
  },

  /**
   * 获取客户数据
   * @param params 报表查询参数
   * @returns 客户数据
   */
  getCustomerData: async (params: ReportQuery): Promise<ApiResponse<ReportDataItem[]>> => {
    return request.get('/api/reports/customer', { params });
  },

  /**
   * 获取产品数据
   * @param params 报表查询参数
   * @returns 产品数据
   */
  getProductData: async (params: ReportQuery): Promise<ApiResponse<ReportDataItem[]>> => {
    return request.get('/api/reports/product', { params });
  }
};
