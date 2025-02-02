package model

import (
	"LVerity/pkg/common"
	"time"

	"gorm.io/gorm"
)

// AlertRuleType 告警规则类型
type AlertRuleType string

const (
	AlertRuleTypeThreshold AlertRuleType = "threshold" // 阈值规则
	AlertRuleTypePattern   AlertRuleType = "pattern"   // 模式规则
	AlertRuleTypeAnomaly   AlertRuleType = "anomaly"   // 异常规则
)

// AlertRule 告警规则
type AlertRule struct {
	ID          string        `json:"id" gorm:"primaryKey;type:varchar(191)"`
	Name        string        `json:"name" gorm:"type:varchar(191);not null"`
	Type        AlertRuleType `json:"type" gorm:"type:varchar(20);not null"`
	DeviceID    string        `json:"device_id" gorm:"type:varchar(191);index"`
	Conditions  string        `json:"conditions" gorm:"type:text"`
	Actions     string        `json:"actions" gorm:"type:text"`
	Description string        `json:"description" gorm:"type:text"`
	Enabled     bool          `json:"enabled" gorm:"default:true"`
	CreatedAt   time.Time     `json:"created_at"`
	UpdatedAt   time.Time     `json:"updated_at"`
}

// BeforeCreate GORM 创建钩子
func (r *AlertRule) BeforeCreate(tx *gorm.DB) error {
	if r.ID == "" {
		r.ID = common.GenerateUUID()
	}
	r.CreatedAt = time.Now()
	r.UpdatedAt = time.Now()
	return nil
}

// BeforeUpdate GORM 更新钩子
func (r *AlertRule) BeforeUpdate(tx *gorm.DB) error {
	r.UpdatedAt = time.Now()
	return nil
}
