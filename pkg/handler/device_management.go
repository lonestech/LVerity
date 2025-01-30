package handler

import (
	"LVerity/pkg/model"
	"LVerity/pkg/service"
	"LVerity/pkg/store"
	"LVerity/pkg/utils"
	"encoding/json"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

// 设备分组相关处理器

type CreateGroupRequest struct {
	Name        string `json:"name" binding:"required"`
	Description string `json:"description"`
}

func CreateGroup(c *gin.Context) {
	var req CreateGroupRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// 从上下文获取当前用户
	userID := c.GetString("user_id")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	group := &model.DeviceGroup{
		ID:          utils.GenerateUUID(),
		Name:        req.Name,
		Description: req.Description,
		CreatedBy:   userID,
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}

	if err := store.GetDB().Create(group).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, group)
}

type AssignDeviceRequest struct {
	DeviceID string `json:"device_id" binding:"required"`
	GroupID  string `json:"group_id" binding:"required"`
}

func AssignDevice(c *gin.Context) {
	var req AssignDeviceRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := service.AssignDeviceToGroup(req.DeviceID, req.GroupID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "device assigned to group successfully"})
}

func GetDevicesByGroup(c *gin.Context) {
	groupID := c.Param("group_id")
	if groupID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "group_id is required"})
		return
	}

	var devices []model.Device
	if err := store.GetDB().Where("group_id = ?", groupID).Find(&devices).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, devices)
}

// 黑名单管理相关处理器

type CreateRuleRequest struct {
	Type        string `json:"type" binding:"required"`
	Pattern     string `json:"pattern" binding:"required"`
	Description string `json:"description"`
}

func CreateRule(c *gin.Context) {
	var req CreateRuleRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userID := c.GetString("user_id")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	rule := &model.BlacklistRule{
		ID:          utils.GenerateUUID(),
		Type:        req.Type,
		Pattern:     req.Pattern,
		Description: req.Description,
		CreatedBy:   userID,
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}

	if err := store.GetDB().Create(rule).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, rule)
}

// 异常行为记录相关处理器

type RecordAbnormalBehaviorRequest struct {
	DeviceID    string      `json:"device_id" binding:"required"`
	Type        string      `json:"type" binding:"required"`
	Description string      `json:"description"`
	Level       string      `json:"level" binding:"required"`
	Data        interface{} `json:"data"`
}

func RecordAbnormalBehavior(c *gin.Context) {
	var req RecordAbnormalBehaviorRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// 将数据转换为JSON字符串
	dataJSON, err := json.Marshal(req.Data)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid data format"})
		return
	}

	behavior := &model.AbnormalBehavior{
		ID:          utils.GenerateUUID(),
		DeviceID:    req.DeviceID,
		Type:        req.Type,
		Description: req.Description,
		Level:       req.Level,
		Data:        string(dataJSON),
		CreatedAt:   time.Now(),
	}

	if err := store.GetDB().Create(behavior).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "abnormal behavior recorded successfully"})
}

func GetDeviceAbnormalBehaviors(c *gin.Context) {
	deviceID := c.Param("device_id")
	if deviceID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "device_id is required"})
		return
	}

	var behaviors []model.AbnormalBehavior
	if err := store.GetDB().Where("device_id = ?", deviceID).Find(&behaviors).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, behaviors)
}

// 设备监控相关处理器

// GetDeviceStatus 获取设备状态
func GetDeviceStatus(c *gin.Context) {
	deviceID := c.Param("deviceID")
	var device model.Device
	var behaviors []model.AbnormalBehavior

	// 获取设备信息
	if err := store.GetDB().First(&device, "id = ?", deviceID).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// 获取异常行为记录
	if err := store.GetDB().Where("device_id = ?", deviceID).Find(&behaviors).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// 计算当前风险等级
	riskLevel := utils.CalculateDeviceRisk(&device, behaviors)

	response := gin.H{
		"device_id":       device.ID,
		"status":         device.Status,
		"risk_level":     riskLevel,
		"last_heartbeat": device.LastHeartbeat,
		"abnormal_count": len(behaviors),
		"behaviors":      behaviors,
	}

	c.JSON(http.StatusOK, response)
}

// AnalyzeDeviceBehavior 分析设备行为
func AnalyzeDeviceBehavior(c *gin.Context) {
	deviceID := c.Param("deviceID")
	var device model.Device
	var behaviors []model.AbnormalBehavior

	// 获取设备信息
	if err := store.GetDB().First(&device, "id = ?", deviceID).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// 获取设备行为记录
	if err := store.GetDB().Where("device_id = ?", deviceID).Find(&behaviors).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// 计算设备风险
	risk := utils.CalculateDeviceRisk(&device, behaviors)

	analysis := map[string]interface{}{
		"deviceID":      deviceID,
		"behaviorCount": len(behaviors),
		"risk":          risk,
		"behaviors":     behaviors,
	}

	c.JSON(http.StatusOK, analysis)
}

// GetDeviceRisk 获取设备风险评估
func GetDeviceRisk(c *gin.Context) {
	deviceID := c.Param("deviceID")
	var device model.Device
	var behaviors []model.AbnormalBehavior

	if err := store.GetDB().First(&device, "id = ?", deviceID).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if err := store.GetDB().Where("device_id = ?", deviceID).Find(&behaviors).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	risk := utils.CalculateDeviceRisk(&device, behaviors)
	c.JSON(http.StatusOK, gin.H{
		"deviceID": deviceID,
		"risk":     risk,
	})
}
