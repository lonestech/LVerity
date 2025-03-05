// handler/setting.go
package handler

import (
	"LVerity/pkg/model"
	"LVerity/pkg/service"
	"net/http"

	"github.com/gin-gonic/gin"
)

// CreateSettingRequest 创建设置请求结构
type CreateSettingRequest struct {
	Key         string                 `json:"key" binding:"required"`
	Value       map[string]interface{} `json:"value" binding:"required"`
	Type        string                 `json:"type" binding:"required"`
	Description string                 `json:"description"`
}

// UpdateSettingRequest 更新设置请求结构
type UpdateSettingRequest struct {
	Value       map[string]interface{} `json:"value" binding:"required"`
	Description string                 `json:"description"`
}

// GetAllSettings 获取所有设置
func GetAllSettings(c *gin.Context) {
	settingType := c.Query("type")

	var settings []model.Setting
	var err error

	if settingType != "" {
		// 按类型获取设置
		settings, err = service.GetSettingsByType(model.SettingType(settingType))
	} else {
		// 获取所有设置
		settings, err = service.GetAllSettings()
	}

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "获取设置列表失败",
			"error":   err.Error(),
		})
		return
	}

	// 如果没有任何设置，初始化默认设置
	if len(settings) == 0 {
		if err := service.InitDefaultSettings(); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"success": false,
				"message": "初始化默认设置失败",
				"error":   err.Error(),
			})
			return
		}
		
		// 重新获取设置列表
		if settingType != "" {
			settings, err = service.GetSettingsByType(model.SettingType(settingType))
		} else {
			settings, err = service.GetAllSettings()
		}

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"success": false,
				"message": "获取设置列表失败",
				"error":   err.Error(),
			})
			return
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "success",
		"code":    200,
		"data":    settings,
	})
}

// GetSetting 获取单个设置
func GetSetting(c *gin.Context) {
	key := c.Param("key")
	setting, err := service.GetSetting(key)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"message": "设置不存在",
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "success",
		"code":    200,
		"data":    setting,
	})
}

// CreateSetting 创建设置
func CreateSetting(c *gin.Context) {
	var req CreateSettingRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "无效的请求参数",
			"error":   err.Error(),
		})
		return
	}

	// 转换设置类型
	settingType := model.SettingType(req.Type)
	if !settingType.IsValid() {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "无效的设置类型",
			"error":   "无效的设置类型: " + req.Type,
		})
		return
	}

	// 转换设置值
	value := model.JSONValue(req.Value)

	// 创建设置
	setting, err := service.CreateSetting(req.Key, value, settingType, req.Description)
	if err != nil {
		statusCode := http.StatusInternalServerError
		if err == service.ErrSettingKeyTaken {
			statusCode = http.StatusConflict
		}
		
		c.JSON(statusCode, gin.H{
			"success": false,
			"message": "创建设置失败",
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"success": true,
		"message": "设置创建成功",
		"code":    201,
		"data":    setting,
	})
}

// UpdateSetting 更新设置
func UpdateSetting(c *gin.Context) {
	key := c.Param("key")
	var req UpdateSettingRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "无效的请求参数",
			"error":   err.Error(),
		})
		return
	}

	// 转换设置值
	value := model.JSONValue(req.Value)

	// 更新设置
	setting, err := service.UpdateSetting(key, value, req.Description)
	if err != nil {
		statusCode := http.StatusInternalServerError
		if err == service.ErrSettingNotFound {
			statusCode = http.StatusNotFound
		}
		
		c.JSON(statusCode, gin.H{
			"success": false,
			"message": "更新设置失败",
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "设置更新成功",
		"code":    200,
		"data":    setting,
	})
}

// DeleteSetting 删除设置
func DeleteSetting(c *gin.Context) {
	key := c.Param("key")
	if err := service.DeleteSetting(key); err != nil {
		statusCode := http.StatusInternalServerError
		if err == service.ErrSettingNotFound {
			statusCode = http.StatusNotFound
		}
		
		c.JSON(statusCode, gin.H{
			"success": false,
			"message": "删除设置失败",
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "设置删除成功",
		"code":    200,
		"data":    nil,
	})
}
