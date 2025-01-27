package handler

import (
	"LVerity/pkg/model"
	"LVerity/pkg/service"
	"github.com/gin-gonic/gin"
	"net/http"
	"time"
)

// CreateAlert 创建告警
// @Summary 创建新的告警
// @Description 为指定设备创建一个新的告警记录
// @Tags 告警管理
// @Accept json
// @Produce json
// @Param alert body CreateAlertRequest true "告警信息"
// @Success 200 {object} model.Alert
// @Failure 400 {object} ErrorResponse
// @Router /api/v1/alerts [post]
func CreateAlert(c *gin.Context) {
	var req CreateAlertRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{Error: "无效的请求参数"})
		return
	}

	alert, err := service.CreateAlert(req.DeviceID, req.Type, req.Level, req.Message, req.Metadata)
	if err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{Error: err.Error()})
		return
	}

	c.JSON(http.StatusOK, alert)
}

// GetAlert 获取告警详情
// @Summary 获取告警详情
// @Description 根据告警ID获取告警详细信息
// @Tags 告警管理
// @Accept json
// @Produce json
// @Param id path string true "告警ID"
// @Success 200 {object} model.Alert
// @Failure 404 {object} ErrorResponse
// @Router /api/v1/alerts/{id} [get]
func GetAlert(c *gin.Context) {
	alertID := c.Param("id")
	alert, err := service.GetAlert(alertID)
	if err != nil {
		c.JSON(http.StatusNotFound, ErrorResponse{Error: "告警不存在"})
		return
	}

	c.JSON(http.StatusOK, alert)
}

// GetAlertsByDevice 获取设备告警
// @Summary 获取设备的告警列表
// @Description 获取指定设备的所有告警记录
// @Tags 告警管理
// @Accept json
// @Produce json
// @Param deviceId path string true "设备ID"
// @Success 200 {array} model.Alert
// @Failure 400 {object} ErrorResponse
// @Router /api/v1/devices/{deviceId}/alerts [get]
func GetAlertsByDevice(c *gin.Context) {
	deviceID := c.Param("deviceId")
	alerts, err := service.GetAlertsByDevice(deviceID)
	if err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{Error: err.Error()})
		return
	}

	c.JSON(http.StatusOK, alerts)
}

// UpdateAlertStatus 更新告警状态
// @Summary 更新告警状态
// @Description 更新指定告警的状态
// @Tags 告警管理
// @Accept json
// @Produce json
// @Param id path string true "告警ID"
// @Param status body UpdateAlertStatusRequest true "新状态"
// @Success 200 {object} SuccessResponse
// @Failure 400 {object} ErrorResponse
// @Router /api/v1/alerts/{id}/status [put]
func UpdateAlertStatus(c *gin.Context) {
	alertID := c.Param("id")
	var req UpdateAlertStatusRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{Error: "无效的请求参数"})
		return
	}

	if err := service.UpdateAlertStatus(alertID, req.Status); err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{Error: err.Error()})
		return
	}

	c.JSON(http.StatusOK, SuccessResponse{Message: "告警状态已更新"})
}

// GetAlertsByStatus 获取指定状态的告警
// @Summary 获取指定状态的告警列表
// @Description 获取系统中指定状态的所有告警
// @Tags 告警管理
// @Accept json
// @Produce json
// @Param status query string true "告警状态"
// @Success 200 {array} model.Alert
// @Failure 400 {object} ErrorResponse
// @Router /api/v1/alerts [get]
func GetAlertsByStatus(c *gin.Context) {
	status := model.AlertStatus(c.Query("status"))
	alerts, err := service.GetAlertsByStatus(status)
	if err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{Error: err.Error()})
		return
	}

	c.JSON(http.StatusOK, alerts)
}

// GetAlertsByTimeRange 获取时间范围内的告警
// @Summary 获取时间范围内的告警
// @Description 获取指定时间范围内的所有告警记录
// @Tags 告警管理
// @Accept json
// @Produce json
// @Param startTime query string true "开始时间"
// @Param endTime query string true "结束时间"
// @Success 200 {array} model.Alert
// @Failure 400 {object} ErrorResponse
// @Router /api/v1/alerts/timerange [get]
func GetAlertsByTimeRange(c *gin.Context) {
	startTimeStr := c.Query("startTime")
	endTimeStr := c.Query("endTime")

	startTime, err := time.Parse(time.RFC3339, startTimeStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{Error: "无效的开始时间格式"})
		return
	}

	endTime, err := time.Parse(time.RFC3339, endTimeStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{Error: "无效的结束时间格式"})
		return
	}

	alerts, err := service.GetAlertsByTimeRange(startTime, endTime)
	if err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{Error: err.Error()})
		return
	}

	c.JSON(http.StatusOK, alerts)
}

// GetAlertCount 获取告警数量
// @Summary 获取告警数量
// @Description 获取指定设备和状态的告警数量
// @Tags 告警管理
// @Accept json
// @Produce json
// @Param deviceId query string false "设备ID"
// @Param status query string false "告警状态"
// @Success 200 {object} AlertCountResponse
// @Failure 400 {object} ErrorResponse
// @Router /api/v1/alerts/count [get]
func GetAlertCount(c *gin.Context) {
	deviceID := c.Query("deviceId")
	status := model.AlertStatus(c.Query("status"))

	count, err := service.GetAlertCount(deviceID, status)
	if err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{Error: err.Error()})
		return
	}

	c.JSON(http.StatusOK, AlertCountResponse{Count: count})
}

// Request and Response types

type CreateAlertRequest struct {
	DeviceID string           `json:"deviceId" binding:"required"`
	Type     string           `json:"type" binding:"required"`
	Level    model.AlertLevel `json:"level" binding:"required"`
	Message  string           `json:"message" binding:"required"`
	Metadata string           `json:"metadata"`
}

type UpdateAlertStatusRequest struct {
	Status model.AlertStatus `json:"status" binding:"required"`
}

type AlertCountResponse struct {
	Count int64 `json:"count"`
}

type SuccessResponse struct {
	Message string `json:"message"`
}

type ErrorResponse struct {
	Error string `json:"error"`
}
