export interface License {
  id: number;
  deviceId: number;
  licenseKey: string;
  type: 'trial' | 'standard' | 'enterprise';
  status: 'active' | 'expired' | 'revoked';
  startDate: string;
  endDate: string;
  features: string[];
  createdAt: string;
  updatedAt: string;
}

export interface LicenseCreateRequest {
  deviceId: number;
  type: 'trial' | 'standard' | 'enterprise';
  startDate: string;
  endDate: string;
  features: string[];
}

export interface LicenseUpdateRequest {
  status?: 'active' | 'expired' | 'revoked';
  endDate?: string;
  features?: string[];
}
