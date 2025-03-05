// service/setting.go
package service

import (
	"LVerity/pkg/common"
	"LVerity/pkg/database"
	"LVerity/pkg/model"
	"errors"
	"time"
)

var (
	// 设置相关错误
	ErrSettingNotFound = errors.New("设置不存在")
	ErrSettingKeyTaken = errors.New("设置键已被使用")
	ErrInvalidSettingType = errors.New("无效的设置类型")
)

// GetSetting 通过键获取设置
func GetSetting(key string) (*model.Setting, error) {
	var setting model.Setting
	if err := database.GetDB().Where("key = ?", key).First(&setting).Error; err != nil {
		return nil, ErrSettingNotFound
	}
	return &setting, nil
}

// GetSettingsByType 获取指定类型的所有设置
func GetSettingsByType(settingType model.SettingType) ([]model.Setting, error) {
	if !settingType.IsValid() {
		return nil, ErrInvalidSettingType
	}

	var settings []model.Setting
	if err := database.GetDB().Where("type = ?", settingType).Find(&settings).Error; err != nil {
		return nil, err
	}
	return settings, nil
}

// GetAllSettings 获取所有设置
func GetAllSettings() ([]model.Setting, error) {
	var settings []model.Setting
	if err := database.GetDB().Find(&settings).Error; err != nil {
		return nil, err
	}
	return settings, nil
}

// CreateSetting 创建设置
func CreateSetting(key string, value model.JSONValue, settingType model.SettingType, description string) (*model.Setting, error) {
	// 验证设置类型
	if !settingType.IsValid() {
		return nil, ErrInvalidSettingType
	}

	// 检查键是否已存在
	exists, err := checkSettingKeyExists(key)
	if err != nil {
		return nil, err
	}
	if exists {
		return nil, ErrSettingKeyTaken
	}

	// 创建设置
	setting := &model.Setting{
		ID:          "set-" + common.GenerateUUID(),
		Key:         key,
		Value:       value,
		Type:        settingType,
		Description: description,
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}

	if err := database.GetDB().Create(setting).Error; err != nil {
		return nil, err
	}

	return setting, nil
}

// UpdateSetting 更新设置
func UpdateSetting(key string, value model.JSONValue, description string) (*model.Setting, error) {
	// 获取设置
	setting, err := GetSetting(key)
	if err != nil {
		return nil, err
	}

	// 更新设置
	setting.Value = value
	if description != "" {
		setting.Description = description
	}
	setting.UpdatedAt = time.Now()

	if err := database.GetDB().Save(setting).Error; err != nil {
		return nil, err
	}

	return setting, nil
}

// DeleteSetting 删除设置
func DeleteSetting(key string) error {
	result := database.GetDB().Where("key = ?", key).Delete(&model.Setting{})
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return ErrSettingNotFound
	}
	return nil
}

// checkSettingKeyExists 检查设置键是否已存在
func checkSettingKeyExists(key string) (bool, error) {
	var count int64
	if err := database.GetDB().Model(&model.Setting{}).Where("key = ?", key).Count(&count).Error; err != nil {
		return false, err
	}
	return count > 0, nil
}

// InitDefaultSettings 初始化默认设置
func InitDefaultSettings() error {
	// 查询是否已有设置
	var count int64
	if err := database.GetDB().Model(&model.Setting{}).Count(&count).Error; err != nil {
		return err
	}

	// 如果已有设置，则不初始化
	if count > 0 {
		return nil
	}

	// 默认设置列表
	defaultSettings := []struct {
		Key         string
		Value       model.JSONValue
		Type        model.SettingType
		Description string
	}{
		{
			Key: "system.name",
			Value: model.JSONValue{
				"value": "LVerity许可证验证系统",
			},
			Type:        model.SettingTypeSystem,
			Description: "系统名称",
		},
		{
			Key: "system.maintenance",
			Value: model.JSONValue{
				"enabled": false,
				"message": "系统正在维护中，请稍后重试",
			},
			Type:        model.SettingTypeSystem,
			Description: "系统维护模式",
		},
		{
			Key: "ui.theme",
			Value: model.JSONValue{
				"mode":        "light",
				"primaryColor": "#1890ff",
			},
			Type:        model.SettingTypeUI,
			Description: "UI主题设置",
		},
		{
			Key: "alert.email",
			Value: model.JSONValue{
				"enabled": true,
				"recipients": []string{"admin@example.com"},
			},
			Type:        model.SettingTypeAlert,
			Description: "邮件告警设置",
		},
		{
			Key: "security.password",
			Value: model.JSONValue{
				"minLength": 8,
				"requireUppercase": true,
				"requireNumber": true,
				"requireSpecialChar": true,
			},
			Type:        model.SettingTypeSecurity,
			Description: "密码安全策略",
		},
	}

	// 创建默认设置
	for _, ds := range defaultSettings {
		_, err := CreateSetting(ds.Key, ds.Value, ds.Type, ds.Description)
		if err != nil {
			return err
		}
	}

	return nil
}
