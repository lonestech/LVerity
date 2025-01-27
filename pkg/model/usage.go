package model

import (
	"time"
)

// UsageRecord 使用记录
type UsageRecord struct {
	ID         string    `gorm:"primaryKey" json:"id"`
	DeviceID   string    `gorm:"index" json:"device_id"`
	StartTime  time.Time `json:"start_time"`
	EndTime    time.Time `json:"end_time"`
	Duration   int64     `json:"duration"` // 持续时间（秒）
	SessionID  string    `json:"session_id"`
	IP         string    `json:"ip"`
	UserAgent  string    `json:"user_agent"`
	CreatedAt  time.Time `json:"created_at"`
}

// UsageReport 使用报告
type UsageReport struct {
	DeviceID     string        `json:"device_id"`
	StartTime    time.Time     `json:"start_time"`
	EndTime      time.Time     `json:"end_time"`
	TotalTime    int64         `json:"total_time"` // 总使用时长（秒）
	SessionCount int           `json:"session_count"`
	Records      []UsageRecord `json:"records"`
}

// LogExportFormat 日志导出格式
type LogExportFormat string

const (
	LogExportFormatCSV  LogExportFormat = "csv"
	LogExportFormatJSON LogExportFormat = "json"
)
