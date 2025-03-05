package handler

import (
	"LVerity/pkg/database"
	"LVerity/pkg/model"
	"LVerity/pkg/service"
	"fmt"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

// RegisterDeviceRequest 注册设备请求
type RegisterDeviceRequest struct {
	Name        string `json:"name"`
	DiskID      string `json:"disk_id"`
	BIOS        string `json:"bios"`
	Motherboard string `json:"motherboard"`
}

// UpdateDeviceInfoRequest 更新设备信息请求
type UpdateDeviceInfoRequest struct {
	Updates map[string]interface{} `json:"updates"`
}

// DeviceHeartbeatRequest 设备心跳请求
type DeviceHeartbeatRequest struct {
	DeviceID string `json:"device_id"`
	IP       string `json:"ip"`
}

// ExportLogsRequest 导出日志请求
type ExportLogsRequest struct {
	StartTime time.Time          `json:"start_time"`
	EndTime   time.Time          `json:"end_time"`
	DeviceID  string             `json:"device_id"`
	LogTypes  []string           `json:"log_types"`
	Format    model.ExportFormat `json:"format"`
}

// RegisterDevice 注册设备
func RegisterDevice(c *gin.Context) {
	var req RegisterDeviceRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	device, err := service.RegisterDevice(req.DiskID, req.BIOS, req.Motherboard, req.Name)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, device)
}

// BlockDevice 封禁设备
func BlockDevice(c *gin.Context) {
	deviceID := c.Param("id")

	if err := service.BlockDevice(deviceID); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Device blocked successfully"})
}

// UpdateDeviceHeartbeat 更新设备心跳
func UpdateDeviceHeartbeat(c *gin.Context) {
	var req DeviceHeartbeatRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := service.UpdateDeviceHeartbeat(req.DeviceID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Heartbeat updated successfully"})
}

// GetDevice 获取设备信息
func GetDevice(c *gin.Context) {
	deviceID := c.Param("id")

	device, err := service.GetDevice(deviceID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, device)
}

// UpdateDeviceInfo 更新设备信息
func UpdateDeviceInfo(c *gin.Context) {
	deviceID := c.Param("id")
	var req UpdateDeviceInfoRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := service.UpdateDeviceInfo(deviceID, req.Updates); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Device info updated successfully"})
}

// GetDeviceLocation 获取设备位置信息
func GetDeviceLocation(c *gin.Context) {
	deviceID := c.Param("id")
	device, err := service.GetDevice(deviceID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"device_id": device.ID,
		"timezone":  device.Timezone,
		"language":  device.Language,
	})
}

// GetDevices 获取设备列表
func GetDevices(c *gin.Context) {
	status := c.Query("status")
	var devices []model.Device
	if err := database.GetDB().Where("status = ?", status).Find(&devices).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, devices)
}

// ListDevices 获取设备列表
func ListDevices(c *gin.Context) {
	// 从查询参数获取分页信息
	page := c.DefaultQuery("page", "1")
	pageSize := c.DefaultQuery("pageSize", "10")

	devices, total, err := service.ListDevices(page, pageSize)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success":       false,
			"error_message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": gin.H{
			"list":  devices,
			"total": total,
		},
	})
}

// CreateDevice 创建设备
func CreateDevice(c *gin.Context) {
	var req RegisterDeviceRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success":       false,
			"error_message": err.Error(),
		})
		return
	}

	device, err := service.RegisterDevice(req.DiskID, req.BIOS, req.Motherboard, req.Name)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success":       false,
			"error_message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    device,
	})
}

// UpdateDevice 更新设备
func UpdateDevice(c *gin.Context) {
	deviceID := c.Param("id")
	var req UpdateDeviceInfoRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success":       false,
			"error_message": err.Error(),
		})
		return
	}

	err := service.UpdateDevice(deviceID, req.Updates)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success":       false,
			"error_message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": gin.H{
			"message": "Device updated successfully",
		},
	})
}

// DeleteDevice 删除设备
func DeleteDevice(c *gin.Context) {
	deviceID := c.Param("id")

	err := service.DeleteDevice(deviceID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success":       false,
			"error_message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": gin.H{
			"message": "Device deleted successfully",
		},
	})
}

// ExportDeviceLogs 导出设备日志
func ExportDeviceLogs(c *gin.Context) {
	var req ExportLogsRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// 设置响应头
	fileName := fmt.Sprintf("device_logs_%s.%s",
		time.Now().Format("20060102150405"),
		req.Format)

	c.Header("Content-Description", "File Transfer")
	c.Header("Content-Disposition", fmt.Sprintf("attachment; filename=%s", fileName))
	c.Header("Content-Type", req.Format.ContentType())

	// 导出日志
	if err := service.ExportDeviceLogs(c.Writer, model.LogExportOptions{
		StartTime: req.StartTime,
		EndTime:   req.EndTime,
		DeviceID:  req.DeviceID,
		Format:    req.Format,
	}); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
}

// GetDeviceUsage 获取设备使用情况
func GetDeviceUsage(c *gin.Context) {
	deviceID := c.Param("id")
	device, err := service.GetDevice(deviceID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if device.UsageStats == nil {
		device.UsageStats = &model.UsageStats{}
	}

	usage := gin.H{
		"device_id":        device.ID,
		"avg_usage_time":   device.UsageStats.AverageUsageTime,
		"peak_usage_time":  device.UsageStats.PeakUsageTime,
		"last_active_date": device.UsageStats.LastActiveDate,
	}

	c.JSON(http.StatusOK, usage)
}

// GetOnlineDevices 获取在线设备列表
func GetOnlineDevices(c *gin.Context) {
	var devices []model.Device
	if err := database.GetDB().Where("status = ?", model.DeviceStatusNormal).
		Where("last_heartbeat > ?", time.Now().Add(-5*time.Minute)).
		Find(&devices).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, devices)
}

// GetDeviceUsageReport 获取设备使用报告
func GetDeviceUsageReport(c *gin.Context) {
	deviceID := c.Param("id")
	device, err := service.GetDevice(deviceID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if device.UsageStats == nil {
		device.UsageStats = &model.UsageStats{}
	}

	report := gin.H{
		"device_id":        device.ID,
		"name":             device.Name,
		"status":           device.Status,
		"avg_usage_time":   device.UsageStats.AverageUsageTime,
		"peak_usage_time":  device.UsageStats.PeakUsageTime,
		"last_active_date": device.UsageStats.LastActiveDate,
		"alert_count":      device.AlertCount,
		"last_alert_time":  device.LastAlertTime,
		"risk_level":       device.RiskLevel,
	}

	c.JSON(http.StatusOK, report)
}

// GetDeviceInfo 获取设备详细信息
func GetDeviceInfo(c *gin.Context) {
	deviceID := c.Param("id")

	device, err := service.GetDeviceInfo(deviceID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, device)
}

// UpdateDeviceMetadata 更新设备元数据
func UpdateDeviceMetadata(c *gin.Context) {
	deviceID := c.Param("id")
	var metadata map[string]interface{}

	if err := c.ShouldBindJSON(&metadata); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := service.UpdateDeviceMetadata(deviceID, metadata); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Device metadata updated successfully"})
}

// GetDeviceStats 获取设备统计信息
func GetDeviceStats(c *gin.Context) {
	stats, err := service.GetDeviceStats()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, stats)
}

// GetDeviceStatus 获取设备状态
func GetDeviceStatus(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "设备ID不能为空"})
		return
	}

	// 这里应该调用实际的服务层函数获取设备状态
	// 目前返回模拟数据
	status := gin.H{
		"deviceId": id,
		"status": "online",
		"lastHeartbeat": time.Now().Add(-5 * time.Minute).Format(time.RFC3339),
		"uptime": "12h30m",
		"cpuUsage": 35.5,
		"memoryUsage": 42.3,
		"diskUsage": 68.7,
		"networkStatus": "normal",
		"ipAddress": "192.168.1.100",
		"connectionQuality": "good",
	}

	c.JSON(http.StatusOK, status)
}

// GetDeviceLogs 获取设备日志
func GetDeviceLogs(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "设备ID不能为空"})
		return
	}

	// 处理分页参数
	page := 1
	pageSize := 20
	// 这里应该调用实际的服务层函数获取设备日志
	// 目前返回模拟数据
	logs := []gin.H{
		{"id": "1", "time": time.Now().Add(-1 * time.Hour).Format(time.RFC3339), "level": "info", "message": "应用启动"},
		{"id": "2", "time": time.Now().Add(-50 * time.Minute).Format(time.RFC3339), "level": "warning", "message": "内存使用率超过80%"},
		{"id": "3", "time": time.Now().Add(-30 * time.Minute).Format(time.RFC3339), "level": "error", "message": "数据库连接超时"},
		{"id": "4", "time": time.Now().Add(-10 * time.Minute).Format(time.RFC3339), "level": "info", "message": "授权验证成功"},
	}

	c.JSON(http.StatusOK, gin.H{
		"deviceId": id,
		"logs": logs,
		"pagination": gin.H{
			"page": page,
			"pageSize": pageSize,
			"total": 4,
		},
	})
}

// GetDeviceAlerts 获取设备告警
func GetDeviceAlerts(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "设备ID不能为空"})
		return
	}

	// 处理分页参数
	page := 1
	pageSize := 20
	// 这里应该调用实际的服务层函数获取设备告警
	// 目前返回模拟数据
	alerts := []gin.H{
		{"id": "1", "time": time.Now().Add(-2 * time.Hour).Format(time.RFC3339), "level": "critical", "type": "security", "message": "检测到未授权访问"},
		{"id": "2", "time": time.Now().Add(-1 * time.Hour).Format(time.RFC3339), "level": "major", "type": "performance", "message": "CPU使用率持续超过90%"},
		{"id": "3", "time": time.Now().Add(-30 * time.Minute).Format(time.RFC3339), "level": "minor", "type": "license", "message": "授权即将到期"},
	}

	c.JSON(http.StatusOK, gin.H{
		"deviceId": id,
		"alerts": alerts,
		"pagination": gin.H{
			"page": page,
			"pageSize": pageSize,
			"total": 3,
		},
	})
}

// SendDeviceCommand 发送设备指令
func SendDeviceCommand(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "设备ID不能为空"})
		return
	}

	var command struct {
		Type    string                 `json:"type" binding:"required"`
		Params  map[string]interface{} `json:"params"`
		Timeout int                    `json:"timeout"`
	}

	if err := c.ShouldBindJSON(&command); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// 这里应该调用实际的服务层函数发送指令到设备
	// 目前返回模拟数据
	commandId := fmt.Sprintf("cmd-%d", time.Now().Unix())
	
	c.JSON(http.StatusOK, gin.H{
		"deviceId": id,
		"commandId": commandId,
		"status": "sent",
		"message": "指令已发送到设备",
		"sentTime": time.Now().Format(time.RFC3339),
	})
}

// GetDeviceTasks 获取设备任务
func GetDeviceTasks(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "设备ID不能为空"})
		return
	}

	// 处理分页参数
	page := 1
	pageSize := 20
	// 这里应该调用实际的服务层函数获取设备任务
	// 目前返回模拟数据
	tasks := []gin.H{
		{"id": "1", "name": "系统扫描", "status": "completed", "progress": 100, "startTime": time.Now().Add(-2 * time.Hour).Format(time.RFC3339), "endTime": time.Now().Add(-1 * time.Hour).Format(time.RFC3339)},
		{"id": "2", "name": "数据备份", "status": "in_progress", "progress": 75, "startTime": time.Now().Add(-30 * time.Minute).Format(time.RFC3339), "endTime": nil},
		{"id": "3", "name": "软件更新", "status": "pending", "progress": 0, "startTime": nil, "endTime": nil},
	}

	c.JSON(http.StatusOK, gin.H{
		"deviceId": id,
		"tasks": tasks,
		"pagination": gin.H{
			"page": page,
			"pageSize": pageSize,
			"total": 3,
		},
	})
}

// ResetDeviceFilters 重置设备过滤条件
func ResetDeviceFilters(c *gin.Context) {
	// 这里是一个简单的API，主要用于前端重置操作
	// 实际上不需要后端存储状态，因为过滤状态存在前端
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "设备过滤条件已重置",
	})
}

// UnregisterDevice 注销设备
func UnregisterDevice(c *gin.Context) {
	deviceID := c.Param("id")
	
	// 获取设备
	device, err := service.GetDevice(deviceID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"message": "设备不存在",
			"error": err.Error(),
		})
		return
	}
	
	// 解绑任何关联的授权
	if device.LicenseID != "" {
		if err := service.UnbindLicense(deviceID); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"success": false,
				"message": "解绑授权失败",
				"error": err.Error(),
			})
			return
		}
	}
	
	// 将状态设置为注销
	if err := service.DeactivateDevice(deviceID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "注销设备失败",
			"error": err.Error(),
		})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "设备已成功注销",
	})
}

// BatchManageDevices 批量管理设备
func BatchManageDevices(c *gin.Context) {
	var req struct {
		IDs    []string `json:"ids" binding:"required"`
		Action string   `json:"action" binding:"required"`
	}
	
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "请求参数无效",
			"error": err.Error(),
		})
		return
	}
	
	var failedCount int
	var successCount int
	
	for _, id := range req.IDs {
		var err error
		
		switch req.Action {
		case "activate":
			err = service.ActivateDevice(id)
		case "deactivate":
			err = service.DeactivateDevice(id)
		case "delete":
			err = service.DeleteDevice(id)
		case "unregister":
			device, getErr := service.GetDevice(id)
			if getErr != nil {
				failedCount++
				continue
			}
			
			if device.LicenseID != "" {
				service.UnbindLicense(id) // 忽略错误，继续后续操作
			}
			
			err = service.DeactivateDevice(id)
		default:
			c.JSON(http.StatusBadRequest, gin.H{
				"success": false,
				"message": "无效的操作类型",
			})
			return
		}
		
		if err != nil {
			failedCount++
		} else {
			successCount++
		}
	}
	
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": fmt.Sprintf("批量操作完成: %d 成功, %d 失败", successCount, failedCount),
		"data": gin.H{
			"success": successCount,
			"failed": failedCount,
		},
	})
}
