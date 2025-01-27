package model

import (
	"time"
)

// Location 位置信息
type Location struct {
	Latitude  float64 `json:"latitude"`
	Longitude float64 `json:"longitude"`
	Country   string  `json:"country"`
	City      string  `json:"city"`
}

// DeviceLocationLog 设备位置日志
type DeviceLocationLog struct {
	ID        string    `gorm:"primaryKey" json:"id"`
	DeviceID  string    `gorm:"index" json:"device_id"`
	Location  Location  `gorm:"embedded" json:"location"`
	Timestamp time.Time `json:"timestamp"`
}
