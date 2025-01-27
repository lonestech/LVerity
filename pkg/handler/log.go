package handler

import (
	"net/http"
	"strconv"
	"time"
	"LVerity/pkg/model"
	"LVerity/pkg/service"
	"github.com/gin-gonic/gin"
)

// GetOperationLogs 获取操作日志
func GetOperationLogs(c *gin.Context) {
	userID := c.Query("user_id")
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "20"))
	
	startTimeStr := c.DefaultQuery("start_time", time.Now().AddDate(0, 0, -7).Format(time.RFC3339))
	endTimeStr := c.DefaultQuery("end_time", time.Now().Format(time.RFC3339))
	
	startTime, _ := time.Parse(time.RFC3339, startTimeStr)
	endTime, _ := time.Parse(time.RFC3339, endTimeStr)

	logs, total, err := service.GetOperationLogs(userID, startTime, endTime, page, pageSize)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"total": total,
		"page": page,
		"page_size": pageSize,
		"data": logs,
	})
}

// GetSystemLogs 获取系统日志
func GetSystemLogs(c *gin.Context) {
	level := model.LogLevel(c.Query("level"))
	module := c.Query("module")
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "20"))
	
	startTimeStr := c.DefaultQuery("start_time", time.Now().AddDate(0, 0, -7).Format(time.RFC3339))
	endTimeStr := c.DefaultQuery("end_time", time.Now().Format(time.RFC3339))
	
	startTime, _ := time.Parse(time.RFC3339, startTimeStr)
	endTime, _ := time.Parse(time.RFC3339, endTimeStr)

	logs, total, err := service.GetSystemLogs(level, module, startTime, endTime, page, pageSize)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"total": total,
		"page": page,
		"page_size": pageSize,
		"data": logs,
	})
}
