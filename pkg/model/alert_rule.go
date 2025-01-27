package model

import (
	"LVerity/pkg/common"
	"LVerity/pkg/store"
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
	ID          string       `json:"id" gorm:"primaryKey"`
	Title       string       `json:"title" gorm:"type:varchar(100)"`
	Type        AlertRuleType `json:"type" gorm:"type:varchar(20)"`
	DeviceID    string       `json:"device_id" gorm:"type:varchar(36);index"` // 空字符串表示适用于所有设备
	Condition   string       `json:"condition" gorm:"type:text"`              // JSON格式的条件配置
	Level       AlertLevel   `json:"level" gorm:"type:varchar(20)"`
	Description string       `json:"description" gorm:"type:text"`
	Enabled     bool         `json:"enabled" gorm:"default:true"`
	CreatedAt   time.Time    `json:"created_at"`
	UpdatedAt   time.Time    `json:"updated_at"`
}

// BeforeCreate GORM 创建钩子
func (r *AlertRule) BeforeCreate(tx *gorm.DB) error {
	if r.ID == "" {
		r.ID = common.GenerateUUID()
	}
	if r.CreatedAt.IsZero() {
		r.CreatedAt = time.Now()
	}
	if r.UpdatedAt.IsZero() {
		r.UpdatedAt = time.Now()
	}
	return nil
}

// BeforeUpdate GORM 更新钩子
func (r *AlertRule) BeforeUpdate(tx *gorm.DB) error {
	r.UpdatedAt = time.Now()
	return nil
}

// GetAlertRuleByID 通过ID获取告警规则
func GetAlertRuleByID(id string) (*AlertRule, error) {
	var rule AlertRule
	result := store.GetDB().Where("id = ?", id).First(&rule)
	if result.Error != nil {
		return nil, result.Error
	}
	return &rule, nil
}

// GetAlertRulesByDevice 获取设备的告警规则
func GetAlertRulesByDevice(deviceID string) ([]AlertRule, error) {
	var rules []AlertRule
	result := store.GetDB().Where("device_id = ? OR device_id = ''", deviceID).Find(&rules)
	if result.Error != nil {
		return nil, result.Error
	}
	return rules, nil
}

// CreateAlertRule 创建告警规则
func CreateAlertRule(rule *AlertRule) error {
	return store.GetDB().Create(rule).Error
}

// UpdateAlertRule 更新告警规则
func UpdateAlertRule(rule *AlertRule) error {
	return store.GetDB().Save(rule).Error
}

// DeleteAlertRule 删除告警规则
func DeleteAlertRule(id string) error {
	return store.GetDB().Delete(&AlertRule{}, "id = ?", id).Error
}

// ListAlertRules 获取告警规则列表
func ListAlertRules(page, pageSize int) ([]AlertRule, int64, error) {
	var rules []AlertRule
	var total int64

	tx := store.GetDB().Model(&AlertRule{})
	err := tx.Count(&total).Error
	if err != nil {
		return nil, 0, err
	}

	err = tx.Offset((page - 1) * pageSize).Limit(pageSize).Find(&rules).Error
	if err != nil {
		return nil, 0, err
	}

	return rules, total, nil
}
