package handler

import (
	"github.com/gin-gonic/gin"
	"net/http"
)

// HealthCheck 健康检查处理器
func HealthCheck(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"status": "ok",
		"message": "service is healthy",
	})
}
