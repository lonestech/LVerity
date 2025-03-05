// model/systeminfo.go
package model

import (
	"time"
)

// SystemInfo 系统信息模型
type SystemInfo struct {
	ID          string    `json:"id" gorm:"primaryKey"`
	Version     string    `json:"version" gorm:"type:varchar(50)"`     // 系统版本
	BuildNumber string    `json:"buildNumber" gorm:"type:varchar(50)"` // 构建版本号
	LastUpdate  time.Time `json:"lastUpdate"`                          // 最后更新时间
	ServerIP    string    `json:"serverIP" gorm:"type:varchar(50)"`    // 服务器IP
	ServerName  string    `json:"serverName" gorm:"type:varchar(100)"` // 服务器名称
	OSInfo      string    `json:"osInfo" gorm:"type:varchar(200)"`     // 操作系统信息
	CPUUsage    float64   `json:"cpuUsage"`                            // CPU使用率
	MemoryUsage float64   `json:"memoryUsage"`                         // 内存使用率
	DiskUsage   float64   `json:"diskUsage"`                           // 磁盘使用率
	Status      string    `json:"status" gorm:"type:varchar(20)"`      // 系统状态
	CreatedAt   time.Time `json:"createdAt"`                           // 创建时间
	UpdatedAt   time.Time `json:"updatedAt"`                           // 更新时间
}

// TableName 指定SystemInfo表名
func (SystemInfo) TableName() string {
	return "system_info"
}
