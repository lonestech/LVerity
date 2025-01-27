package database

import (
	"fmt"
	"LVerity/pkg/config"
	"LVerity/pkg/model"
	"LVerity/pkg/store"
)

// InitDB 初始化数据库连接
func InitDB() error {
	// 初始化数据库连接
	err := store.Init(&store.Config{
		Host:     config.GlobalConfig.Database.Host,
		Port:     config.GlobalConfig.Database.Port,
		User:     config.GlobalConfig.Database.User,
		Password: config.GlobalConfig.Database.Password,
		DBName:   config.GlobalConfig.Database.DBName,
	})
	if err != nil {
		return fmt.Errorf("failed to connect database: %v", err)
	}

	// 执行数据库迁移
	if err := RunMigrations("./database/migrations"); err != nil {
		return fmt.Errorf("failed to run migrations: %v", err)
	}

	// 按照依赖关系顺序自动迁移数据库结构
	if err := store.GetDB().AutoMigrate(
		// 基础表
		&model.User{},
		&model.Role{},
		&model.Permission{},
		&model.Device{},
		&model.LicenseTag{},
		
		// 关联表
		&model.RolePermission{},
		&model.UserRole{},
		&model.License{},
		&model.LicenseUsage{},
		
		// 其他表
		&model.DeviceLocation{},
		&model.AbnormalBehavior{},
		&model.BlacklistRule{},
	); err != nil {
		return fmt.Errorf("failed to auto migrate: %v", err)
	}

	return nil
}
