// model/license.go
package model

import (
	"time"
)

// LicenseType 授权类型
type LicenseType string

const (
	LicenseTypeBasic    LicenseType = "basic"    // 基础版
	LicenseTypeStandard LicenseType = "standard" // 标准版
	LicenseTypePro      LicenseType = "pro"      // 专业版
	LicenseTypeEnterprise LicenseType = "enterprise"
	LicenseTypeTrial      LicenseType = "trial"    // 试用授权码
	LicenseTypeOfficial   LicenseType = "official" // 正式授权码
	LicenseTypePay        LicenseType = "pay"      // 按量付费授权码
	LicenseTypeModule     LicenseType = "module"   // 功能模块授权码
)

// LicenseStatus 授权状态
type LicenseStatus string

const (
	LicenseStatusUnused    LicenseStatus = "unused"    // 未使用
	LicenseStatusUsed      LicenseStatus = "used"      // 已使用
	LicenseStatusDisabled  LicenseStatus = "disabled"  // 已禁用
	LicenseStatusExpired   LicenseStatus = "expired"   // 已过期
	LicenseStatusRevoked   LicenseStatus = "revoked"   // 已撤销
	LicenseStatusTransferred LicenseStatus = "transferred" // 已转移
	LicenseStatusActive   LicenseStatus = "active"
	LicenseStatusInactive LicenseStatus = "inactive"
)

// LicenseGroup 授权组
type LicenseGroup struct {
	ID          string    `json:"id" gorm:"primaryKey"`
	Name        string    `json:"name" gorm:"type:varchar(191)"`
	Description string    `json:"description" gorm:"type:text"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
	CreatedBy   string    `json:"created_by" gorm:"type:varchar(191)"`
}

// LicenseTag 授权标签
type LicenseTag struct {
	ID        string       `json:"id" gorm:"primaryKey;type:varchar(36)"`
	Name      string       `json:"name" gorm:"type:varchar(191)"`
	Color     string       `json:"color" gorm:"type:varchar(50)"`
	CreatedAt time.Time    `json:"created_at"`
	UpdatedAt time.Time    `json:"updated_at"`
	Licenses  []License    `json:"licenses" gorm:"many2many:license_tag_mapping;joinForeignKey:tag_id;joinReferences:license_id"`
}

// LicenseTagMapping 授权标签映射
type LicenseTagMapping struct {
	LicenseID string    `json:"license_id" gorm:"primaryKey;type:varchar(36)"`
	TagID     string    `json:"tag_id" gorm:"primaryKey;type:varchar(36)"`
	CreatedAt time.Time `json:"created_at"`
}

// License 授权记录
type License struct {
	ID          string        `json:"id" gorm:"primaryKey"`
	Code        string        `json:"code" gorm:"uniqueIndex:idx_license_code,length:191;type:varchar(191)"`
	Type        LicenseType   `json:"type" gorm:"type:varchar(20)"`
	Status      LicenseStatus `json:"status" gorm:"type:varchar(20)"`
	DeviceID    string        `json:"device_id" gorm:"type:varchar(191);index"`
	MaxDevices  int           `json:"max_devices"`
	StartTime   time.Time     `json:"start_time"`
	ExpireTime  time.Time     `json:"expire_time"`
	CreatedAt   time.Time     `json:"created_at"`
	UpdatedAt   time.Time     `json:"updated_at"`
	Description string        `json:"description" gorm:"type:text"`
	Deleted     bool          `json:"deleted" gorm:"default:false"`
	CreatedBy   string        `json:"created_by" gorm:"type:varchar(191)"`
	UpdatedBy   string        `json:"updated_by" gorm:"type:varchar(191)"`
	DeletedAt   *time.Time    `json:"deleted_at,omitempty" gorm:"index"`
	GroupID     string        `json:"group_id" gorm:"type:varchar(191);index"` // 新增：授权组ID
	Tags        []LicenseTag  `json:"tags" gorm:"many2many:license_tag_mapping;joinForeignKey:license_id;joinReferences:tag_id"`
	Metadata    string        `json:"metadata" gorm:"type:text"` // 新增：JSON格式的元数据
	Features    []string      `json:"features" gorm:"-"` // 新增：支持的功能列表
	FeaturesStr string        `json:"-" gorm:"column:features;type:text"` // 存储Features的JSON字符串
	UsageLimit  int64         `json:"usage_limit" gorm:"default:0"` // 新增：使用次数限制，0表示无限制
	UsageCount  int64         `json:"usage_count" gorm:"default:0"` // 新增：已使用次数
}

// LicenseActivation 许可证激活记录
type LicenseActivation struct {
	ID          string    `json:"id" gorm:"primaryKey"`
	LicenseID   string    `json:"license_id" gorm:"index"`
	DeviceID    string    `json:"device_id" gorm:"index"`
	DeviceName  string    `json:"device_name" gorm:"-"` // 非数据库字段，用于关联查询
	ActivatedAt time.Time `json:"activated_at"`
	Status      string    `json:"status" gorm:"type:varchar(20)"`
	IPAddress   string    `json:"ip_address" gorm:"type:varchar(50)"`
	Location    string    `json:"location" gorm:"type:varchar(100)"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

// TableName 指定表名
func (LicenseActivation) TableName() string {
	return "license_activations"
}

// LicenseUsage 授权使用记录
type LicenseUsage struct {
	ID         string    `json:"id" gorm:"primaryKey"`
	LicenseID  string    `json:"license_id" gorm:"index"`
	DeviceID   string    `json:"device_id" gorm:"index"`
	StartTime  time.Time `json:"start_time"`
	EndTime    time.Time `json:"end_time"`
	Status     string    `json:"status"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
	Code           string        `json:"code"`
	Type           LicenseType   `json:"type"`
	MaxDevices     int           `json:"max_devices"`
	CurrentDevices int           `json:"current_devices"`
	RemainingDays  int           `json:"remaining_days"`
	DeviceCount    int       `json:"device_count"`     // 当前设备数
	IsExpired      bool      `json:"is_expired"`       // 是否过期
	LastUpdateTime time.Time `json:"last_update_time"` // 最后更新时间
}

// LicenseStats 授权统计信息
type LicenseStats struct {
	TotalCount   int64                       `json:"total_count"`   // 总授权数
	UsedCount    int64                       `json:"used_count"`    // 已使用数
	UnusedCount  int64                       `json:"unused_count"`  // 未使用数
	ExpiredCount int64                       `json:"expired_count"` // 已过期数
	TypeStats    map[LicenseType]int64       `json:"type_stats"`   // 各类型数量
}

// DeviceLocationStats 设备位置统计信息
type DeviceLocationStats struct {
	ProvinceStats map[string]int64 `json:"province_stats"` // 各省份设备数量
	CityStats     map[string]int64 `json:"city_stats"`     // 各城市设备数量
}

// TableName 指定表名
func (License) TableName() string {
	return "licenses"
}
