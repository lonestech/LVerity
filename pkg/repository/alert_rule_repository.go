package repository

import (
	"LVerity/pkg/database"
	"LVerity/pkg/model"
)

// AlertRuleRepository 告警规则仓库
type AlertRuleRepository struct{}

// NewAlertRuleRepository 创建告警规则仓库实例
func NewAlertRuleRepository() *AlertRuleRepository {
	return &AlertRuleRepository{}
}

// GetByID 通过ID获取告警规则
func (r *AlertRuleRepository) GetByID(id string) (*model.AlertRule, error) {
	var rule model.AlertRule
	result := database.GetDB().Where("id = ?", id).First(&rule)
	if result.Error != nil {
		return nil, result.Error
	}
	return &rule, nil
}

// GetByDevice 获取设备的告警规则
func (r *AlertRuleRepository) GetByDevice(deviceID string) ([]model.AlertRule, error) {
	var rules []model.AlertRule
	result := database.GetDB().Where("device_id = ? OR device_id = ''", deviceID).Find(&rules)
	if result.Error != nil {
		return nil, result.Error
	}
	return rules, nil
}

// Create 创建告警规则
func (r *AlertRuleRepository) Create(rule *model.AlertRule) error {
	return database.GetDB().Create(rule).Error
}

// Update 更新告警规则
func (r *AlertRuleRepository) Update(rule *model.AlertRule) error {
	return database.GetDB().Save(rule).Error
}

// Delete 删除告警规则
func (r *AlertRuleRepository) Delete(id string) error {
	return database.GetDB().Delete(&model.AlertRule{}, "id = ?", id).Error
}

// List 获取告警规则列表
func (r *AlertRuleRepository) List(page, pageSize int) ([]model.AlertRule, int64, error) {
	var rules []model.AlertRule
	var total int64

	tx := database.GetDB().Model(&model.AlertRule{})
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
