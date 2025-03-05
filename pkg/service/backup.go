// pkg/service/backup.go
package service

import (
	"LVerity/pkg/common"
	"LVerity/pkg/database"
	"LVerity/pkg/model"
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"time"
)

// ErrBackupNotFound 备份未找到错误
var ErrBackupNotFound = errors.New("备份未找到")

// GetAllBackups 获取所有备份
func GetAllBackups() ([]model.SystemBackup, error) {
	var backups []model.SystemBackup
	err := database.DB.Find(&backups).Error
	return backups, err
}

// GetBackupByID 根据ID获取备份
func GetBackupByID(id string) (*model.SystemBackup, error) {
	var backup model.SystemBackup
	err := database.DB.Where("id = ?", id).First(&backup).Error
	if err != nil {
		return nil, ErrBackupNotFound
	}
	return &backup, nil
}

// CreateBackup 创建新备份
func CreateBackup(name, description string, backupType model.BackupType, createdBy string) (*model.SystemBackup, error) {
	// 确保备份目录存在
	backupDir := getBackupDir()
	if err := os.MkdirAll(backupDir, 0755); err != nil {
		return nil, fmt.Errorf("创建备份目录失败: %w", err)
	}

	// 生成备份文件名
	timestamp := time.Now().Format("20060102_150405")
	fileName := fmt.Sprintf("backup_%s_%s.zip", name, timestamp)
	filePath := filepath.Join(backupDir, fileName)

	// 创建备份记录
	backup := model.SystemBackup{
		ID:          common.GenerateUUID(),
		Name:        name,
		Description: description,
		Type:        backupType,
		Status:      model.BackupStatusRunning,
		FilePath:    filePath,
		CreatedBy:   createdBy,
		CreatedAt:   time.Now(),
	}

	// 保存备份记录到数据库
	if err := database.DB.Create(&backup).Error; err != nil {
		return nil, err
	}

	// TODO: 在实际生产环境中，这里应该启动一个goroutine来执行实际备份操作
	// 目前简单模拟完成备份过程
	go func() {
		// 模拟备份过程
		time.Sleep(2 * time.Second)
		
		// 更新备份状态为已完成
		now := time.Now()
		backup.Status = model.BackupStatusCompleted
		backup.CompletedAt = &now
		backup.FileSize = 1024 * 1024 * 10 // 模拟10MB大小
		backup.Duration = 2                 // 2秒
		
		database.DB.Save(&backup)
	}()

	return &backup, nil
}

// DeleteBackup 删除备份
func DeleteBackup(id string) error {
	backup, err := GetBackupByID(id)
	if err != nil {
		return err
	}

	// 删除物理文件
	if _, err := os.Stat(backup.FilePath); err == nil {
		if err := os.Remove(backup.FilePath); err != nil {
			return fmt.Errorf("删除备份文件失败: %w", err)
		}
	}

	// 从数据库中删除记录
	return database.DB.Delete(&model.SystemBackup{}, "id = ?", id).Error
}

// GetBackupConfig 获取备份配置
func GetBackupConfig() (*model.BackupConfig, error) {
	var config model.BackupConfig
	err := database.DB.First(&config).Error
	if err != nil {
		// 如果不存在，创建默认配置
		config = model.BackupConfig{
			ID:              common.GenerateUUID(),
			AutoBackup:      true,
			BackupPath:      getBackupDir(),
			Schedule:        "0 0 * * *", // 每天凌晨备份
			RetentionCount:  10,
			RetentionDays:   30,
			CompressBackup:  true,
			IncludeDatabase: true,
			IncludeFiles:    true,
			IncludeLogs:     true,
			CreatedAt:       time.Now(),
			UpdatedAt:       time.Now(),
		}
		database.DB.Create(&config)
		return &config, nil
	}
	return &config, nil
}

// UpdateBackupConfig 更新备份配置
func UpdateBackupConfig(config model.BackupConfig) (*model.BackupConfig, error) {
	var existingConfig model.BackupConfig
	err := database.DB.First(&existingConfig).Error
	if err != nil {
		// 如果不存在，创建新配置
		config.ID = common.GenerateUUID()
		config.CreatedAt = time.Now()
		config.UpdatedAt = time.Now()
		if err := database.DB.Create(&config).Error; err != nil {
			return nil, err
		}
		return &config, nil
	}

	// 更新现有配置
	config.ID = existingConfig.ID
	config.CreatedAt = existingConfig.CreatedAt
	config.UpdatedAt = time.Now()
	if err := database.DB.Save(&config).Error; err != nil {
		return nil, err
	}
	return &config, nil
}

// getBackupDir 获取备份目录
func getBackupDir() string {
	// 这里可以从系统配置中获取，暂时使用固定目录
	return "./backups"
}
