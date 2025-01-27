# 构建阶段
FROM node:18-alpine as builder

# 设置工作目录
WORKDIR /app

# 安装pnpm
RUN npm install -g pnpm

# 复制前端项目文件
COPY package.json pnpm-lock.yaml ./

# 安装依赖
RUN pnpm install

# 复制源代码
COPY . .

# 构建应用
RUN pnpm build

# 运行阶段
FROM caddy:2-alpine

# 复制构建产物到 Caddy 目录
COPY --from=builder /app/dist /srv
COPY --from=builder /app/dist/index.html /srv/index.html

# 暴露端口
EXPOSE 80

# 启动 Caddy
CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile", "--adapter", "caddyfile"]
