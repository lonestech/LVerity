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

// GetSystemOverview 获取系统概览统计
func GetSystemOverview(c *gin.Context) {
	// 生成模拟的系统概览数据
	overview := gin.H{
		"activeDevices": 125,
		"totalDevices": 150,
		"activeLicenses": 200,
		"totalLicenses": 250,
		"activeUsers": 45,
		"totalUsers": 60,
		"alertsCount": 8,
		"systemHealth": "good",
		"cpuUsage": 35,
		"memoryUsage": 42,
		"diskUsage": 38,
		"networkTraffic": 250,
	}
	
	c.JSON(http.StatusOK, overview)
}

// GetDeviceStatistics 获取设备统计信息
func GetDeviceStatistics(c *gin.Context) {
	// 生成模拟的设备统计数据
	stats := gin.H{
		"total": 150,
		"active": 125,
		"inactive": 15,
		"offline": 10,
		"byType": []gin.H{
			{"type": "desktop", "count": 80},
			{"type": "laptop", "count": 50},
			{"type": "mobile", "count": 20},
		},
		"byLocation": []gin.H{
			{"location": "北京", "count": 50},
			{"location": "上海", "count": 40},
			{"location": "广州", "count": 30},
			{"location": "深圳", "count": 30},
		},
		"byVersion": []gin.H{
			{"version": "1.0.0", "count": 20},
			{"version": "1.1.0", "count": 100},
			{"version": "1.2.0", "count": 30},
		},
	}
	
	c.JSON(http.StatusOK, stats)
}

// GetUserActivityStats 获取用户活动统计
func GetUserActivityStats(c *gin.Context) {
	days, _ := strconv.Atoi(c.DefaultQuery("days", "7"))
	if days <= 0 {
		days = 7
	}
	
	// 生成模拟的用户活动数据
	var activityData []gin.H
	now := time.Now()
	
	for i := 0; i < days; i++ {
		date := now.AddDate(0, 0, -i).Format("2006-01-02")
		activityData = append(activityData, gin.H{
			"date": date,
			"logins": 20 + i%10,
			"operations": 50 + i%20,
			"activeUsers": 15 + i%8,
		})
	}
	
	c.JSON(http.StatusOK, gin.H{
		"period": days,
		"data": activityData,
	})
}

// GetAlertStats 获取告警统计信息
func GetAlertStats(c *gin.Context) {
	// 生成模拟的告警统计数据
	alertStats := gin.H{
		"total": 15,
		"critical": 3,
		"major": 5,
		"minor": 7,
		"byType": []gin.H{
			{"type": "security", "count": 4},
			{"type": "performance", "count": 6},
			{"type": "connection", "count": 3},
			{"type": "license", "count": 2},
		},
		"recent": []gin.H{
			{"id": "1", "type": "security", "level": "critical", "message": "未授权访问", "time": time.Now().Add(-1 * time.Hour).Format(time.RFC3339)},
			{"id": "2", "type": "performance", "level": "major", "message": "系统负载过高", "time": time.Now().Add(-3 * time.Hour).Format(time.RFC3339)},
			{"id": "3", "type": "connection", "level": "minor", "message": "网络连接不稳定", "time": time.Now().Add(-5 * time.Hour).Format(time.RFC3339)},
		},
	}
	
	c.JSON(http.StatusOK, alertStats)
}
