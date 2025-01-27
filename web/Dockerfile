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
COPY --from=builder /app/dist /usr/share/caddy

# 添加默认的 index.html 处理
RUN echo '<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>LVerity授权管理系统</title><script>window.routerBase = "/";</script></head><body><div id="root"></div></body></html>' > /usr/share/caddy/index.html

# 暴露端口
EXPOSE 80

# 启动 Caddy
CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile", "--adapter", "caddyfile"]
