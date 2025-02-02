package service

import (
	"LVerity/pkg/database"
	"LVerity/pkg/model"
	"encoding/json"
	"time"

	"github.com/google/uuid"
)

// LogOperation 记录操作日志
func LogOperation(userID, username, action, resource, resourceID string, detail interface{}) error {
	detailStr := ""
	if detail != nil {
		detailBytes, err := json.Marshal(detail)
		if err != nil {
			return err
		}
		detailStr = string(detailBytes)
	}

	log := &model.OperationLog{
		ID:         uuid.New().String(),
		UserID:     userID,
		Username:   username,
		Action:     action,
		Resource:   resource,
		ResourceID: resourceID,
		Detail:     detailStr,
		CreatedAt:  time.Now(),
	}

	return database.GetDB().Create(log).Error
}

// LogSystem 记录系统日志
func LogSystem(level model.LogLevel, module, message string, detail interface{}) error {
	detailStr := ""
	if detail != nil {
		detailBytes, err := json.Marshal(detail)
		if err != nil {
			return err
		}
		detailStr = string(detailBytes)
	}

	log := &model.SystemLog{
		ID:        uuid.New().String(),
		Level:     level,
		Module:    module,
		Message:   message,
		Detail:    detailStr,
		CreatedAt: time.Now(),
	}

	return database.GetDB().Create(log).Error
}

// GetOperationLogs 获取操作日志
func GetOperationLogs(userID string, startTime, endTime time.Time, page, pageSize int) ([]model.OperationLog, int64, error) {
	var logs []model.OperationLog
	var total int64

	query := database.GetDB().Model(&model.OperationLog{})
	if userID != "" {
		query = query.Where("user_id = ?", userID)
	}
	query = query.Where("created_at BETWEEN ? AND ?", startTime, endTime)

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	if err := query.Offset((page - 1) * pageSize).Limit(pageSize).
		Order("created_at DESC").Find(&logs).Error; err != nil {
		return nil, 0, err
	}

	return logs, total, nil
}

// GetSystemLogs 获取系统日志
func GetSystemLogs(level model.LogLevel, module string, startTime, endTime time.Time, page, pageSize int) ([]model.SystemLog, int64, error) {
	var logs []model.SystemLog
	var total int64

	query := database.GetDB().Model(&model.SystemLog{})
	if level != "" {
		query = query.Where("level = ?", level)
	}
	if module != "" {
		query = query.Where("module = ?", module)
	}
	query = query.Where("created_at BETWEEN ? AND ?", startTime, endTime)

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	if err := query.Offset((page - 1) * pageSize).Limit(pageSize).
		Order("created_at DESC").Find(&logs).Error; err != nil {
		return nil, 0, err
	}

	return logs, total, nil
}
