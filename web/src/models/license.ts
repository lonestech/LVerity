// 授权相关数据模型

export interface License {
  id: string;
  code: string;  // 后端返回的是code字段，而不是licenseKey
  key?: string;  // 前端使用的字段，与code同义
  status: string;
  type: string;
  device_id?: string;  // 后端字段名
  max_devices: number;  // 后端字段名
  maxDevices?: number;  // 前端字段名，与max_devices同义
  start_time: string;  // 后端字段名
  startDate?: string;  // 前端字段名，与start_time同义
  expire_time: string;  // 后端字段名
  expiryDate?: string;  // 前端字段名，与expire_time同义
  expires_at?: string;  // 后端API期望的字段名
  starts_at?: string;   // 后端API期望的字段名
  ExpiresAt?: string;   // 表单中使用的字段名
  StartsAt?: string;    // 表单中使用的字段名
  created_at: string;  // 后端字段名
  createdAt?: string;  // 前端字段名，与created_at同义
  updated_at: string;  // 后端字段名
  updatedAt?: string;  // 前端字段名，与updated_at同义
  description?: string;
  notes?: string;  // 前端字段名，与description同义
  deleted: boolean;
  created_by?: string;
  createdBy?: string;  // 前端字段名，与created_by同义
  updated_by?: string;
  updatedBy?: string;  // 前端字段名，与updated_by同义
  group_id?: string;  // 客户ID
  customerId?: string;  // 前端字段名，与group_id同义
  customerName?: string;  // 客户端显示用
  productId?: string;  // 前端字段名，产品ID
  productName?: string;  // 客户端显示用
  version?: string;  // 版本信息
  metadata?: string;
  features?: string[];
  usage_limit?: number;  // 最大激活次数
  maxActivations?: number;  // 前端字段名，与usage_limit同义
  usage_count?: number;  // 已激活次数
  activationCount?: number;  // 前端字段名，与usage_count同义
  
  // 前端辅助字段
  sortBy?: string;
  sortOrder?: string;
}

export interface LicenseActivation {
  id: string;
  licenseId: string;
  deviceId: string;
  deviceName?: string;
  activatedAt: string;
  status: string;
  ipAddress?: string;
  location?: string;
  createdAt: string;
}

export interface LicenseQuery {
  keyword?: string;
  customerId?: string;
  status?: string;
  type?: string;
  productId?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: string;
}

export interface Customer {
  id: string;
  name: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  features?: string[];
  createdAt: string;
}

export interface LicenseStatistics {
  total: number;
  active: number;
  expired: number;
  suspended: number;
  byProduct: {
    productId: string;
    productName: string;
    count: number;
  }[];
  byCustomer: {
    customerId: string;
    customerName: string;
    count: number;
  }[];
}
