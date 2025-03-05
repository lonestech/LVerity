export interface Device {
  id: string;
  name: string;
  diskID: string;
  bios: string;
  motherboard: string;
  networkCards?: string;
  displayCard?: string;
  resolution?: string;
  timezone?: string;
  language?: string;
  type: string;
  status: 'normal' | 'offline' | 'blocked' | 'suspect' | 'disabled' | 'unknown';
  description?: string;
  groupID?: string;
  blockReason?: string;
  blockTime?: string;
  unblockTime?: string;
  riskLevel?: number;
  lastAlertTime?: string;
  alertCount?: number;
  lastHeartbeat?: string;
  lastSeen?: string;
  metadata?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DeviceCreateRequest {
  name: string;
  diskID: string;
  bios: string;
  motherboard: string;
  type?: string;
  groupID?: string;
  description?: string;
}

export interface DeviceUpdateRequest {
  name?: string;
  status?: 'normal' | 'offline' | 'blocked' | 'suspect' | 'disabled' | 'unknown';
  description?: string;
  groupID?: string;
  metadata?: string;
}

export interface DeviceLocationInfo {
  ip: string;
  country: string;
  region: string;
  city: string;
  latitude: number;
  longitude: number;
}

export interface DeviceStats {
  total: number;
  online: number;
  offline: number;
  blocked: number;
  suspect: number;
  highRisk: number;
  totalCount: number;
  activeCount: number;
  offlineCount: number;
  blockedCount: number;
  onlineRate: number;
}
