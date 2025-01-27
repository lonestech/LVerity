package model

import "time"

// ExportFormat 导出格式
type ExportFormat string

const (
	ExportFormatCSV  ExportFormat = "csv"  // CSV格式
	ExportFormatJSON ExportFormat = "json" // JSON格式
)

// IsValid 检查导出格式是否有效
func (f ExportFormat) IsValid() bool {
	switch f {
	case ExportFormatCSV, ExportFormatJSON:
		return true
	default:
		return false
	}
}

// String 返回格式的字符串表示
func (f ExportFormat) String() string {
	return string(f)
}

// ContentType 返回对应的Content-Type
func (f ExportFormat) ContentType() string {
	switch f {
	case ExportFormatCSV:
		return "text/csv"
	case ExportFormatJSON:
		return "application/json"
	default:
		return "application/octet-stream"
	}
}

// LogExportOptions 日志导出选项
type LogExportOptions struct {
	StartTime time.Time    `json:"start_time"`
	EndTime   time.Time    `json:"end_time"`
	DeviceID  string      `json:"device_id"`
	Format    ExportFormat `json:"format"`
}
