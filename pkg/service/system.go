package service

import (
	"LVerity/pkg/database"
	"LVerity/pkg/model"
	"errors"
	"log"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// CheckSystemInitStatus 检查系统初始化状态
func CheckSystemInitStatus() (model.SystemInitStatus, error) {
	status := model.SystemInitStatus{
		Initialized:      false,
		HasAdmin:         false,
		SystemConfigured: false,
	}

	// 检查是否已有管理员账户
	var count int64
	err := database.GetDB().Model(&model.User{}).Where("role_id = ?", "admin").Count(&count).Error
	if err != nil {
		return status, err
	}

	if count > 0 {
		status.HasAdmin = true
		status.Initialized = true
	}

	// 检查系统配置是否完成
	// 此处可根据实际需求检查其他必要配置，如系统设置、许可证等
	// ...

	return status, nil
}

// InitializeAdmin 初始化管理员账户
func InitializeAdmin(params model.InitAdminParams) (*model.User, error) {
	// 检查系统是否已初始化
	initStatus, err := CheckSystemInitStatus()
	if err != nil {
		return nil, err
	}

	if initStatus.HasAdmin {
		return nil, errors.New("系统已初始化，不能重复创建管理员")
	}

	// 检查密码是否一致
	if params.Password != params.ConfirmPassword {
		return nil, errors.New("两次输入的密码不一致")
	}

	// 检查用户名是否已存在
	exists, err := CheckUsernameExists(params.Username)
	if err != nil {
		return nil, err
	}

	if exists {
		return nil, ErrUsernameTaken
	}

	// 事务处理
	var user *model.User
	err = database.GetDB().Transaction(func(tx *gorm.DB) error {
		// 创建管理员角色（如果不存在）
		var adminRole model.Role
		result := tx.Where("id = ? OR name = ?", "admin", "管理员").First(&adminRole)
		if result.Error != nil {
			// 创建管理员角色
			adminRole = model.Role{
				ID:          "admin",
				Name:        "管理员",
				Description: "系统管理员，拥有全部权限",
				Type:        model.RoleTypeAdmin,
				CreatedAt:   time.Now(),
				UpdatedAt:   time.Now(),
			}
			if err := tx.Create(&adminRole).Error; err != nil {
				return err
			}

			// 为管理员角色分配全部权限
			// ...可在此处添加权限分配逻辑
		}

		// 创建管理员用户
		adminUser := &model.User{
			ID:         uuid.New().String(),
			Username:   params.Username,
			RoleID:     "admin",
			Status:     model.UserStatusActive,
			LastLogin:  time.Now(),
			CreateTime: time.Now(),
			UpdateTime: time.Now(),
		}

		// 设置密码
		if err := adminUser.SetPassword(params.Password); err != nil {
			return err
		}

		// 创建用户
		if err := tx.Create(adminUser).Error; err != nil {
			return err
		}

		user = adminUser
		return nil
	})

	if err != nil {
		log.Printf("初始化管理员失败: %v", err)
		return nil, err
	}

	// 更新最后登录时间
	database.GetDB().Model(user).Update("last_login", time.Now())

	// 创建并返回带有令牌的用户对象
	user.Password = "" // 清空密码字段，避免返回给前端
	return user, nil
}
