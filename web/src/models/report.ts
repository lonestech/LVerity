// 报表类型
export type ReportType = 'license' | 'device' | 'usage' | 'overview';

// 报表时间间隔
export type ReportInterval = 'daily' | 'weekly' | 'monthly';

// 报表查询参数
export interface ReportQuery {
  startDate: string;
  endDate: string;
  interval: ReportInterval;
  productId?: string;
  customerId?: string;
  licenseType?: string;
  deviceType?: string;
}

// 报表数据项
export interface ReportDataItem {
  name: string;
  value: number;
  type: string;
  date?: string;
}

// 报表导出参数
export interface ExportReportParams extends ReportQuery {
  type: ReportType;
}

// 报表导出响应
export interface ExportReportResponse {
  url: string;
  filename: string;
}
