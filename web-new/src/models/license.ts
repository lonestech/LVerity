// 授权相关数据模型

export interface License {
  id: string;
  licenseKey: string;
  status: string;
  type: string;
  customerId: string;
  customerName?: string;
  productId: string;
  productName?: string;
  features?: string[];
  maxDevices: number;
  activeDevices?: number;
  issuedAt: string;
  activatedAt?: string;
  expiresAt: string;
  notes?: string;
  sortBy?: string;
  sortOrder?: string;
}

export interface LicenseActivation {
  licenseId: string;
  deviceId: string;
  activatedAt: string;
  expiresAt?: string;
  status: string;
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
