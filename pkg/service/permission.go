package service

import (
	"LVerity/pkg/model"
	"LVerity/pkg/store"
	"fmt"
)

// InitDefaultPermissions 初始化默认权限
func InitDefaultPermissions() error {
	// 定义默认权限
	defaultPermissions := []struct {
		Resource string
		Action   string
	}{
		{"license", "create"},
		{"license", "read"},
		{"license", "update"},
		{"license", "delete"},
		{"device", "create"},
		{"device", "read"},
		{"device", "update"},
		{"device", "delete"},
		{"user", "create"},
		{"user", "read"},
		{"user", "update"},
		{"user", "delete"},
	}

	// 开启事务
	tx := store.GetDB().Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	// 创建默认权限
	for _, p := range defaultPermissions {
		// 生成权限ID
		permissionID := fmt.Sprintf("%s_%s", p.Resource, p.Action)
		permission := &model.Permission{
			ID:       permissionID,
			Resource: p.Resource,
			Action:   p.Action,
		}

		// 检查权限是否已存在
		var count int64
		if err := tx.Model(&model.Permission{}).
			Where("id = ?", permissionID).
			Count(&count).Error; err != nil {
			tx.Rollback()
			return fmt.Errorf("failed to check permission existence: %v", err)
		}

		// 如果权限不存在，则创建
		if count == 0 {
			if err := tx.Create(permission).Error; err != nil {
				tx.Rollback()
				return fmt.Errorf("failed to create permission: %v", err)
			}
		}
	}

	// 提交事务
	if err := tx.Commit().Error; err != nil {
		return fmt.Errorf("failed to commit transaction: %v", err)
	}

	return nil
}
