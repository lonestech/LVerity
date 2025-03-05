// pkg/handler/backup.go
package handler

import (
	"LVerity/pkg/model"
	"LVerity/pkg/service"
	"net/http"

	"github.com/gin-gonic/gin"
)

// GetBackups 获取所有备份
func GetBackups(c *gin.Context) {
	backups, err := service.GetAllBackups()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "获取备份列表失败",
			"error":   err.Error(),
			"code":    500,
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "success",
		"code":    200,
		"data":    backups,
	})
}

// GetBackupByID 根据ID获取备份详情
func GetBackupByID(c *gin.Context) {
	id := c.Param("id")
	backup, err := service.GetBackupByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"message": "备份不存在",
			"error":   err.Error(),
			"code":    404,
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "success",
		"code":    200,
		"data":    backup,
	})
}

// CreateBackup 创建新备份
func CreateBackup(c *gin.Context) {
	var req struct {
		Name        string `json:"name" binding:"required"`
		Description string `json:"description"`
		Type        string `json:"type"`
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

	// 设置默认值
	backupType := model.BackupTypeManual
	if req.Type != "" {
		backupType = model.BackupType(req.Type)
	}

	// 创建备份 (这里应该传入当前用户的ID，暂时使用固定值)
	backup, err := service.CreateBackup(req.Name, req.Description, backupType, "system")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "创建备份失败",
			"error":   err.Error(),
			"code":    500,
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "备份任务已创建",
		"code":    200,
		"data":    backup,
	})
}

// DeleteBackup 删除备份
func DeleteBackup(c *gin.Context) {
	id := c.Param("id")
	err := service.DeleteBackup(id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "删除备份失败",
			"error":   err.Error(),
			"code":    500,
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "备份已删除",
		"code":    200,
	})
}

// GetBackupConfig 获取备份配置
func GetBackupConfig(c *gin.Context) {
	config, err := service.GetBackupConfig()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "获取备份配置失败",
			"error":   err.Error(),
			"code":    500,
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

// UpdateBackupConfig 更新备份配置
func UpdateBackupConfig(c *gin.Context) {
	var config model.BackupConfig
	if err := c.ShouldBindJSON(&config); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "无效的请求参数",
			"error":   err.Error(),
			"code":    400,
		})
		return
	}

	updatedConfig, err := service.UpdateBackupConfig(config)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "更新备份配置失败",
			"error":   err.Error(),
			"code":    500,
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "备份配置已更新",
		"code":    200,
		"data":    updatedConfig,
	})
}
