// service/role.go
package service

import (
	"LVerity/pkg/common"
	"LVerity/pkg/database"
	"LVerity/pkg/model"
	"errors"
	"fmt"
	"time"
)

var (
	ErrRoleNotFound     = errors.New("角色不存在")
	ErrRoleNameTaken    = errors.New("角色名称已被使用")
	ErrPermissionDenied = errors.New("没有权限执行此操作")
)

// GetAllRoles 获取所有角色
func GetAllRoles() ([]model.Role, error) {
	var roles []model.Role
	if err := database.GetDB().Find(&roles).Error; err != nil {
		return nil, err
	}
	return roles, nil
}

// GetRoleByID 通过ID获取角色
func GetRoleByID(id string) (*model.Role, error) {
	var role model.Role
	if err := database.GetDB().Where("id = ?", id).First(&role).Error; err != nil {
		return nil, ErrRoleNotFound
	}
	return &role, nil
}

// CreateRole 创建新角色
func CreateRole(name, description string) (*model.Role, error) {
	// 检查角色名是否已存在
	exists, err := checkRoleNameExists(name)
	if err != nil {
		return nil, err
	}
	if exists {
		return nil, ErrRoleNameTaken
	}

	role := &model.Role{
		ID:          "role-" + common.GenerateUUID(),
		Name:        name,
		Type:        model.RoleTypeOperator, // 默认为操作员类型
		Description: description,
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}

	if err := database.GetDB().Create(role).Error; err != nil {
		return nil, err
	}

	return role, nil
}

// UpdateRole 更新角色信息
func UpdateRole(id, name, description string) (*model.Role, error) {
	role, err := GetRoleByID(id)
	if err != nil {
		return nil, err
	}

	// 如果角色名发生变化，检查是否已存在
	if name != role.Name {
		exists, err := checkRoleNameExists(name)
		if err != nil {
			return nil, err
		}
		if exists {
			return nil, ErrRoleNameTaken
		}
		role.Name = name
	}

	role.Description = description
	role.UpdatedAt = time.Now()

	if err := database.GetDB().Save(role).Error; err != nil {
		return nil, err
	}

	return role, nil
}

// DeleteRole 删除角色
func DeleteRole(id string) error {
	// 1. 检查角色是否存在
	_, err := GetRoleByID(id)
	if err != nil {
		return err
	}

	// 2. 开始事务
	tx := database.GetDB().Begin()
	if tx.Error != nil {
		return tx.Error
	}

	// 3. 删除角色关联的权限
	if err := tx.Where("role_id = ?", id).Delete(&model.RolePermission{}).Error; err != nil {
		tx.Rollback()
		return err
	}

	// 4. 删除用户与角色的关联
	if err := tx.Where("role_id = ?", id).Delete(&model.UserRole{}).Error; err != nil {
		tx.Rollback()
		return err
	}

	// 5. 删除角色
	if err := tx.Delete(&model.Role{}, "id = ?", id).Error; err != nil {
		tx.Rollback()
		return err
	}

	// 6. 提交事务
	return tx.Commit().Error
}

// GetRolePermissions 获取角色的权限列表
func GetRolePermissions(roleID string) ([]model.Permission, error) {
	var permissions []model.Permission
	err := database.GetDB().Table("permissions").
		Joins("JOIN role_permissions ON permissions.id = role_permissions.permission_id").
		Where("role_permissions.role_id = ?", roleID).
		Find(&permissions).Error
	if err != nil {
		return nil, err
	}
	return permissions, nil
}

// UpdateRolePermissions 更新角色权限
func UpdateRolePermissions(roleID string, permissionIDs []string) error {
	// 1. 检查角色是否存在
	_, err := GetRoleByID(roleID)
	if err != nil {
		return err
	}

	// 2. 开始事务
	tx := database.GetDB().Begin()
	if tx.Error != nil {
		return tx.Error
	}

	// 3. 删除原有权限
	if err := tx.Where("role_id = ?", roleID).Delete(&model.RolePermission{}).Error; err != nil {
		tx.Rollback()
		return err
	}

	// 4. 添加新权限
	for _, permID := range permissionIDs {
		rp := model.RolePermission{
			RoleID:       roleID,
			PermissionID: permID,
			CreatedAt:    time.Now(),
		}
		if err := tx.Create(&rp).Error; err != nil {
			tx.Rollback()
			return err
		}
	}

	// 5. 提交事务
	return tx.Commit().Error
}

// GetUserRoles 获取用户的角色列表
func GetUserRoles(userID string) ([]model.Role, error) {
	var roles []model.Role
	err := database.GetDB().Table("roles").
		Joins("JOIN user_roles ON roles.id = user_roles.role_id").
		Where("user_roles.user_id = ?", userID).
		Find(&roles).Error
	if err != nil {
		return nil, err
	}
	return roles, nil
}

// CheckRoleHasPermission 检查角色是否拥有指定权限
func CheckRoleHasPermission(roleID, resource, action string) (bool, error) {
	var count int64
	err := database.GetDB().Table("permissions").
		Joins("JOIN role_permissions ON permissions.id = role_permissions.permission_id").
		Where("role_permissions.role_id = ? AND permissions.resource = ? AND permissions.action = ?", roleID, resource, action).
		Count(&count).Error
	if err != nil {
		return false, err
	}
	return count > 0, nil
}

// checkRoleNameExists 检查角色名是否已存在
func checkRoleNameExists(name string) (bool, error) {
	var count int64
	if err := database.GetDB().Model(&model.Role{}).Where("name = ?", name).Count(&count).Error; err != nil {
		return false, fmt.Errorf("检查角色名是否存在时发生错误: %w", err)
	}
	return count > 0, nil
}

// GetRolesByPage 分页获取角色列表
func GetRolesByPage(page, pageSize int) ([]model.Role, int64, error) {
	var roles []model.Role
	var total int64

	db := database.GetDB()
	tx := db.Model(&model.Role{})

	if err := tx.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	offset := (page - 1) * pageSize
	if err := tx.Offset(offset).Limit(pageSize).Find(&roles).Error; err != nil {
		return nil, 0, err
	}

	return roles, total, nil
}

// InitDefaultRoles 初始化默认角色
func InitDefaultRoles() error {
	// 检查是否已有角色
	var count int64
	if err := database.GetDB().Model(&model.Role{}).Count(&count).Error; err != nil {
		return err
	}

	// 如果已有角色，则不初始化
	if count > 0 {
		return nil
	}

	// 创建默认角色
	defaultRoles := []model.Role{
		{
			ID:          "role-admin",
			Name:        "管理员",
			Type:        model.RoleTypeAdmin,
			Description: "系统管理员，拥有所有权限",
			CreatedAt:   time.Now(),
			UpdatedAt:   time.Now(),
		},
		{
			ID:          "role-operator",
			Name:        "操作员",
			Type:        model.RoleTypeOperator,
			Description: "系统操作员，拥有基本操作权限",
			CreatedAt:   time.Now(),
			UpdatedAt:   time.Now(),
		},
		{
			ID:          "role-viewer",
			Name:        "查看者",
			Type:        model.RoleTypeViewer,
			Description: "只有查看权限，无法进行修改操作",
			CreatedAt:   time.Now(),
			UpdatedAt:   time.Now(),
		},
	}

	for _, role := range defaultRoles {
		if err := database.GetDB().Create(&role).Error; err != nil {
			return err
		}
	}

	return nil
}
