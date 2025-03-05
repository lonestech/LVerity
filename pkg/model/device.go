// model/device.go
package model

import (
	"time"

	"gorm.io/gorm"
)

// DeviceStatus 设备状态常量
const (
	DeviceStatusNormal   = "normal"   // 正常
	DeviceStatusOffline  = "offline"  // 离线
	DeviceStatusBlocked  = "blocked"  // 已封禁
	DeviceStatusSuspect  = "suspect"  // 可疑
	DeviceStatusDisabled = "disabled" // 已禁用
	DeviceStatusUnknown  = "unknown"  // 未知状态
	DeviceStatusInactive = "inactive" // 已停用
)

// UsageStats 设备使用统计
type UsageStats struct {
	LastActiveDate    time.Time `json:"last_active_date"`
	TotalUsageTime    int64     `json:"total_usage_time"`
	AverageUsageTime  int64     `json:"average_usage_time"`
	PeakUsageTime     int64     `json:"peak_usage_time"`
	DailyActiveCount  int       `json:"daily_active_count"`
	WeeklyActiveCount int       `json:"weekly_active_count"`
}

// Device 设备信息
type Device struct {
	ID              string         `gorm:"primaryKey;type:varchar(191)" json:"id"`
	Name            string         `gorm:"type:varchar(191)" json:"name"`
	Type            string         `gorm:"type:varchar(50)" json:"type"`
	Status          string         `gorm:"type:varchar(20)" json:"status"`
	Description     string         `gorm:"type:text" json:"description"`
	DiskID          string         `gorm:"column:disk_id;type:varchar(191)" json:"disk_id"`
	BIOS            string         `gorm:"column:bios;type:varchar(191)" json:"bios"`
	Motherboard     string         `gorm:"column:motherboard;type:varchar(191)" json:"motherboard"`
	NetworkCards    string         `gorm:"column:network_cards;type:text" json:"network_cards"`
	DisplayCard     string         `gorm:"column:display_card;type:varchar(191)" json:"display_card"`
	Resolution      string         `gorm:"column:resolution;type:varchar(50)" json:"resolution"`
	Timezone        string         `gorm:"column:timezone;type:varchar(50)" json:"timezone"`
	Language        string         `gorm:"column:language;type:varchar(50)" json:"language"`
	GroupID         string         `gorm:"column:group_id;type:varchar(191)" json:"group_id"`
	Group           *DeviceGroup   `gorm:"foreignKey:GroupID" json:"group,omitempty"`
	BlockReason     string         `gorm:"column:block_reason;type:text" json:"block_reason"`
	BlockTime       *time.Time     `gorm:"column:block_time" json:"block_time"`
	UnblockTime     *time.Time     `gorm:"column:unblock_time" json:"unblock_time"`
	RiskLevel       float64        `gorm:"column:risk_level;default:0" json:"risk_level"`
	LastAlertTime   *time.Time     `gorm:"column:last_alert_time" json:"last_alert_time"`
	AlertCount      int            `gorm:"column:alert_count;default:0" json:"alert_count"`
	HeartbeatRate   int            `gorm:"column:heartbeat_rate;default:60" json:"heartbeat_rate"`
	LastHeartbeat   *time.Time     `gorm:"column:last_heartbeat" json:"last_heartbeat"`
	LastSeen        *time.Time     `gorm:"column:last_seen" json:"last_seen"`
	LastCommandAt   *time.Time     `gorm:"column:last_command_at" json:"last_command_at"`
	LastCommand     string         `gorm:"column:last_command;type:varchar(50)" json:"last_command"`
	LicenseID       string         `gorm:"column:license_id;type:varchar(191)" json:"license_id"`
	UsageStats      *UsageStats    `gorm:"-" json:"usage_stats,omitempty"`
	Metadata        string         `gorm:"column:metadata;type:text" json:"metadata"`
	CreatedAt       time.Time      `gorm:"type:timestamp" json:"created_at"`
	UpdatedAt       time.Time      `gorm:"type:timestamp" json:"updated_at"`
	DeletedAt       gorm.DeletedAt `gorm:"index" json:"-"`
}

// DeviceGroup 设备组
type DeviceGroup struct {
	ID          string         `gorm:"primaryKey;type:varchar(191)" json:"id"`
	Name        string         `gorm:"type:varchar(191);not null" json:"name"`
	Description string         `gorm:"type:text" json:"description"`
	Devices     []Device       `gorm:"foreignKey:GroupID" json:"devices,omitempty"`
	CreatedAt   time.Time      `gorm:"type:timestamp;not null" json:"created_at"`
	UpdatedAt   time.Time      `gorm:"type:timestamp;not null" json:"updated_at"`
	CreatedBy   string         `gorm:"type:varchar(191)" json:"created_by"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
}

// BlacklistRule 黑名单规则
type BlacklistRule struct {
	ID          string         `gorm:"primaryKey;type:varchar(191)" json:"id"`
	Type        string         `gorm:"type:varchar(50);not null" json:"type"`
	Pattern     string         `gorm:"type:varchar(191);not null" json:"pattern"`
	Description string         `gorm:"type:text" json:"description"`
	CreatedAt   time.Time      `gorm:"type:timestamp;not null" json:"created_at"`
	UpdatedAt   time.Time      `gorm:"type:timestamp;not null" json:"updated_at"`
	CreatedBy   string         `gorm:"type:varchar(191)" json:"created_by"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
}

// AbnormalBehavior 异常行为记录
type AbnormalBehavior struct {
	ID          string         `gorm:"primaryKey;type:varchar(191)" json:"id"`
	DeviceID    string         `gorm:"type:varchar(191);not null" json:"device_id"`
	Device      *Device        `gorm:"foreignKey:DeviceID" json:"device,omitempty"`
	Type        string         `gorm:"type:varchar(50);not null" json:"type"`
	Description string         `gorm:"type:text" json:"description"`
	Level       string         `gorm:"type:varchar(20);not null" json:"level"`
	Data        string         `gorm:"type:text" json:"data"`
	CreatedAt   time.Time      `gorm:"type:timestamp;not null" json:"created_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
}

// DeviceStats 设备统计信息
type DeviceStats struct {
	Total        int64   `json:"total"`
	Online       int64   `json:"online"`
	Offline      int64   `json:"offline"`
	Blocked      int64   `json:"blocked"`
	Suspect      int64   `json:"suspect"`
	HighRisk     int64   `json:"high_risk"`
	TotalCount   int64   `json:"total_count"`
	ActiveCount  int64   `json:"active_count"`
	OfflineCount int64   `json:"offline_count"`
	BlockedCount int64   `json:"blocked_count"`
	OnlineRate   float64 `json:"online_rate"`
}

// DeviceLocation 设备位置信息
type DeviceLocation struct {
	ID        uint           `gorm:"primarykey" json:"id"`
	DeviceID  string         `gorm:"index" json:"device_id"`
	IP        string         `json:"ip"`
	Country   string         `json:"country"`
	Region    string         `json:"region"`
	City      string         `json:"city"`
	Latitude  float64        `json:"latitude"`
	Longitude float64        `json:"longitude"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

// TableName 指定表名
func (Device) TableName() string {
	return "devices"
}
