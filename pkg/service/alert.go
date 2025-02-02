package service

import (
	"LVerity/pkg/database"
	"LVerity/pkg/model"
	"LVerity/pkg/utils"
	"fmt"
	"sync"
	"time"
)

// AlertHandler 告警处理函数类型
type AlertHandler func(alert *model.Alert) error

// AlertManager 告警管理器
type AlertManager struct {
	handlers map[string]AlertHandler
	mu       sync.RWMutex
}

// NewAlertManager 创建告警管理器
func NewAlertManager() *AlertManager {
	return &AlertManager{
		handlers: make(map[string]AlertHandler),
	}
}

// RegisterHandler 注册告警处理函数
func (am *AlertManager) RegisterHandler(title string, handler AlertHandler) {
	am.mu.Lock()
	defer am.mu.Unlock()
	am.handlers[title] = handler
}

// GetHandler 获取告警处理函数
func (am *AlertManager) GetHandler(title string) (AlertHandler, bool) {
	am.mu.RLock()
	defer am.mu.RUnlock()
	handler, ok := am.handlers[title]
	return handler, ok
}

// HandleAlert 处理告警
func (am *AlertManager) HandleAlert(alert *model.Alert) error {
	handler, ok := am.GetHandler(alert.Title)
	if !ok {
		return fmt.Errorf("no handler registered for alert title: %s", alert.Title)
	}
	return handler(alert)
}

// CreateAlert 创建告警
func CreateAlert(deviceID string, title string, level model.AlertLevel, description string, metadata string) (*model.Alert, error) {
	// 获取设备信息
	device, err := GetDevice(deviceID)
	if err != nil {
		return nil, fmt.Errorf("failed to get device: %v", err)
	}

	// 创建告警记录
	alert := &model.Alert{
		ID:          utils.GenerateUUID(),
		Title:       title,
		Level:       level,
		DeviceID:    deviceID,
		Description: description,
		Status:      model.AlertStatusOpen,
		Metadata:    metadata,
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}

	if err := database.GetDB().Create(alert).Error; err != nil {
		return nil, fmt.Errorf("failed to create alert: %v", err)
	}

	// 更新设备告警信息
	now := time.Now()
	device.LastAlertTime = &now
	device.AlertCount++
	if err := database.GetDB().Save(device).Error; err != nil {
		return nil, fmt.Errorf("failed to update device alert info: %v", err)
	}

	return alert, nil
}

// GetAlert 获取告警信息
func GetAlert(alertID string) (*model.Alert, error) {
	var alert model.Alert
	if err := database.GetDB().Where("id = ?", alertID).First(&alert).Error; err != nil {
		return nil, fmt.Errorf("failed to get alert: %v", err)
	}
	return &alert, nil
}

// GetAlerts 获取告警记录
func GetAlerts(deviceID string, startTime, endTime time.Time) ([]model.Alert, error) {
	query := database.GetDB().Where("created_at BETWEEN ? AND ?", startTime, endTime)
	if deviceID != "" {
		query = query.Where("device_id = ?", deviceID)
	}

	var alerts []model.Alert
	if err := query.Find(&alerts).Error; err != nil {
		return nil, fmt.Errorf("failed to get alerts: %v", err)
	}
	return alerts, nil
}

// GetAlertsByDevice 获取设备的告警记录
func GetAlertsByDevice(deviceID string) ([]model.Alert, error) {
	var alerts []model.Alert
	if err := database.GetDB().Where("device_id = ?", deviceID).Find(&alerts).Error; err != nil {
		return nil, fmt.Errorf("failed to get alerts: %v", err)
	}
	return alerts, nil
}

// GetAlertsByStatus 获取指定状态的告警记录
func GetAlertsByStatus(status model.AlertStatus) ([]model.Alert, error) {
	var alerts []model.Alert
	if err := database.GetDB().Where("status = ?", status).Find(&alerts).Error; err != nil {
		return nil, fmt.Errorf("failed to get alerts: %v", err)
	}
	return alerts, nil
}

// UpdateAlertStatus 更新告警状态
func UpdateAlertStatus(alertID string, status model.AlertStatus) error {
	alert, err := GetAlert(alertID)
	if err != nil {
		return err
	}

	alert.Status = status
	alert.UpdatedAt = time.Now()

	if err := database.GetDB().Save(alert).Error; err != nil {
		return fmt.Errorf("failed to update alert status: %v", err)
	}

	return nil
}

// UpdateAlertDescription 更新告警描述
func UpdateAlertDescription(alertID string, description string) error {
	alert, err := GetAlert(alertID)
	if err != nil {
		return err
	}

	alert.Description = description
	alert.UpdatedAt = time.Now()

	if err := database.GetDB().Save(alert).Error; err != nil {
		return fmt.Errorf("failed to update alert description: %v", err)
	}

	return nil
}

// DeleteAlert 删除告警记录
func DeleteAlert(alertID string) error {
	if err := database.GetDB().Delete(&model.Alert{}, "id = ?", alertID).Error; err != nil {
		return fmt.Errorf("failed to delete alert: %v", err)
	}
	return nil
}

// GetAlertCount 获取告警数量
func GetAlertCount(deviceID string, status model.AlertStatus) (int64, error) {
	query := database.GetDB().Model(&model.Alert{})
	if deviceID != "" {
		query = query.Where("device_id = ?", deviceID)
	}
	if status != "" {
		query = query.Where("status = ?", status)
	}

	var count int64
	if err := query.Count(&count).Error; err != nil {
		return 0, fmt.Errorf("failed to get alert count: %v", err)
	}

	return count, nil
}

// GetAlertsByLevel 获取指定级别的告警记录
func GetAlertsByLevel(level model.AlertLevel) ([]model.Alert, error) {
	var alerts []model.Alert
	if err := database.GetDB().Where("level = ?", level).Find(&alerts).Error; err != nil {
		return nil, fmt.Errorf("failed to get alerts: %v", err)
	}
	return alerts, nil
}

// GetAlertsByTimeRange 获取指定时间范围内的告警记录
func GetAlertsByTimeRange(startTime, endTime time.Time) ([]model.Alert, error) {
	var alerts []model.Alert
	if err := database.GetDB().Where("created_at BETWEEN ? AND ?", startTime, endTime).Find(&alerts).Error; err != nil {
		return nil, fmt.Errorf("failed to get alerts: %v", err)
	}
	return alerts, nil
}

// GetActiveAlerts 获取活动告警记录
func GetActiveAlerts() ([]model.Alert, error) {
	return GetAlertsByStatus(model.AlertStatusOpen)
}

// GetResolvedAlerts 获取已解决的告警记录
func GetResolvedAlerts() ([]model.Alert, error) {
	return GetAlertsByStatus(model.AlertStatusResolved)
}

// CheckAlertRules 检查告警规则
func CheckAlertRules(device *model.Device) error {
	// 获取设备的所有规则
	var rules []model.AlertRule
	if err := database.GetDB().Where("device_id = ? OR device_id = ''", device.ID).Find(&rules).Error; err != nil {
		return fmt.Errorf("failed to get alert rules: %v", err)
	}

	// 检查每个规则
	for _, rule := range rules {
		// 根据规则类型执行检查
		switch rule.Type {
		case model.AlertRuleTypeThreshold:
			// 检查阈值规则
			if err := checkThresholdRule(device, &rule); err != nil {
				return err
			}
		case model.AlertRuleTypePattern:
			// 检查模式规则
			if err := checkPatternRule(device, &rule); err != nil {
				return err
			}
		case model.AlertRuleTypeAnomaly:
			// 检查异常规则
			if err := checkAnomalyRule(device, &rule); err != nil {
				return err
			}
		}
	}

	return nil
}

// 检查阈值规则
func checkThresholdRule(device *model.Device, rule *model.AlertRule) error {
	// TODO: 实现阈值规则检查
	return nil
}

// 检查模式规则
func checkPatternRule(device *model.Device, rule *model.AlertRule) error {
	// TODO: 实现模式规则检查
	return nil
}

// 检查异常规则
func checkAnomalyRule(device *model.Device, rule *model.AlertRule) error {
	// TODO: 实现异常规则检查
	return nil
}
