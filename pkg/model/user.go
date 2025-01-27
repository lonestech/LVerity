package model

import (
	"time"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

// UserStatus 用户状态
type UserStatus string

const (
	UserStatusActive   UserStatus = "active"   // 启用
	UserStatusInactive UserStatus = "inactive" // 禁用
	UserStatusBlocked  UserStatus = "blocked"  // 封禁
)

// User 用户模型
type User struct {
	ID         string     `json:"id" gorm:"primaryKey"`
	Username   string     `json:"username" gorm:"uniqueIndex:idx_username,length:191;type:varchar(191)"`
	Password   string     `json:"-" gorm:"not null;type:varchar(191)"` // 密码不返回给前端
	Salt       []byte     `json:"-"`           // 密码盐值
	RoleID     string     `json:"role_id" gorm:"type:varchar(191)"`     // 关联角色ID
	Status     UserStatus `json:"status" gorm:"type:varchar(20)"`      // true: 启用, false: 禁用
	LastLogin  time.Time  `json:"last_login"`
	CreateTime time.Time  `json:"create_time"`
	UpdateTime time.Time  `json:"update_time"`
}

// SetPassword 设置密码
func (u *User) SetPassword(password string) error {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}
	u.Password = string(hashedPassword)
	return nil
}

// CheckPassword 检查密码
func (u *User) CheckPassword(password string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(u.Password), []byte(password))
	return err == nil
}

// BeforeCreate GORM 创建钩子
func (u *User) BeforeCreate(tx *gorm.DB) error {
	if u.Status == "" {
		u.Status = UserStatusActive
	}
	if u.CreateTime.IsZero() {
		u.CreateTime = time.Now()
	}
	if u.UpdateTime.IsZero() {
		u.UpdateTime = time.Now()
	}
	return nil
}

// BeforeUpdate GORM 更新钩子
func (u *User) BeforeUpdate(tx *gorm.DB) error {
	u.UpdateTime = time.Now()
	return nil
}
