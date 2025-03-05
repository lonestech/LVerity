// handler/systeminfo.go
package handler

import (
	"LVerity/pkg/service"
	"net/http"

	"github.com/gin-gonic/gin"
)

// GetSystemInfoDetail 获取详细系统信息
func GetSystemInfoDetail(c *gin.Context) {
	systemInfo, err := service.GetSystemInfo()
	if err != nil {
		// 如果系统信息不存在，则更新系统信息
		if err == service.ErrSystemInfoNotFound {
			systemInfo, err = service.UpdateSystemInfo()
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{
					"success": false,
					"message": "获取系统信息失败",
					"error":   err.Error(),
				})
				return
			}
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{
				"success": false,
				"message": "获取系统信息失败",
				"error":   err.Error(),
			})
			return
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "success",
		"code":    200,
		"data":    systemInfo,
	})
}

// UpdateSystemInfoDetail 更新系统信息
func UpdateSystemInfoDetail(c *gin.Context) {
	systemInfo, err := service.UpdateSystemInfo()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "更新系统信息失败",
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "系统信息更新成功",
		"code":    200,
		"data":    systemInfo,
	})
}
