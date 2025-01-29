package middleware

import (
	"github.com/gin-gonic/gin"
	"time"
	"log"
)

// Logger 中间件，用于记录请求日志
func Logger() gin.HandlerFunc {
	return func(c *gin.Context) {
		// 开始时间
		start := time.Now()

		// 处理请求
		c.Next()

		// 结束时间
		end := time.Now()
		// 执行时间
		latency := end.Sub(start)

		// 请求方法
		method := c.Request.Method
		// 请求路由
		uri := c.Request.RequestURI
		// 状态码
		status := c.Writer.Status()
		// 请求IP
		clientIP := c.ClientIP()

		// 日志格式
		log.Printf("[GIN] %v | %3d | %13v | %15s | %s | %s",
			end.Format("2006/01/02 - 15:04:05"),
			status,
			latency,
			clientIP,
			method,
			uri,
		)
	}
}
