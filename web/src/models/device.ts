export interface Device {
  id: number;
  name: string;
  serialNumber: string;
  type: string;
  status: 'online' | 'offline' | 'maintenance';
  lastOnlineTime: string;
  location?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DeviceCreateRequest {
  name: string;
  serialNumber: string;
  type: string;
  location?: string;
  description?: string;
}

export interface DeviceUpdateRequest {
  name?: string;
  status?: 'online' | 'offline' | 'maintenance';
  location?: string;
  description?: string;
}
