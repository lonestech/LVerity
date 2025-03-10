package router

import (
	"LVerity/pkg/handler"
	"LVerity/pkg/middleware"
	"github.com/gin-gonic/gin"
	"net/http"
	"os"
	"strings"
)

// 检查是否处于开发模式
var devMode = os.Getenv("ENV") == "development" || os.Getenv("ENV") == ""

// SetupRouter 设置路由
func SetupRouter() *gin.Engine {
	r := gin.Default()

	// 使用中间件
	r.Use(middleware.CORS())
	r.Use(middleware.Logger())

	// 静态文件服务
	r.Static("/assets", "./web/dist/assets")
	r.StaticFile("/", "./web/dist/index.html")
	r.StaticFile("/favicon.ico", "./web/dist/favicon.ico")

	// 处理前端路由
	r.NoRoute(func(c *gin.Context) {
		// 对于API路径，返回404
		if strings.HasPrefix(c.Request.URL.Path, "/api/") {
			c.JSON(http.StatusNotFound, gin.H{"error": "API not found"})
			return
		}
		// 其他路径视为前端路由，返回index.html
		c.File("./web/dist/index.html")
	})

	// 健康检查
	r.GET("/health", handler.HealthCheck)

	// 公开路由组
	public := r.Group("/auth")
	{
		public.POST("/login", handler.Login)            // 用户登录
		
		// 根据开发模式决定是否需要认证
		if devMode {
			public.POST("/refresh", handler.RefreshToken)  // 刷新令牌
		} else {
			public.POST("/refresh", middleware.JWTAuth(), handler.RefreshToken)  // 刷新令牌
		}
	}

	// 根据环境决定使用哪个中间件
	var authMiddleware gin.HandlerFunc
	if devMode {
		authMiddleware = middleware.DevMode()
		// 开发模式下提供一个临时的自动登录API
		r.GET("/dev-login", func(c *gin.Context) {
			c.JSON(http.StatusOK, gin.H{
				"success": true,
				"message": "开发模式自动登录成功",
				"data": gin.H{
					"token": "dev-token",
					"user": gin.H{
						"id": "dev-user-id",
						"username": "developer",
						"role": "admin",
					},
				},
			})
		})
	} else {
		authMiddleware = middleware.JWTAuth()
	}

	// 需要认证的API路由组
	api := r.Group("/api")
	api.Use(authMiddleware)
	{
		// 用户管理
		api.GET("/users", handler.ListUsers)
		api.GET("/user/profile", handler.GetUserProfile)
		api.POST("/user/profile", handler.UpdateUserProfile)
		api.POST("/user/avatar", handler.UploadAvatar)
		
		// 根据开发模式决定是否需要特殊处理修改密码
		if devMode {
			// 开发模式下，为了避免dev-user-id不存在的问题，使用特殊处理
			api.POST("/user/change-password", func(c *gin.Context) {
				// 在开发模式下，直接返回成功
				c.JSON(http.StatusOK, gin.H{
					"success": true,
					"message": "开发模式下密码修改成功",
				})
			})
		} else {
			api.POST("/user/change-password", handler.ChangePassword)
		}

		// 角色管理
		api.GET("/roles", handler.GetAllRoles)
		api.POST("/roles", handler.CreateRole)
		api.GET("/roles/:id", handler.GetRoleByID)
		api.PUT("/roles/:id", handler.UpdateRole)
		api.DELETE("/roles/:id", handler.DeleteRole)
		api.GET("/roles/:id/permissions", handler.GetRolePermissions)
		api.PUT("/roles/:id/permissions", handler.UpdateRolePermissions)

		// 系统设置
		api.GET("/settings", handler.GetAllSettings)
		api.GET("/settings/:key", handler.GetSetting)
		api.POST("/settings", handler.CreateSetting)
		api.PUT("/settings/:key", handler.UpdateSetting)
		api.DELETE("/settings/:key", handler.DeleteSetting)

		// 系统信息
		system := api.Group("/system")
		{
			system.GET("/info", handler.GetSystemInfo)               // 简要系统信息
			system.GET("/info/detail", handler.GetSystemInfoDetail)  // 详细系统信息
			system.POST("/info/update", handler.UpdateSystemInfoDetail) // 更新系统信息
			system.GET("/logs", handler.GetSystemLogsList)           // 获取系统日志
			system.POST("/logs/clear", handler.ClearSystemLogs)     // 清理系统日志
			system.GET("/logs/export", handler.ExportSystemLogs)    // 导出系统日志
			system.POST("/logs/batch-delete", handler.BatchDeleteSystemLogs) // 批量删除系统日志
			system.GET("/logs/config", handler.GetLogConfig)        // 获取日志配置
			system.PUT("/logs/config", handler.UpdateLogConfig)     // 更新日志配置
			system.GET("/status", handler.GetSystemStatus)           // 获取系统状态
			system.POST("/restart", handler.RestartSystem)           // 重启系统
			system.GET("/check-update", handler.CheckUpdate)         // 检查更新
			system.POST("/update", handler.PerformUpdate)            // 执行更新

			// 系统备份相关
			system.GET("/backups", handler.GetBackups)               // 获取所有备份
			system.POST("/backups", handler.CreateBackup)            // 创建新备份
			system.GET("/backups/:id", handler.GetBackupByID)        // 获取备份详情
			system.DELETE("/backups/:id", handler.DeleteBackup)      // 删除备份
			system.GET("/backups/config", handler.GetBackupConfig)   // 获取备份配置
			system.PUT("/backups/config", handler.UpdateBackupConfig) // 更新备份配置

			// 系统配置相关
			system.GET("/config", handler.GetSystemConfigs)          // 获取所有配置
			system.POST("/config", handler.CreateSystemConfig)       // 创建配置
			system.GET("/config/:name", handler.GetSystemConfigByName) // 获取配置详情
			system.PUT("/config/:name", handler.UpdateSystemConfig)  // 更新配置
			system.DELETE("/config/:name", handler.DeleteSystemConfig) // 删除配置
			system.POST("/config/init", handler.InitSystemConfigs)   // 初始化配置
		}

		// 客户管理
		api.GET("/customers", handler.GetCustomers)
		api.POST("/customers", handler.CreateCustomer)
		api.GET("/customers/:id", handler.GetCustomerByID)
		api.PUT("/customers/:id", handler.UpdateCustomer)
		api.DELETE("/customers/:id", handler.DeleteCustomer)

		// 产品管理
		api.GET("/products", handler.GetProducts)
		api.POST("/products", handler.CreateProduct)
		api.GET("/products/:id", handler.GetProductByID)
		api.PUT("/products/:id", handler.UpdateProduct)
		api.DELETE("/products/:id", handler.DeleteProduct)

		// 授权管理
		api.GET("/licenses", handler.ListLicenses)
		api.POST("/licenses", handler.CreateLicense)
		api.GET("/licenses/:id", handler.GetLicense)
		api.PUT("/licenses/:id", handler.UpdateLicense)
		api.DELETE("/licenses/:id", handler.DeleteLicense)
		api.GET("/licenses/stats", handler.GetLicenseStats)
		api.GET("/licenses/generate-key", handler.GenerateLicenseKey)
		api.POST("/licenses/export", handler.ExportLicenses)
		api.POST("/licenses/reset-filters", handler.ResetLicenseFilters)
		api.POST("/licenses/batch-generate", handler.BatchGenerateLicense)

		// 设备管理路由
		devices := api.Group("/devices")
		{
			// 基本设备管理
			devices.GET("", handler.ListDevices)                     // 获取设备列表
			devices.POST("", handler.CreateDevice)                   // 创建设备
			devices.GET("/:id", handler.GetDevice)                   // 获取设备详情
			devices.PUT("/:id", handler.UpdateDevice)                // 更新设备
			devices.DELETE("/:id", handler.DeleteDevice)             // 删除设备
			devices.GET("/:id/status", handler.GetDeviceStatus)      // 获取设备状态
			devices.GET("/:id/logs", handler.GetDeviceLogs)          // 获取设备日志
			devices.GET("/:id/alerts", handler.GetDeviceAlerts)      // 获取设备告警
			devices.POST("/:id/command", handler.SendDeviceCommand)  // 发送设备指令
			devices.GET("/:id/tasks", handler.GetDeviceTasks)        // 获取设备任务
			devices.GET("/:id/usage", handler.GetDeviceUsage)        // 获取使用情况
			devices.GET("/:id/usage-report", handler.GetDeviceUsageReport) // 获取使用报告
			devices.GET("/:id/info", handler.GetDeviceInfo)          // 获取详细信息
			devices.PUT("/:id/metadata", handler.UpdateDeviceMetadata) // 更新元数据
			devices.POST("/:id/activate", handler.ActivateDevice)     // 激活设备
			devices.POST("/:id/deactivate", handler.DeactivateDevice) // 停用设备
			devices.POST("/:id/restart", handler.RestartDevice)       // 重启设备
			devices.POST("/:id/unregister", handler.UnregisterDevice) // 注销设备
			devices.POST("/:id/unbind-license", handler.UnbindLicense) // 解绑授权
			devices.POST("/reset-filters", handler.ResetDeviceFilters) // 重置过滤条件
			devices.POST("/batch", handler.BatchManageDevices)       // 批量管理设备

			// 设备分组管理
			devices.POST("/groups", handler.CreateGroup)             // 创建分组
			devices.POST("/groups/assign", handler.AssignDevice)     // 分配设备到分组
			devices.GET("/groups/:id/devices", handler.GetDevicesByGroup) // 获取分组内设备

			// 异常行为记录
			devices.GET("/:id/abnormal-behaviors", handler.GetDeviceAbnormalBehaviors) // 获取异常行为
			devices.POST("/abnormal-behaviors", handler.RecordAbnormalBehavior)        // 记录异常行为

			// 设备监控
			devices.GET("/:id/monitor-status", handler.GetDeviceMonitorStatus)      // 获取设备监控状态
			devices.GET("/:id/risk", handler.GetDeviceRisk)                         // 获取设备风险评估
			devices.POST("/:id/analyze", handler.AnalyzeDeviceBehavior)             // 分析设备行为

			// 设备统计
			devices.GET("/stats", handler.GetDeviceStats)            // 获取设备统计
		}

		// 统计信息路由
		stats := api.Group("/stats")
		{
			stats.GET("/overview", handler.GetSystemOverview)       // 获取系统概览
			stats.GET("/devices", handler.GetDeviceStatistics)      // 获取设备统计
			stats.GET("/licenses", handler.GetLicenseStats)         // 获取许可统计
			stats.GET("/user-activity", handler.GetUserActivityStats) // 获取用户活动统计
			stats.GET("/alerts", handler.GetAlertStats)             // 获取告警统计
		}
	}

	// 系统初始化相关API (不需要认证)
	systemInit := r.Group("/api/system")
	{
		systemInit.GET("/init-status", handler.GetInitStatus)  // 获取系统初始化状态
		systemInit.POST("/init-admin", handler.InitAdmin)      // 初始化管理员账户
	}

	return r
}
