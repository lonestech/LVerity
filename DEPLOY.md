# LVerity 部署指南

## 目录
- [系统要求](#系统要求)
- [部署准备](#部署准备)
- [Docker部署](#docker部署)
- [手动部署](#手动部署)
- [配置说明](#配置说明)
- [维护指南](#维护指南)
- [常见问题](#常见问题)
- [前端本地开发部署](#前端本地开发部署)

## 系统要求

### 硬件要求
- CPU: 2核心及以上
- 内存: 4GB及以上
- 硬盘: 20GB及以上可用空间

### 软件要求
- Docker 20.10.x或更高版本
- Docker Compose 2.x或更高版本
- Git（用于代码更新）
- Nginx 1.20或更高版本（手动部署时需要）

## 部署准备

### 1. 环境检查
```bash
# 检查Docker版本
docker --version
docker-compose --version

# 检查系统资源
df -h
free -h
```

### 2. 获取代码
```bash
# 克隆代码仓库
git clone https://github.com/your-org/LVerity.git
cd LVerity

# 切换到稳定版本
git checkout v1.0.0  # 使用最新的稳定版本标签
```

### 3. 配置环境变量
创建`.env`文件：
```bash
# 数据库配置
DB_HOST=db
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_secure_password
DB_NAME=lverity

# JWT配置
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=24h

# 其他配置
GIN_MODE=release
NODE_ENV=production
```

## Docker部署

### 1. 构建和启动
```bash
# 构建并启动所有服务
docker-compose up -d --build

# 检查服务状态
docker-compose ps
```

### 2. 初始化数据库
```bash
# 等待数据库完全启动
sleep 30

# 执行数据库迁移
docker-compose exec backend ./lverity migrate
```

### 3. 验证部署
```bash
# 检查服务日志
docker-compose logs -f

# 检查服务健康状态
curl http://localhost/api/health
```

## 手动部署

### 1. 后端部署
```bash
# 编译后端
go build -o lverity

# 配置系统服务
sudo vim /etc/systemd/system/lverity.service

[Unit]
Description=LVerity Backend Service
After=network.target

[Service]
Type=simple
User=lverity
WorkingDirectory=/opt/lverity
ExecStart=/opt/lverity/lverity
Restart=always
Environment=GIN_MODE=release

[Install]
WantedBy=multi-user.target

# 启动服务
sudo systemctl enable lverity
sudo systemctl start lverity
```

### 2. 前端部署
```bash
# 安装依赖
cd web
pnpm install

# 构建
pnpm build

# 配置Nginx
sudo vim /etc/nginx/conf.d/lverity.conf
# 复制项目中的nginx.conf内容

# 重启Nginx
sudo systemctl restart nginx
```

## 配置说明

### 1. 数据库配置
- 使用MySQL 8.0
- 建议开启慢查询日志
- 配置合适的连接池大小

### 2. Nginx配置
- 启用GZIP压缩
- 配置SSL证书
- 设置适当的缓存策略

### 3. 安全配置
- 使用强密码
- 定期更新密钥
- 限制数据库访问
- 配置防火墙规则

## 维护指南

### 1. 备份策略
```bash
# 备份数据库
docker-compose exec db mysqldump -u root -p lverity > backup.sql

# 备份配置文件
cp .env .env.backup
```

### 2. 更新流程
```bash
# 拉取最新代码
git pull

# 备份当前版本
cp docker-compose.yml docker-compose.yml.backup

# 重新构建和部署
docker-compose up -d --build
```

### 3. 日志管理
```bash
# 查看实时日志
docker-compose logs -f

# 清理旧日志
docker-compose exec backend sh -c "rm -f /var/log/lverity/*.log.*"
```

### 4. 监控
- 使用Prometheus采集指标
- 配置Grafana面板
- 设置告警规则

## 常见问题

### 1. 服务无法启动
- 检查端口占用
- 检查环境变量配置
- 查看错误日志

### 2. 数据库连接失败
- 验证数据库凭据
- 检查网络连接
- 确认数据库服务状态

### 3. 性能问题
- 检查系统资源使用
- 优化数据库查询
- 调整Nginx配置

### 4. 证书问题
- 确认证书有效性
- 检查证书路径
- 验证证书权限

## 前端本地开发部署

### 1. 环境准备
- Node.js 18.x或更高版本
- pnpm 8.x或更高版本

### 2. 安装Node.js
从官网 https://nodejs.org 下载并安装Node.js LTS版本。

### 3. 安装pnpm
```bash
# 使用npm安装pnpm
npm install -g pnpm

# 验证安装
pnpm --version
```

### 4. 安装依赖
```bash
# 进入前端项目目录
cd web

# 安装项目依赖
pnpm install
```

### 5. 配置开发环境
在`web`目录下创建`.env.development`文件：
```env
# API配置
VITE_API_URL=http://localhost:8080
VITE_API_PREFIX=/api

# 其他配置
VITE_APP_TITLE=LVerity授权管理系统
```

### 6. 启动开发服务器
```bash
# 启动开发服务器
pnpm dev

# 或者指定端口启动
pnpm dev --port 3000
```
开发服务器将在 http://localhost:5173 启动（或者你指定的端口）

### 7. 本地构建和预览
```bash
# 构建生产版本
pnpm build

# 预览构建结果
pnpm preview
```
预览服务器将在 http://localhost:4173 启动

### 8. 开发注意事项
1. **代理配置**
   在`web/config/proxy.ts`中已配置API代理：
   ```typescript
   dev: {
     '/api': {
       target: 'http://localhost:8080',
       changeOrigin: true,
       rewrite: (path) => path.replace(/^\/api/, ''),
     },
   }
   ```

2. **环境变量**
   - `.env.development`: 开发环境配置
   - `.env.production`: 生产环境配置
   - `.env.local`: 本地配置（不提交到git）

3. **调试工具**
   - 使用Chrome DevTools的React开发工具
   - 使用VS Code的调试配置

4. **热更新**
   开发服务器支持：
   - 代码热更新
   - CSS热更新
   - 配置热更新

### 9. 常见问题

1. **端口占用**
```bash
# 查找占用端口的进程
netstat -ano | findstr "5173"

# 终止进程
taskkill /F /PID <进程ID>
```

2. **依赖安装失败**
```bash
# 清除pnpm缓存
pnpm store prune

# 重新安装依赖
pnpm install --force
```

3. **开发服务器启动失败**
```bash
# 检查Node.js版本
node --version

# 清理构建缓存
pnpm clean

# 重新安装依赖并启动
pnpm install && pnpm dev
```

4. **API请求失败**
- 确保后端服务已启动
- 检查代理配置
- 验证API地址是否正确

### 10. 开发命令
```bash
# 启动开发服务器
pnpm dev

# 构建生产版本
pnpm build

# 预览构建结果
pnpm preview

# 代码格式化
pnpm format

# 代码检查
pnpm lint

# 运行测试
pnpm test

# 清理构建缓存
pnpm clean
```

## 联系支持
如遇到无法解决的问题，请联系技术支持：
- Email: support@lverity.com
- 工单系统: https://support.lverity.com
