# LVerity - 授权管理系统

LVerity 是一个使用 Go 语言开发的强大授权管理系统，专注于授权码生成、验证和设备管理，具有高安全性和可扩展性。

## 主要功能

### 授权管理
- 生成和管理不同类型的授权码（基础版、标准版、专业版、企业版）
- 支持试用版、正式版和按量付费授权
- 授权码激活和验证
- 批量授权码操作
- 授权使用追踪和统计

### 设备管理
- 设备注册和追踪
- 设备状态监控
- 使用统计收集
- 设备-授权关联管理

### 用户管理
- 基于角色的访问控制（RBAC）
- 基于 JWT 的身份认证
- 安全的密码处理
- 用户活动追踪

## 技术栈

- **后端框架**: Go 1.20+
- **Web框架**: Gin
- **数据库**: MySQL
- **认证方式**: JWT
- **ORM框架**: GORM
- **前端框架**: React 18
- **UI组件库**: Ant Design
- **HTTP客户端**: Axios
- **状态管理**: Redux Toolkit
- **构建工具**: Vite

## 环境要求

- Go 1.20 或更高版本
- MySQL 5.7 或更高版本
- Git

## 安装步骤

1. 克隆代码仓库：
```bash
git clone [仓库地址]
cd LVerity
```

2. 配置数据库：
- 创建 MySQL 数据库
- 复制 `config.json.example` 到 `config.json`
- 更新 `config.json` 中的数据库配置：
```json
{
    "database": {
        "host": "localhost",
        "port": 3306,
        "user": "你的用户名",
        "password": "你的密码",
        "dbname": "lverity"
    }
}
```

3. 安装依赖：
```bash
go mod download
```

4. 运行应用：
```bash
go run ./pkg/main.go
```

## API 文档

### 身份认证

#### 登录
```
POST /api/auth/login
Content-Type: application/json

{
    "username": "admin",
    "password": "password"
}
```

### 授权管理

#### 生成授权码
```
POST /api/license/generate
Authorization: Bearer {token}
Content-Type: application/json

{
    "type": "standard",
    "max_devices": 5,
    "expire_days": 365
}
```

#### 验证授权码
```
GET /api/license/verify?code={授权码}
Authorization: Bearer {token}
```

#### 激活授权码
```
POST /api/license/activate
Authorization: Bearer {token}
Content-Type: application/json

{
    "code": "授权码",
    "device_id": "设备ID"
}
```

### 设备管理

#### 注册设备
```
POST /api/device/register
Authorization: Bearer {token}
Content-Type: application/json

{
    "name": "设备名称",
    "fingerprint": "设备指纹",
    "info": {
        "os": "Windows",
        "arch": "x64",
        "cpu": "Intel i7",
        "mac": "00:11:22:33:44:55"
    }
}
```

## 项目结构

```
LVerity/
├── pkg/
│   ├── config/      # 配置管理
│   ├── database/    # 数据库连接和迁移
│   ├── handler/     # HTTP请求处理器
│   ├── middleware/  # HTTP中间件
│   ├── model/       # 数据模型
│   ├── service/     # 业务逻辑
│   └── utils/       # 工具函数
├── web/
│   ├── src/
│   │   ├── api/            # API请求封装
│   │   ├── assets/         # 静态资源
│   │   ├── components/     # React组件
│   │   ├── hooks/          # 自定义钩子
│   │   ├── layouts/        # 页面布局
│   │   ├── pages/          # 页面组件
│   │   ├── store/          # Redux状态管理
│   │   ├── styles/         # 全局样式
│   │   ├── types/          # TypeScript类型定义
│   │   └── utils/          # 工具函数
│   ├── package.json        # 前端依赖配置
│   └── vite.config.ts      # Vite配置文件
├── config.json             # 后端配置文件
└── README.md              # 说明文档
```

## 前端功能

### 用户界面
- 使用 Ant Design 的现代响应式设计
- 支持暗色/亮色主题切换
- 交互式仪表板，包含图表和统计信息
- 使用 React Query 实现实时数据更新

### 授权管理界面
- 分步式授权码创建向导
- 支持表格批量操作的授权码管理
- 实时更新的授权状态监控仪表板
- 支持 Excel 的导出和导入功能
- 高级搜索和筛选功能

### 设备管理界面
- 带表单验证的设备注册
- 实时设备状态监控
- 交互式使用统计图表
- 设备-授权关联管理
- 集成地图的设备位置追踪

### 用户管理界面
- 支持头像上传的用户资料管理
- 动态更新的角色和权限管理
- 带筛选和分页的活动日志
- 安全的密码修改界面

## 前端开发

1. 进入前端目录：
```bash
cd web
```

2. 安装依赖：
```bash
npm install
```

3. 启动开发服务器：
```bash
npm run dev
```

4. 构建生产版本：
```bash
npm run build
```

### 环境配置

创建不同环境的 `.env` 文件：

```env
# .env.development
VITE_API_BASE_URL=http://localhost:8080/api
VITE_APP_TITLE=LVerity (开发版)

# .env.production
VITE_API_BASE_URL=/api
VITE_APP_TITLE=LVerity
```

### 开发规范

1. 组件开发
- 使用函数组件和 Hooks
- 实现完整的 TypeScript 类型
- 遵循 React 性能优化最佳实践
- 使用 React Testing Library 编写单元测试

2. 状态管理
- 使用 Redux Toolkit 管理全局状态
- 使用 Redux Thunk 处理异步操作
- 使用 React Query 管理服务器状态
- 遵循状态范式化最佳实践

3. 样式管理
- 使用 styled-components 编写组件样式
- 遵循 Ant Design 设计规范
- 实现响应式设计
- 支持主题定制

## 安全特性

- 使用 bcrypt 进行密码哈希
- 基于 JWT 的身份认证
- 基于角色的访问控制
- API 端点保护
- 设备指纹识别
- 授权码加密

## 参与贡献

1. Fork 本仓库
2. 创建您的特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交您的更改 (`git commit -m '添加一些很棒的功能'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 开启一个 Pull Request

## 许可证

本项目采用 MIT 许可证 - 查看 LICENSE 文件了解详细信息

## 技术支持

如需支持，请在 GitHub 仓库中开启 Issue 或联系开发团队。

## 常见问题

### 1. 如何重置管理员密码？
可以通过数据库直接修改管理员用户的密码字段，新密码需要使用 bcrypt 进行加密。

### 2. 如何备份数据？
建议定期备份 MySQL 数据库，可以使用以下命令：
```bash
mysqldump -u [用户名] -p lverity > backup.sql
```

### 3. 如何处理授权码过期？
系统会自动检查授权码的过期时间，过期的授权码将无法继续使用。可以通过管理界面手动延长授权码的有效期。

### 4. 如何增加新的授权类型？
1. 在 `model/license.go` 中添加新的授权类型常量
2. 在相关的处理逻辑中添加新类型的支持
3. 更新前端界面以支持新的授权类型

## 更新日志

### v1.0.0 (2025-01-11)
- 初始版本发布
- 实现基本的授权管理功能
- 实现设备管理功能
- 实现用户认证和授权功能
