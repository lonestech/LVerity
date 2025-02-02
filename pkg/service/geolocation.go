package service

import (
	"LVerity/pkg/database"
	"LVerity/pkg/model"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"math"
	"net/http"
	"time"
)

const (
	geoIPAPIEndpoint = "http://ip-api.com/json/%s"
	earthRadius      = 6371.0 // 地球半径，单位：公里
)

// GeoIPResponse IP地理位置信息响应
type GeoIPResponse struct {
	Status  string  `json:"status"`
	Country string  `json:"country"`
	City    string  `json:"city"`
	Lat     float64 `json:"lat"`
	Lon     float64 `json:"lon"`
	Message string  `json:"message"`
}

// GetLocationFromIP 从IP获取地理位置信息
func GetLocationFromIP(ip string) (*model.Location, error) {
	url := fmt.Sprintf(geoIPAPIEndpoint, ip)

	resp, err := http.Get(url)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	var geoIP GeoIPResponse
	if err := json.Unmarshal(body, &geoIP); err != nil {
		return nil, err
	}

	if geoIP.Status != "success" {
		return nil, fmt.Errorf("geolocation failed: %s", geoIP.Message)
	}

	return &model.Location{
		Latitude:  geoIP.Lat,
		Longitude: geoIP.Lon,
		Country:   geoIP.Country,
		City:      geoIP.City,
	}, nil
}

// UpdateDeviceLocation 更新设备位置信息
func UpdateDeviceLocation(log *model.DeviceLocationLog) error {
	log.Timestamp = time.Now()
	return database.GetDB().Create(log).Error
}

// GetNearbyDevices 获取附近的设备
func GetNearbyDevices(lat, lon, radius float64) ([]model.Device, error) {
	// 计算经纬度范围
	latRange := radius / earthRadius * (180.0 / math.Pi)
	lonRange := latRange / math.Cos(lat*math.Pi/180.0)

	minLat := lat - latRange
	maxLat := lat + latRange
	minLon := lon - lonRange
	maxLon := lon + lonRange

	// 查询最后一次位置在范围内的设备
	var devices []model.Device
	err := database.GetDB().
		Table("devices").
		Joins("JOIN device_location_logs ON devices.id = device_location_logs.device_id").
		Where("device_location_logs.latitude BETWEEN ? AND ?", minLat, maxLat).
		Where("device_location_logs.longitude BETWEEN ? AND ?", minLon, maxLon).
		Group("devices.id").
		Find(&devices).Error

	if err != nil {
		return nil, err
	}

	// 计算实际距离并过滤
	var result []model.Device
	for _, device := range devices {
		lastLocation, err := GetDeviceLocation(device.ID)
		if err != nil {
			continue
		}

		distance := calculateDistance(lat, lon, lastLocation.Location.Latitude, lastLocation.Location.Longitude)
		if distance <= radius {
			result = append(result, device)
		}
	}

	return result, nil
}

// GetDeviceLocation 获取设备位置信息
func GetDeviceLocation(deviceID string) (*model.DeviceLocationLog, error) {
	var log model.DeviceLocationLog
	err := database.GetDB().
		Where("device_id = ?", deviceID).
		Order("timestamp DESC").
		First(&log).Error
	if err != nil {
		return nil, err
	}
	return &log, nil
}

// calculateDistance 计算两点之间的距离（单位：公里）
func calculateDistance(lat1, lon1, lat2, lon2 float64) float64 {
	lat1Rad := lat1 * math.Pi / 180.0
	lat2Rad := lat2 * math.Pi / 180.0
	lon1Rad := lon1 * math.Pi / 180.0
	lon2Rad := lon2 * math.Pi / 180.0

	diffLat := lat2Rad - lat1Rad
	diffLon := lon2Rad - lon1Rad

	a := math.Sin(diffLat/2)*math.Sin(diffLat/2) +
		math.Cos(lat1Rad)*math.Cos(lat2Rad)*
			math.Sin(diffLon/2)*math.Sin(diffLon/2)
	c := 2 * math.Atan2(math.Sqrt(a), math.Sqrt(1-a))

	return earthRadius * c
}
