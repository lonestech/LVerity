// 通用模型定义

// API响应数据接口
export interface ApiResponse<T = any> {
  success: boolean;
  code?: number;
  message?: string;
  data: T;
}

// 分页响应数据接口
export interface PaginatedResponse<T = any> {
  success: boolean;
  code?: number;
  message?: string;
  data: {
    total: number;
    items: T[];
    page?: number;
    pageSize?: number;
  };
}

// 分页查询参数
export interface PaginationQuery {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: string;
}

// 通用查询参数
export interface BaseQuery extends PaginationQuery {
  keyword?: string;
}

// 通用ID查询参数
export interface IdQuery {
  id: string;
}

// 基础实体接口
export interface BaseEntity {
  id: string;
  createdAt?: string;
  updatedAt?: string;
}

// 通用选项值接口
export interface OptionItem {
  value: string | number;
  label: string;
  disabled?: boolean;
  children?: OptionItem[];
}

// 通用状态枚举
export enum Status {
  Active = 'active',
  Inactive = 'inactive',
  Pending = 'pending',
  Expired = 'expired',
  Deleted = 'deleted'
}
