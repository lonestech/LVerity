# 构建阶段
FROM golang:1.23.4-alpine AS builder

# 设置工作目录
WORKDIR /app
# 设置Alpine Linux的镜像源为中国的镜像
#RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.ustc.edu.cn/g' /etc/apk/repositories

# 安装依赖和git（用于直接从源站下载）
RUN apk add --no-cache gcc musl-dev git

# 设置为直接下载，不使用代理
ENV GOPROXY=https://goproxy.cn,direct
ENV GO111MODULE=on

# 复制 go.mod 和 go.sum
COPY go.mod go.sum ./

# 下载依赖
RUN go mod download

# 复制源代码
COPY . .

# 构建应用
RUN CGO_ENABLED=1 GOOS=linux go build -a -installsuffix cgo -o main ./pkg/main.go

# 运行阶段
FROM alpine:latest

# 安装必要的运行时依赖
RUN apk --no-cache add ca-certificates tzdata

# 设置时区
ENV TZ=Asia/Shanghai

WORKDIR /app

# 从构建阶段复制二进制文件
COPY --from=builder /app/main .

# 暴露端口
EXPOSE 8080

# 运行应用
CMD ["./main"]
