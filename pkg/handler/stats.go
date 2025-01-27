package handler

import (
	"LVerity/pkg/service"
	"net/http"
	"strconv"
	"time"
	"github.com/gin-gonic/gin"
)

// GetLicenseStats 获取授权统计信息
func GetLicenseStats(c *gin.Context) {
	startTime := time.Now().AddDate(0, -1, 0) // 默认查询最近一个月
	endTime := time.Now()

	if startStr := c.Query("start_time"); startStr != "" {
		if t, err := time.Parse(time.RFC3339, startStr); err == nil {
			startTime = t
		}
	}
	if endStr := c.Query("end_time"); endStr != "" {
		if t, err := time.Parse(time.RFC3339, endStr); err == nil {
			endTime = t
		}
	}

	stats, err := service.QueryLicenseStats(startTime, endTime)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, stats)
}

// GetLicenseActivationTrend 获取授权码激活趋势
func GetLicenseActivationTrend(c *gin.Context) {
	days, _ := strconv.Atoi(c.DefaultQuery("days", "30"))
	if days <= 0 {
		days = 30
	}

	trend, err := service.GetLicenseActivationTrend(days)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, trend)
}

// GetDeviceLocationStats 获取设备位置统计信息
func GetDeviceLocationStats(c *gin.Context) {
	startTime := time.Now().AddDate(0, -1, 0) // 默认查询最近一个月
	endTime := time.Now()

	if startStr := c.Query("start_time"); startStr != "" {
		if t, err := time.Parse(time.RFC3339, startStr); err == nil {
			startTime = t
		}
	}
	if endStr := c.Query("end_time"); endStr != "" {
		if t, err := time.Parse(time.RFC3339, endStr); err == nil {
			endTime = t
		}
	}

	stats, err := service.QueryDeviceLocationStats(startTime, endTime)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, stats)
}
