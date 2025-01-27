package router

import (
	"LVerity/pkg/handler"
	"LVerity/pkg/middleware"
	"github.com/gin-gonic/gin"
)

// SetupRouter 设置路由
func SetupRouter() *gin.Engine {
	r := gin.Default()

	// 使用中间件
	r.Use(middleware.CORS())
	r.Use(middleware.Logger())

	// 健康检查
	r.GET("/health", handler.HealthCheck)

	// 公开路由组
	public := r.Group("/auth")
	{
		public.POST("/login", handler.Login)
		public.POST("/refresh", middleware.JWTAuth(), handler.RefreshToken)
	}

	// 用户相关路由组
	user := r.Group("/user")
	user.Use(middleware.JWTAuth())
	{
		user.GET("/profile", handler.GetUserProfile)
		user.POST("/profile", handler.UpdateUserProfile)
		user.POST("/change-password", handler.ChangePassword)
	}

	// 需要认证的API路由组
	api := r.Group("/api")
	api.Use(middleware.JWTAuth())
	{
		// 设备管理
		api.GET("/devices", handler.ListDevices)
		api.POST("/devices", handler.CreateDevice)
		api.GET("/devices/:id", handler.GetDevice)
		api.PUT("/devices/:id", handler.UpdateDevice)
		api.DELETE("/devices/:id", handler.DeleteDevice)
		api.GET("/devices/stats", handler.GetDeviceStats)

		// 授权管理
		api.GET("/licenses", handler.ListLicenses)
		api.POST("/licenses", handler.CreateLicense)
		api.GET("/licenses/:id", handler.GetLicense)
		api.PUT("/licenses/:id", handler.UpdateLicense)
		api.DELETE("/licenses/:id", handler.DeleteLicense)
		api.GET("/licenses/stats", handler.GetLicenseStats)

		// 用户管理
		api.GET("/users", handler.ListUsers)
		api.POST("/users", handler.CreateUser)
		api.GET("/users/:id", handler.GetUser)
		api.PUT("/users/:id", handler.UpdateUser)
		api.DELETE("/users/:id", handler.DeleteUser)
		api.GET("/users/stats", handler.GetUserStats)

		// 日志管理
		api.GET("/logs", handler.ListLogs)
		api.GET("/logs/stats", handler.GetLogStats)

		// 设备管理路由
		devices := api.Group("/devices")
		{
			// 基本设备管理
			devices.GET("", handler.GetDeviceList)                  // 获取设备列表
			devices.POST("", handler.CreateDevice)                  // 创建设备
			devices.GET("/:id", handler.GetDevice)                  // 获取设备详情
			devices.PUT("/:id", handler.UpdateDevice)               // 更新设备
			devices.DELETE("/:id", handler.DeleteDevice)            // 删除设备
			devices.GET("/:id/status", handler.GetDeviceStatus)     // 获取设备状态
			devices.POST("/:id/block", handler.BlockDevice)         // 封禁设备
			devices.POST("/:id/unblock", handler.UnblockDevice)     // 解封设备
			devices.POST("/:id/heartbeat", handler.UpdateDeviceHeartbeat) // 更新心跳
			
			// 设备分组管理
			devices.GET("/groups", handler.GetDeviceGroups)         // 获取分组列表
			devices.POST("/groups", handler.CreateDeviceGroup)      // 创建分组
			devices.PUT("/groups/:id", handler.UpdateDeviceGroup)   // 更新分组
			devices.DELETE("/groups/:id", handler.DeleteDeviceGroup) // 删除分组
			devices.POST("/groups/assign", handler.AssignDeviceToGroup) // 分配设备到分组

			// 黑名单管理
			devices.GET("/blacklist-rules", handler.GetBlacklistRules)    // 获取规则列表
			devices.POST("/blacklist-rules", handler.CreateBlacklistRule) // 创建规则
			devices.PUT("/blacklist-rules/:id", handler.UpdateBlacklistRule) // 更新规则
			devices.DELETE("/blacklist-rules/:id", handler.DeleteBlacklistRule) // 删除规则

			// 异常行为记录
			devices.GET("/:id/abnormal-behaviors", handler.GetDeviceAbnormalBehaviors) // 获取异常行为
			devices.POST("/abnormal-behaviors", handler.RecordAbnormalBehavior)        // 记录异常行为

			// 设备统计
			devices.GET("/stats", handler.GetDeviceStats)           // 获取设备统计
			devices.GET("/:id/usage-stats", handler.GetDeviceUsageStats) // 获取使用统计

			// 设备位置
			devices.GET("/:id/location", handler.GetDeviceLocation) // 获取位置信息
			devices.PUT("/:id/location", handler.UpdateDeviceLocation) // 更新位置信息
		}

		// 授权码管理
		license := api.Group("/license")
		{
			// 单个授权码操作
			license.POST("/generate", handler.GenerateLicense)
			license.POST("/activate", handler.ActivateLicense)
			license.GET("/info/:code", handler.GetLicenseInfo)
			license.POST("/disable/:code", handler.DisableLicense)

			// 批量授权码操作
			license.POST("/batch/generate", handler.BatchGenerateLicense)
			license.POST("/batch/disable", handler.BatchDisableLicense)
			license.POST("/batch/info", handler.BatchGetLicenseInfo)
			
			// 导入导出
			license.POST("/export", handler.ExportLicenses)
			license.POST("/import", handler.ImportLicenses)

			// 授权组管理
			license.POST("/group", handler.CreateLicenseGroup)
			license.POST("/group/assign", handler.AssignLicenseToGroup)

			// 标签管理
			license.POST("/tag", handler.CreateLicenseTag)
			license.POST("/tag/assign", handler.AddTagsToLicense)

			// 元数据和功能管理
			license.PUT("/:id/metadata", handler.UpdateLicenseMetadata)
			license.PUT("/:id/features", handler.UpdateLicenseFeatures)
		}

		// 日志管理
		log := api.Group("/log")
		{
			log.GET("/operation", handler.GetOperationLogs)
			log.GET("/system", handler.GetSystemLogs)
		}

		// 统计信息
		stats := api.Group("/stats")
		{
			stats.GET("/license", handler.GetLicenseStats)
			stats.GET("/device", handler.GetDeviceStats)
			stats.GET("/user", handler.GetUserStats)
		}

		// 告警管理
		alerts := api.Group("/alerts")
		{
			alerts.POST("", handler.CreateAlert)
			alerts.GET("", handler.GetAlertsByStatus)
			alerts.GET("/:id", handler.GetAlert)
			alerts.PUT("/:id/status", handler.UpdateAlertStatus)
			alerts.GET("/timerange", handler.GetAlertsByTimeRange)
			alerts.GET("/count", handler.GetAlertCount)
		}

		// 地理位置管理
		locations := api.Group("/locations")
		{
			locations.GET("/nearby", handler.GetNearbyDevices)
		}
	}

	return r
}
