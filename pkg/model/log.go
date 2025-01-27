package model

import (
	"time"
)

// LogLevel 日志级别
type LogLevel string

const (
	LogLevelInfo    LogLevel = "info"
	LogLevelWarning LogLevel = "warning"
	LogLevelError   LogLevel = "error"
)

// OperationLog 操作日志
type OperationLog struct {
	ID        string    `json:"id" gorm:"primaryKey"`
	UserID    string    `json:"user_id"`
	Username  string    `json:"username"`
	Action    string    `json:"action"`
	Resource  string    `json:"resource"`
	ResourceID string   `json:"resource_id"`
	Detail    string    `json:"detail"`
	IP        string    `json:"ip"`
	CreatedAt time.Time `json:"created_at"`
}

// SystemLog 系统日志
type SystemLog struct {
	ID        string    `json:"id" gorm:"primaryKey"`
	Level     LogLevel  `json:"level"`
	Module    string    `json:"module"`
	Message   string    `json:"message"`
	Detail    string    `json:"detail"`
	CreatedAt time.Time `json:"created_at"`
}

// DeviceLog 设备日志
type DeviceLog struct {
	ID             string    `json:"id" gorm:"primaryKey"`
	DeviceID       string    `json:"device_id" gorm:"index"`
	Type           string    `json:"type"`            // 日志类型
	Level          LogLevel  `json:"level"`           // 日志级别
	Message        string    `json:"message"`         // 日志内容
	Source         string    `json:"source"`          // 日志来源
	Timestamp      time.Time `json:"timestamp"`       // 时间戳
	AdditionalInfo string    `json:"additional_info"` // 附加信息
}
