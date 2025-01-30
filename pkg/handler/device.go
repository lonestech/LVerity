package handler

import (
	"LVerity/pkg/model"
	"LVerity/pkg/service"
	"LVerity/pkg/store"
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
	DeviceID  string         `json:"device_id"`
	IP        string         `json:"ip"`
}

// ExportLogsRequest 导出日志请求
type ExportLogsRequest struct {
	StartTime  time.Time         `json:"start_time"`
	EndTime    time.Time         `json:"end_time"`
	DeviceID   string           `json:"device_id"`
	LogTypes   []string         `json:"log_types"`
	Format     model.ExportFormat `json:"format"`
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
		"language": device.Language,
	})
}

// GetDevices 获取设备列表
func GetDevices(c *gin.Context) {
	status := c.Query("status")
	var devices []model.Device
	if err := store.GetDB().Where("status = ?", status).Find(&devices).Error; err != nil {
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
            "success": false,
            "error_message": err.Error(),
        })
        return
    }

    c.JSON(http.StatusOK, gin.H{
        "success": true,
        "data": gin.H{
            "list": devices,
            "total": total,
        },
    })
}

// CreateDevice 创建设备
func CreateDevice(c *gin.Context) {
    var req RegisterDeviceRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{
            "success": false,
            "error_message": err.Error(),
        })
        return
    }

    device, err := service.RegisterDevice(req.DiskID, req.BIOS, req.Motherboard, req.Name)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{
            "success": false,
            "error_message": err.Error(),
        })
        return
    }

    c.JSON(http.StatusOK, gin.H{
        "success": true,
        "data": device,
    })
}

// UpdateDevice 更新设备
func UpdateDevice(c *gin.Context) {
    deviceID := c.Param("id")
    var req UpdateDeviceInfoRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{
            "success": false,
            "error_message": err.Error(),
        })
        return
    }

    err := service.UpdateDevice(deviceID, req.Updates)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{
            "success": false,
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
            "success": false,
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
	if err := store.GetDB().Where("status = ?", model.DeviceStatusNormal).
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
		"name":            device.Name,
		"status":          device.Status,
		"avg_usage_time":   device.UsageStats.AverageUsageTime,
		"peak_usage_time":  device.UsageStats.PeakUsageTime,
		"last_active_date": device.UsageStats.LastActiveDate,
		"alert_count":     device.AlertCount,
		"last_alert_time": device.LastAlertTime,
		"risk_level":      device.RiskLevel,
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
