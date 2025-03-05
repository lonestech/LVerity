import { http, HttpResponse } from 'msw';

// 定义活动类型接口
export interface Activity {
  id: string;
  type: string;
  action: string;
  targetId?: string;
  targetName?: string;
  userId?: string;
  username?: string;
  timestamp: string;
  details?: string;
}

// 模拟活动数据
export const mockActivities: Activity[] = [
  {
    id: '1',
    type: 'license',
    action: 'create',
    targetId: 'lic-123',
    targetName: '授权密钥-XX企业',
    userId: 'user1',
    username: '管理员',
    timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
    details: '创建了新的授权密钥'
  },
  {
    id: '2',
    type: 'device',
    action: 'update',
    targetId: 'dev-456',
    targetName: '服务器设备-01',
    userId: 'user1',
    username: '管理员',
    timestamp: new Date(Date.now() - 10 * 60000).toISOString(),
    details: '更新了设备信息'
  },
  {
    id: '3',
    type: 'user',
    action: 'login',
    userId: 'user2',
    username: '操作员',
    timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
    details: '用户登录系统'
  },
  {
    id: '4',
    type: 'system',
    action: 'backup',
    targetId: 'backup-789',
    targetName: '系统备份-20250304',
    userId: 'user1',
    username: '管理员',
    timestamp: new Date(Date.now() - 30 * 60000).toISOString(),
    details: '创建了系统备份'
  },
  {
    id: '5',
    type: 'license',
    action: 'activate',
    targetId: 'lic-234',
    targetName: '授权密钥-YY企业',
    userId: 'user3',
    username: '销售',
    timestamp: new Date(Date.now() - 45 * 60000).toISOString(),
    details: '激活了授权密钥'
  },
  {
    id: '6',
    type: 'device',
    action: 'offline',
    targetId: 'dev-567',
    targetName: '客户端设备-02',
    timestamp: new Date(Date.now() - 60 * 60000).toISOString(),
    details: '设备离线'
  },
  {
    id: '7',
    type: 'user',
    action: 'create',
    targetId: 'user4',
    targetName: '新用户',
    userId: 'user1',
    username: '管理员',
    timestamp: new Date(Date.now() - 120 * 60000).toISOString(),
    details: '创建了新用户'
  },
  {
    id: '8',
    type: 'system',
    action: 'config',
    userId: 'user1',
    username: '管理员',
    timestamp: new Date(Date.now() - 180 * 60000).toISOString(),
    details: '修改了系统配置'
  },
  {
    id: '9',
    type: 'license',
    action: 'expire',
    targetId: 'lic-345',
    targetName: '授权密钥-ZZ企业',
    timestamp: new Date(Date.now() - 240 * 60000).toISOString(),
    details: '授权密钥过期'
  },
  {
    id: '10',
    type: 'device',
    action: 'online',
    targetId: 'dev-678',
    targetName: '客户端设备-03',
    timestamp: new Date(Date.now() - 300 * 60000).toISOString(),
    details: '设备上线'
  }
];

// 模拟用户数据
export const mockUsers = [
  {
    id: 'u-001',
    username: 'admin',
    email: 'admin@example.com',
    role: 'administrator',
    status: 'active',
    lastLogin: new Date(Date.now() - 30 * 60000).toISOString(),
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60000).toISOString(),
  },
  {
    id: 'u-002',
    username: 'operator',
    email: 'operator@example.com',
    role: 'operator',
    status: 'active',
    lastLogin: new Date(Date.now() - 120 * 60000).toISOString(),
    createdAt: new Date(Date.now() - 25 * 24 * 60 * 60000).toISOString(),
  },
  {
    id: 'u-003',
    username: 'viewer',
    email: 'viewer@example.com',
    role: 'viewer',
    status: 'inactive',
    lastLogin: new Date(Date.now() - 10 * 24 * 60 * 60000).toISOString(),
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60000).toISOString(),
  }
];

// 模拟角色数据
export const mockRoles = [
  {
    id: 'r-001',
    name: 'administrator',
    description: '系统管理员',
    permissions: ['read', 'write', 'execute', 'admin'],
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60000).toISOString(),
  },
  {
    id: 'r-002',
    name: 'operator',
    description: '操作员',
    permissions: ['read', 'write', 'execute'],
    createdAt: new Date(Date.now() - 50 * 24 * 60 * 60000).toISOString(),
  },
  {
    id: 'r-003',
    name: 'viewer',
    description: '只读用户',
    permissions: ['read'],
    createdAt: new Date(Date.now() - 40 * 24 * 60 * 60000).toISOString(),
  }
];

// 模拟备份数据
export const mockBackups = [
  {
    id: 'b-001',
    name: 'backup-2025-03-01.tar.gz',
    size: 12.5, // MB
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60000).toISOString(),
    status: 'completed',
  },
  {
    id: 'b-002',
    name: 'backup-2025-02-20.tar.gz',
    size: 11.8,
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60000).toISOString(),
    status: 'completed',
  },
  {
    id: 'b-003',
    name: 'backup-2025-02-10.tar.gz',
    size: 10.4,
    createdAt: new Date(Date.now() - 24 * 24 * 60 * 60000).toISOString(),
    status: 'completed',
  }
];

// 模拟系统配置
export const mockSystemConfig = {
  general: {
    systemName: 'LVerity 安全系统',
    version: 'v1.0.0',
    timezone: 'Asia/Shanghai',
    language: 'zh-CN',
  },
  security: {
    passwordPolicy: {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: true,
      expiryDays: 90,
    },
    sessionTimeout: 30, // 分钟
    failedLoginAttempts: 5,
    lockoutDuration: 15, // 分钟
  },
  notification: {
    email: {
      enabled: true,
      smtpServer: 'smtp.example.com',
      smtpPort: 587,
      senderEmail: 'notifications@example.com',
    },
    sms: {
      enabled: false,
    },
  },
  maintenance: {
    autoBackup: {
      enabled: true,
      frequency: 'daily',
      retentionDays: 30,
    },
    logRetention: 90, // 天
  }
};

// 模拟系统状态数据
export const mockSystemStatus = {
  cpu: {
    usage: 35,
    cores: 4,
  },
  memory: {
    total: 8 * 1024 * 1024 * 1024,
    used: 4.2 * 1024 * 1024 * 1024,
    free: 3.8 * 1024 * 1024 * 1024,
    usage: 52,
  },
  disk: {
    total: 500 * 1024 * 1024 * 1024,
    used: 350 * 1024 * 1024 * 1024,
    free: 150 * 1024 * 1024 * 1024,
    usage: 70,
  },
  uptime: 25 * 24 * 3600 + 12 * 3600 + 30 * 60, // 25天12小时30分钟
  services: [
    { name: '授权服务', status: 'running', description: '处理授权验证和管理' },
    { name: '设备监控', status: 'running', description: '监控连接设备状态' },
    { name: '数据同步', status: 'running', description: '同步系统数据' },
    { name: '邮件通知', status: 'warning', description: '发送邮件通知' },
    { name: '备份服务', status: 'stopped', description: '系统数据自动备份' },
  ],
  version: {
    current: 'v1.2.3',
    latest: 'v1.3.0',
    updateAvailable: true,
  },
  database: {
    connections: 24,
    size: 456 * 1024 * 1024,
    queries: 1258,
    uptime: 30 * 24 * 3600, // 30天
  },
};

// 模拟客户数据
export const mockCustomers = [
  {
    id: 'c-001',
    name: '北京科技有限公司',
    contact: '张先生',
    phone: '13800138001',
    email: 'contact@bjtechnology.com',
    address: '北京市海淀区中关村大道1号',
    industry: '科技',
    createdAt: new Date(Date.now() - 180 * 24 * 60 * 60000).toISOString(),
    status: 'active',
  },
  {
    id: 'c-002',
    name: '上海互联网科技有限公司',
    contact: '李女士',
    phone: '13900139002',
    email: 'service@shinternet.com',
    address: '上海市浦东新区张江高科技园区',
    industry: '互联网',
    createdAt: new Date(Date.now() - 150 * 24 * 60 * 60000).toISOString(),
    status: 'active',
  },
  {
    id: 'c-003',
    name: '广州数据科技有限公司',
    contact: '王总',
    phone: '13700137003',
    email: 'info@gzdata.com',
    address: '广州市天河区珠江新城',
    industry: '数据服务',
    createdAt: new Date(Date.now() - 120 * 24 * 60 * 60000).toISOString(),
    status: 'inactive',
  },
  {
    id: 'c-004',
    name: '深圳电子科技股份有限公司',
    contact: '赵工',
    phone: '13600136004',
    email: 'zhao@szelectronics.com',
    address: '深圳市南山区高新科技园',
    industry: '电子制造',
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60000).toISOString(),
    status: 'active',
  },
  {
    id: 'c-005',
    name: '杭州软件技术有限公司',
    contact: '陈经理',
    phone: '13500135005',
    email: 'contact@hzsoftware.com',
    address: '杭州市西湖区文三路',
    industry: '软件开发',
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60000).toISOString(),
    status: 'active',
  }
];

// 模拟产品数据
export const mockProducts = [
  {
    id: 'p-001',
    name: 'LVerity 基础版',
    code: 'LV-BASIC',
    type: 'software',
    price: 1999.00,
    description: '基础安全管理功能，适合小型组织',
    features: ['用户管理', '设备管理', '基础日志', '系统监控'],
    createdAt: new Date(Date.now() - 200 * 24 * 60 * 60000).toISOString(),
    status: 'active',
  },
  {
    id: 'p-002',
    name: 'LVerity 专业版',
    code: 'LV-PRO',
    type: 'software',
    price: 4999.00,
    description: '高级安全管理功能，适合中型企业',
    features: ['用户管理', '设备管理', '高级日志', '系统监控', '安全审计', '自动备份'],
    createdAt: new Date(Date.now() - 180 * 24 * 60 * 60000).toISOString(),
    status: 'active',
  },
  {
    id: 'p-003',
    name: 'LVerity 企业版',
    code: 'LV-ENT',
    type: 'software',
    price: 9999.00,
    description: '全功能安全管理平台，适合大型企业',
    features: ['用户管理', '设备管理', '高级日志', '系统监控', '安全审计', '自动备份', '集群部署', '数据分析', '安全报告'],
    createdAt: new Date(Date.now() - 150 * 24 * 60 * 60000).toISOString(),
    status: 'active',
  },
  {
    id: 'p-004',
    name: 'LVerity 安全硬件设备 S1',
    code: 'LV-HW-S1',
    type: 'hardware',
    price: 15999.00,
    description: '专用安全防护硬件设备，适合关键基础设施',
    features: ['物理安全', '网络防护', '入侵检测', '实时监控', '自动响应'],
    createdAt: new Date(Date.now() - 100 * 24 * 60 * 60000).toISOString(),
    status: 'active',
  },
  {
    id: 'p-005',
    name: 'LVerity 安全服务包',
    code: 'LV-SERVICE',
    type: 'service',
    price: 29999.00,
    description: '年度安全服务包，包含安全评估、培训和应急响应',
    features: ['安全评估', '安全培训', '漏洞扫描', '应急响应', '安全咨询'],
    createdAt: new Date(Date.now() - 70 * 24 * 60 * 60000).toISOString(),
    status: 'inactive',
  }
];

// 处理活动数据API
export const getActivitiesHandler = http.get(
  '/api/stats/activities', 
  ({ request }) => {
    // 获取查询参数
    const url = new URL(request.url);
    const limit = url.searchParams.get('limit') 
      ? parseInt(url.searchParams.get('limit') as string, 10) 
      : 10;

    return HttpResponse.json({
      success: true,
      code: 200,
      message: 'success',
      data: mockActivities.slice(0, limit)
    });
  }
);

// 处理用户数据API
export const getUsersHandler = http.get(
  '/api/users', 
  ({ request }) => {
    const url = new URL(request.url);
    const page = url.searchParams.get('page') 
      ? parseInt(url.searchParams.get('page') as string, 10) 
      : 1;
    const pageSize = url.searchParams.get('pageSize') 
      ? parseInt(url.searchParams.get('pageSize') as string, 10) 
      : 10;
    
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const paginatedUsers = mockUsers.slice(start, end);
    
    return HttpResponse.json({
      success: true,
      code: 200,
      message: 'success',
      data: {
        list: paginatedUsers,
        total: mockUsers.length,
        page,
        pageSize
      }
    });
  }
);

// 处理角色数据API
export const getRolesHandler = http.get(
  '/api/roles',
  () => {
    return HttpResponse.json({
      success: true,
      code: 200,
      message: 'success',
      data: mockRoles
    });
  }
);

// 处理备份数据API
export const getBackupsHandler = http.get(
  '/api/system/backups',
  () => {
    return HttpResponse.json({
      success: true,
      code: 200,
      message: 'success',
      data: mockBackups
    });
  }
);

// 处理系统配置API
export const getSystemConfigHandler = http.get(
  '/api/system/config',
  () => {
    return HttpResponse.json({
      success: true,
      code: 200,
      message: 'success',
      data: mockSystemConfig
    });
  }
);

// 处理系统状态API
export const getSystemStatusHandler = http.get(
  '/api/system/status',
  () => {
    return HttpResponse.json({
      success: true,
      code: 200,
      message: 'success',
      data: mockSystemStatus
    });
  }
);

// 处理概览数据API
export const getOverviewHandler = http.get(
  '/api/stats/overview',
  () => {
    return HttpResponse.json({
      success: true,
      code: 200,
      message: 'success',
      data: {
        licenses: {
          total: 15,
          active: 12,
          expired: 3
        },
        devices: {
          total: 25,
          online: 18,
          offline: 7
        },
        users: {
          total: mockUsers.length,
          active: mockUsers.filter(u => u.status === 'active').length,
          inactive: mockUsers.filter(u => u.status === 'inactive').length
        },
        systemStatus: {
          cpuUsage: 32,
          memoryUsage: 45,
          diskUsage: 38,
          uptime: 15 * 24 * 60 * 60 // 15天的秒数
        }
      }
    });
  }
);

// 处理获取客户列表API
export const getCustomersHandler = http.get(
  '/api/customers', 
  ({ request }) => {
    // 获取查询参数
    const url = new URL(request.url);
    const page = url.searchParams.get('page') 
      ? parseInt(url.searchParams.get('page') as string, 10) 
      : 1;
    const pageSize = url.searchParams.get('pageSize') 
      ? parseInt(url.searchParams.get('pageSize') as string, 10) 
      : 10;
    
    // 使用分页参数
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    
    // 根据分页参数截取数据
    const paginatedCustomers = mockCustomers.slice(start, end);
    
    return HttpResponse.json({
      success: true,
      code: 200,
      message: 'success',
      data: {
        list: paginatedCustomers,
        total: mockCustomers.length,
        page,
        pageSize
      }
    });
  }
);

// 处理获取客户详情API
export const getCustomerByIdHandler = http.get(
  '/api/customers/:id', 
  ({ params }) => {
    const id = params.id as string;
    const customer = mockCustomers.find(c => c.id === id);
    
    if (!customer) {
      return HttpResponse.json(
        {
          success: false,
          code: 404,
          message: '客户不存在',
          data: null
        },
        { status: 404 }
      );
    }
    
    return HttpResponse.json({
      success: true,
      code: 200,
      message: 'success',
      data: customer
    });
  }
);

// 处理产品列表API
export const getProductsHandler = http.get(
  '/api/products', 
  ({ request }) => {
    // 获取查询参数
    const url = new URL(request.url);
    const page = url.searchParams.get('page') 
      ? parseInt(url.searchParams.get('page') as string, 10) 
      : 1;
    const pageSize = url.searchParams.get('pageSize') 
      ? parseInt(url.searchParams.get('pageSize') as string, 10) 
      : 10;
    
    // 使用分页参数
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    
    // 根据分页参数截取数据
    const paginatedProducts = mockProducts.slice(start, end);
    
    return HttpResponse.json({
      success: true,
      code: 200,
      message: 'success',
      data: {
        list: paginatedProducts,
        total: mockProducts.length,
        page,
        pageSize
      }
    });
  }
);

// 处理获取产品详情API
export const getProductByIdHandler = http.get(
  '/api/products/:id', 
  ({ params }) => {
    const id = params.id as string;
    const product = mockProducts.find(p => p.id === id);
    
    if (!product) {
      return HttpResponse.json(
        {
          success: false,
          code: 404,
          message: '产品不存在',
          data: null
        },
        { status: 404 }
      );
    }
    
    return HttpResponse.json({
      success: true,
      code: 200,
      message: 'success',
      data: product
    });
  }
);

// 系统API处理程序
export const apiHandlers = [
  getActivitiesHandler,
  getUsersHandler,
  getRolesHandler,
  getBackupsHandler,
  getSystemConfigHandler,
  getSystemStatusHandler,
  getOverviewHandler,
  getCustomersHandler,
  getCustomerByIdHandler,
  getProductsHandler,
  getProductByIdHandler,
  // 确保所有API路径格式一致，防止路径匹配问题
  http.get('/api/system/status/', () => {
    return HttpResponse.json({
      success: true,
      code: 200,
      message: 'success',
      data: mockSystemStatus
    });
  }),
  // 处理带尾部斜杠的API路径
  http.get('/api/customers/', ({ request }) => {
    const url = new URL(request.url);
    const page = url.searchParams.get('page') ? parseInt(url.searchParams.get('page') as string, 10) : 1;
    const pageSize = url.searchParams.get('pageSize') ? parseInt(url.searchParams.get('pageSize') as string, 10) : 10;
    
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const paginatedCustomers = mockCustomers.slice(start, end);
    
    return HttpResponse.json({
      success: true,
      code: 200,
      message: 'success',
      data: {
        list: paginatedCustomers,
        total: mockCustomers.length,
        page,
        pageSize
      }
    });
  }),
  http.get('/api/products/', ({ request }) => {
    const url = new URL(request.url);
    const page = url.searchParams.get('page') ? parseInt(url.searchParams.get('page') as string, 10) : 1;
    const pageSize = url.searchParams.get('pageSize') ? parseInt(url.searchParams.get('pageSize') as string, 10) : 10;
    
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const paginatedProducts = mockProducts.slice(start, end);
    
    return HttpResponse.json({
      success: true,
      code: 200,
      message: 'success',
      data: {
        list: paginatedProducts,
        total: mockProducts.length,
        page,
        pageSize
      }
    });
  })
  // 更多API处理程序可以在这里添加
];
