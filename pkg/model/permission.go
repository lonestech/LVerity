package model

import (
	"time"
)

// RoleType 角色类型
type RoleType string

const (
	RoleTypeAdmin    RoleType = "admin"    // 管理员
	RoleTypeOperator RoleType = "operator" // 操作员
	RoleTypeViewer   RoleType = "viewer"   // 查看者
)

// IsValid 检查角色类型是否有效
func (r RoleType) IsValid() bool {
	switch r {
	case RoleTypeAdmin, RoleTypeOperator, RoleTypeViewer:
		return true
	default:
		return false
	}
}

// String 返回角色类型的字符串表示
func (r RoleType) String() string {
	return string(r)
}

// Permission 权限定义
type Permission struct {
	ID        string    `json:"id" gorm:"primaryKey"`
	Resource  string    `json:"resource" gorm:"type:varchar(191)"` // 资源类型，如：license, device, user
	Action    string    `json:"action" gorm:"type:varchar(191)"`   // 操作类型，如：create, read, update, delete
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// Role 角色定义
type Role struct {
	ID          string    `json:"id" gorm:"primaryKey"`
	Name        string    `json:"name" gorm:"uniqueIndex:idx_roles_name,length:191;type:varchar(191)"`
	Type        RoleType  `json:"type" gorm:"type:varchar(20)"`
	Description string    `json:"description" gorm:"type:text"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

// RolePermission 角色权限关联
type RolePermission struct {
	RoleID       string    `json:"role_id" gorm:"primaryKey"`
	PermissionID string    `json:"permission_id" gorm:"primaryKey"`
	CreatedAt    time.Time `json:"created_at"`
}

// UserRole 用户角色关联
type UserRole struct {
	UserID    string    `json:"user_id" gorm:"primaryKey"`
	RoleID    string    `json:"role_id" gorm:"primaryKey"`
	CreatedAt time.Time `json:"created_at"`
}

// TableName 指定Permission表名
func (Permission) TableName() string {
	return "permissions"
}

// TableName 指定Role表名
func (Role) TableName() string {
	return "roles"
}

// TableName 指定RolePermission表名
func (RolePermission) TableName() string {
	return "role_permissions"
}

// TableName 指定UserRole表名
func (UserRole) TableName() string {
	return "user_roles"
}
