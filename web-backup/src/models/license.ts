export interface License {
  id: string;
  code: string;
  type: 'basic' | 'standard' | 'pro' | 'enterprise' | 'trial' | 'official' | 'pay' | 'module';
  status: 'unused' | 'used' | 'disabled' | 'expired' | 'revoked' | 'transferred' | 'active' | 'inactive';
  deviceID: string;
  maxDevices: number;
  startTime: string;
  expireTime: string;
  createdAt: string;
  updatedAt: string;
  description?: string;
  createdBy?: string;
  updatedBy?: string;
  deletedAt?: string;
  groupID?: string;
  tags?: LicenseTag[];
  metadata?: string;
  features?: string[];
  usageLimit?: number;
  usageCount?: number;
}

export interface LicenseTag {
  id: string;
  name: string;
  color: string;
  createdAt: string;
  updatedAt: string;
}

export interface LicenseCreateRequest {
  code?: string;  // 可由系统自动生成
  type: 'basic' | 'standard' | 'pro' | 'enterprise' | 'trial' | 'official' | 'pay' | 'module';
  deviceID?: string;
  maxDevices: number;
  startTime: string;
  expireTime: string;
  description?: string;
  groupID?: string;
  tags?: string[];  // 标签ID数组
  features?: string[];
  usageLimit?: number;
  metadata?: string;
}

export interface LicenseUpdateRequest {
  type?: 'basic' | 'standard' | 'pro' | 'enterprise' | 'trial' | 'official' | 'pay' | 'module';
  status?: 'unused' | 'used' | 'disabled' | 'expired' | 'revoked' | 'transferred' | 'active' | 'inactive';
  deviceID?: string;
  maxDevices?: number;
  expireTime?: string;
  description?: string;
  groupID?: string;
  tags?: string[];
  features?: string[];
  usageLimit?: number;
  metadata?: string;
}

export interface LicenseStats {
  totalCount: number;
  usedCount: number;
  unusedCount: number;
  expiredCount: number;
  typeStats: Record<string, number>;
}
