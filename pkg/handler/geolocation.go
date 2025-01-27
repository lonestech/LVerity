package handler

import (
	"LVerity/pkg/model"
	"LVerity/pkg/service"
	"github.com/gin-gonic/gin"
	"net/http"
)

// UpdateLocationRequest 更新位置请求
type UpdateLocationRequest struct {
	Latitude  float64 `json:"latitude" binding:"required"`
	Longitude float64 `json:"longitude" binding:"required"`
	Country   string  `json:"country"`
	City      string  `json:"city"`
}

// UpdateDeviceLocation 更新设备位置
// @Summary 更新设备位置信息
// @Description 更新指定设备的地理位置信息
// @Tags 地理位置
// @Accept json
// @Produce json
// @Param deviceId path string true "设备ID"
// @Param location body UpdateLocationRequest true "位置信息"
// @Success 200 {object} model.DeviceLocationLog
// @Failure 400 {object} ErrorResponse
// @Router /api/v1/devices/{deviceId}/location [put]
func UpdateDeviceLocation(c *gin.Context) {
	deviceID := c.Param("deviceId")
	var req UpdateLocationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{Error: "无效的请求参数"})
		return
	}

	location := &model.DeviceLocationLog{
		DeviceID: deviceID,
		Location: model.Location{
			Latitude:  req.Latitude,
			Longitude: req.Longitude,
			Country:   req.Country,
			City:      req.City,
		},
	}

	if err := service.UpdateDeviceLocation(location); err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{Error: err.Error()})
		return
	}

	c.JSON(http.StatusOK, location)
}

// GetNearbyDevicesRequest 获取附近设备请求
type GetNearbyDevicesRequest struct {
	Latitude  float64 `form:"latitude" binding:"required"`
	Longitude float64 `form:"longitude" binding:"required"`
	Radius    float64 `form:"radius" binding:"required,gt=0"`
}

// GetNearbyDevices 获取附近设备
// @Summary 获取附近的设备
// @Description 获取指定坐标点附近的设备列表
// @Tags 地理位置
// @Accept json
// @Produce json
// @Param latitude query number true "纬度"
// @Param longitude query number true "经度"
// @Param radius query number true "半径(米)"
// @Success 200 {array} model.Device
// @Failure 400 {object} ErrorResponse
// @Router /api/v1/devices/nearby [get]
func GetNearbyDevices(c *gin.Context) {
	var req GetNearbyDevicesRequest
	if err := c.ShouldBindQuery(&req); err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{Error: "无效的请求参数"})
		return
	}

	devices, err := service.GetNearbyDevices(req.Latitude, req.Longitude, req.Radius)
	if err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{Error: err.Error()})
		return
	}

	c.JSON(http.StatusOK, devices)
}
