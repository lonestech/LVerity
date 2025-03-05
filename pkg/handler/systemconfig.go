// pkg/handler/systemconfig.go
package handler

import (
	"LVerity/pkg/service"
	"net/http"

	"github.com/gin-gonic/gin"
)

// GetSystemConfigs 获取所有系统配置
func GetSystemConfigs(c *gin.Context) {
	// 检查是否有分组参数
	group := c.Query("group")
	
	var configs interface{}
	var err error
	
	if group != "" {
		configs, err = service.GetSystemConfigsByGroup(group)
	} else {
		configs, err = service.GetAllSystemConfigs()
	}
	
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "获取系统配置失败",
			"error":   err.Error(),
			"code":    500,
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "success",
		"code":    200,
		"data":    configs,
	})
}

// GetSystemConfigByName 根据名称获取系统配置
func GetSystemConfigByName(c *gin.Context) {
	name := c.Param("name")
	config, err := service.GetSystemConfigByName(name)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"message": "配置不存在",
			"error":   err.Error(),
			"code":    404,
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "success",
		"code":    200,
		"data":    config,
	})
}

// CreateSystemConfig 创建系统配置
func CreateSystemConfig(c *gin.Context) {
	var req struct {
		Name        string `json:"name" binding:"required"`
		Value       string `json:"value" binding:"required"`
		Description string `json:"description"`
		Group       string `json:"group" binding:"required"`
		IsSystem    bool   `json:"isSystem"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "无效的请求参数",
			"error":   err.Error(),
			"code":    400,
		})
		return
	}

	config, err := service.CreateSystemConfig(req.Name, req.Value, req.Description, req.Group, req.IsSystem)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "创建系统配置失败",
			"error":   err.Error(),
			"code":    500,
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "系统配置已创建",
		"code":    200,
		"data":    config,
	})
}

// UpdateSystemConfig 更新系统配置
func UpdateSystemConfig(c *gin.Context) {
	name := c.Param("name")
	var req struct {
		Value string `json:"value" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "无效的请求参数",
			"error":   err.Error(),
			"code":    400,
		})
		return
	}

	config, err := service.UpdateSystemConfig(name, req.Value)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "更新系统配置失败",
			"error":   err.Error(),
			"code":    500,
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "系统配置已更新",
		"code":    200,
		"data":    config,
	})
}

// DeleteSystemConfig 删除系统配置
func DeleteSystemConfig(c *gin.Context) {
	name := c.Param("name")
	err := service.DeleteSystemConfig(name)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "删除系统配置失败",
			"error":   err.Error(),
			"code":    500,
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "系统配置已删除",
		"code":    200,
	})
}

// InitSystemConfigs 初始化系统配置
func InitSystemConfigs(c *gin.Context) {
	err := service.InitDefaultSystemConfigs()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "初始化系统配置失败",
			"error":   err.Error(),
			"code":    500,
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "系统配置已初始化",
		"code":    200,
	})
}
