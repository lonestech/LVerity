package middleware

import (
	"github.com/gin-gonic/gin"
)

// DevMode 开发模式中间件，跳过身份验证
func DevMode() gin.HandlerFunc {
	return func(c *gin.Context) {
		// 设置模拟用户信息
		c.Set("userID", "dev-user-id")
		c.Set("username", "developer")
		c.Set("roleID", "admin")
		c.Next()
	}
}
