package database

import (
	"fmt"
	"log"
	"os"
	"path/filepath"
	"sync"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"

	"LVerity/pkg/model"
)

var (
	// DB 全局数据库连接
	DB   *gorm.DB
	once sync.Once
)

// Config 数据库配置
type Config struct {
	DBPath string // SQLite 数据库文件路径
}

// InitDB 初始化数据库连接
func InitDB(config *Config) error {
	var err error

	// 确保数据库目录存在
	dir := filepath.Dir(config.DBPath)
	if err := os.MkdirAll(dir, os.ModePerm); err != nil {
		return fmt.Errorf("创建数据库目录失败: %w", err)
	}

	once.Do(func() {
		log.Printf("正在连接数据库: %s", config.DBPath)
		// 连接数据库
		DB, err = gorm.Open(sqlite.Open(config.DBPath), &gorm.Config{
			Logger: logger.Default.LogMode(logger.Info),
		})
		if err != nil {
			err = fmt.Errorf("连接数据库失败: %w", err)
			return
		}

		// 自动迁移数据库表结构
		err = DB.AutoMigrate(
			&model.User{},
			&model.Permission{},
			&model.Role{},
			&model.RolePermission{},
			&model.UserRole{},
			&model.License{},
			&model.Device{},
			&model.DeviceGroup{},
			&model.DeviceLog{},
			&model.SystemLog{},
			&model.Alert{},
			&model.SystemInfo{}, // 已实现的SystemInfo模型
			&model.Setting{},    // 已实现的Setting模型
			&model.Customer{},
			&model.Product{},
			&model.SystemBackup{}, // 系统备份模型
			&model.BackupConfig{}, // 备份配置模型
			&model.SystemConfig{}, // 系统配置模型
		)

		if err != nil {
			err = fmt.Errorf("数据库迁移失败: %v", err)
			return
		}
		log.Println("数据库连接和迁移成功完成")
	})
	return err
}

// GetDB 获取数据库连接
func GetDB() *gorm.DB {
	if DB == nil {
		panic("数据库连接未初始化")
	}
	return DB
}

// SetDB 设置数据库连接（仅用于测试）
func SetDB(db *gorm.DB) {
	DB = db
}

// CloseDB 关闭数据库连接
func CloseDB() error {
	if DB != nil {
		sqlDB, err := DB.DB()
		if err != nil {
			return fmt.Errorf("获取底层数据库连接失败: %v", err)
		}
		if err := sqlDB.Close(); err != nil {
			return fmt.Errorf("关闭数据库连接失败: %v", err)
		}
		DB = nil
		log.Println("数据库连接已关闭")
	}
	return nil
}

// autoMigrate 自动迁移数据库结构
func autoMigrate() error {
	log.Println("开始数据库迁移...")
	
	// 基础表
	if err := DB.AutoMigrate(
		&model.User{},
		&model.Role{},
		&model.Permission{},
		&model.Device{},
		&model.LicenseTag{},
	); err != nil {
		return fmt.Errorf("迁移基础模型失败: %v", err)
	}

	// 关联表
	if err := DB.AutoMigrate(
		&model.RolePermission{},
		&model.UserRole{},
		&model.License{},
		&model.LicenseUsage{},
	); err != nil {
		return fmt.Errorf("迁移关联模型失败: %v", err)
	}

	// 其他表
	if err := DB.AutoMigrate(
		&model.DeviceLocation{},
		&model.AbnormalBehavior{},
		&model.BlacklistRule{},
	); err != nil {
		return fmt.Errorf("迁移其他模型失败: %v", err)
	}

	log.Println("数据库迁移完成")
	return nil
}
