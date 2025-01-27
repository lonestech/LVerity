// main.go
package main

import (
	"fmt"
	"log"
	"net/http"
	"LVerity/pkg/config"
	"LVerity/pkg/database"
	"LVerity/pkg/handler"
	"LVerity/pkg/middleware"
	"LVerity/pkg/service"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	// 加载配置
	if err := config.LoadConfig(); err != nil {
		log.Fatalf("Failed to load config: %v", err)
	}

	// 初始化数据库
	if err := database.InitDB(); err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}

	// 初始化默认权限
	if err := service.InitDefaultPermissions(); err != nil {
		log.Printf("Warning: Failed to initialize default permissions: %v", err)
	}

	// 创建路由
	r := gin.Default()

	// CORS 配置
	corsConfig := cors.DefaultConfig()
	corsConfig.AllowOrigins = []string{"*"}  
	corsConfig.AllowMethods = []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"}
	corsConfig.AllowHeaders = []string{"Origin", "Content-Type", "Authorization"}
	corsConfig.AllowCredentials = true
	r.Use(cors.New(corsConfig))

	// 健康检查路由
	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status": "ok",
			"message": "Service is healthy",
		})
	})

	// 无需认证的路由
	r.POST("/api/auth/login", handler.Login)

	// 需要认证的路由组
	api := r.Group("/api")
	api.Use(middleware.JWTAuth())

	// 授权码相关路由
	license := api.Group("/license")
	{
		license.POST("/generate", middleware.RequirePermission("license", "create"), handler.GenerateLicense)
		license.POST("/activate", middleware.RequirePermission("license", "update"), handler.ActivateLicense)
		license.GET("/verify", middleware.RequirePermission("license", "read"), handler.VerifyLicense)
		license.PUT("/disable/:code", middleware.RequirePermission("license", "update"), handler.DisableLicense)
		license.GET("/:code", middleware.RequirePermission("license", "read"), handler.GetLicenseInfo)
	}

	// 设备相关路由
	device := api.Group("/device")
	{
		device.POST("/register", middleware.RequirePermission("device", "create"), handler.RegisterDevice)
		device.PUT("/block/:id", middleware.RequirePermission("device", "update"), handler.BlockDevice)
		device.PUT("/heartbeat/:id", middleware.RequirePermission("device", "update"), handler.UpdateDeviceHeartbeat)
		device.GET("/:id", middleware.RequirePermission("device", "read"), handler.GetDeviceInfo)
		device.PUT("/metadata/:id", middleware.RequirePermission("device", "update"), handler.UpdateDeviceMetadata)
	}

	// 统计相关路由
	stats := api.Group("/stats")
	{
		stats.GET("/license", middleware.RequirePermission("stats", "read"), handler.GetLicenseStats)
		stats.GET("/device", middleware.RequirePermission("stats", "read"), handler.GetDeviceStats)
		stats.GET("/license/trend", middleware.RequirePermission("stats", "read"), handler.GetLicenseActivationTrend)
		stats.GET("/device/location", middleware.RequirePermission("stats", "read"), handler.GetDeviceLocationStats)
	}

	// 日志相关路由
	logs := api.Group("/logs")
	{
		logs.GET("/operation", middleware.RequirePermission("logs", "read"), handler.GetOperationLogs)
		logs.GET("/system", middleware.RequirePermission("logs", "read"), handler.GetSystemLogs)
	}

	// 启动服务器
	port := config.GetConfig().Server.Port
	if port == 0 {
		port = 8080
	}
	addr := fmt.Sprintf("%s:%d", config.GetConfig().Server.Host, port)
	log.Printf("Server is running on %s", addr)
	if err := r.Run(addr); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
