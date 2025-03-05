// pkg/service/systemconfig.go
package service

import (
	"LVerity/pkg/common"
	"LVerity/pkg/database"
	"LVerity/pkg/model"
	"errors"
	"time"
)

// ErrConfigNotFound 配置未找到错误
var ErrConfigNotFound = errors.New("系统配置未找到")

// GetAllSystemConfigs 获取所有系统配置
func GetAllSystemConfigs() ([]model.SystemConfig, error) {
	var configs []model.SystemConfig
	err := database.DB.Find(&configs).Error
	return configs, err
}

// GetSystemConfigsByGroup 根据分组获取系统配置
func GetSystemConfigsByGroup(group string) ([]model.SystemConfig, error) {
	var configs []model.SystemConfig
	err := database.DB.Where("group = ?", group).Find(&configs).Error
	return configs, err
}

// GetSystemConfigByName 根据名称获取系统配置
func GetSystemConfigByName(name string) (*model.SystemConfig, error) {
	var config model.SystemConfig
	err := database.DB.Where("name = ?", name).First(&config).Error
	if err != nil {
		return nil, ErrConfigNotFound
	}
	return &config, nil
}

// CreateSystemConfig 创建系统配置
func CreateSystemConfig(name, value, description, group string, isSystem bool) (*model.SystemConfig, error) {
	// 检查配置名称是否已存在
	var count int64
	database.DB.Model(&model.SystemConfig{}).Where("name = ?", name).Count(&count)
	if count > 0 {
		return nil, errors.New("配置名称已存在")
	}

	config := model.SystemConfig{
		ID:          common.GenerateUUID(),
		Name:        name,
		Value:       value,
		Description: description,
		Group:       group,
		IsSystem:    isSystem,
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}

	if err := database.DB.Create(&config).Error; err != nil {
		return nil, err
	}
	return &config, nil
}

// UpdateSystemConfig 更新系统配置
func UpdateSystemConfig(name, value string) (*model.SystemConfig, error) {
	config, err := GetSystemConfigByName(name)
	if err != nil {
		return nil, err
	}

	// 更新配置值
	config.Value = value
	config.UpdatedAt = time.Now()

	if err := database.DB.Save(&config).Error; err != nil {
		return nil, err
	}
	return config, nil
}

// DeleteSystemConfig 删除系统配置
func DeleteSystemConfig(name string) error {
	config, err := GetSystemConfigByName(name)
	if err != nil {
		return err
	}

	// 检查是否是系统配置
	if config.IsSystem {
		return errors.New("不能删除系统配置")
	}

	return database.DB.Delete(&model.SystemConfig{}, "name = ?", name).Error
}

// InitDefaultSystemConfigs 初始化默认系统配置
func InitDefaultSystemConfigs() error {
	// 检查是否已有配置
	var count int64
	database.DB.Model(&model.SystemConfig{}).Count(&count)
	if count > 0 {
		return nil // 已有配置，不需要初始化
	}

	// 插入默认配置
	for _, config := range model.DefaultSystemConfigs {
		config.ID = common.GenerateUUID()
		config.CreatedAt = time.Now()
		config.UpdatedAt = time.Now()
		if err := database.DB.Create(&config).Error; err != nil {
			return err
		}
	}

	return nil
}
