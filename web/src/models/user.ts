export interface User {
  id: number;
  username: string;
  email: string;
  role: 'admin' | 'user';
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface UserCreateRequest {
  username: string;
  email: string;
  password: string;
  role: 'admin' | 'user';
}

export interface UserUpdateRequest {
  email?: string;
  password?: string;
  role?: 'admin' | 'user';
  status?: 'active' | 'inactive';
}
