package test

import (
	"LVerity/pkg/model"
	"LVerity/pkg/store"
	"LVerity/pkg/utils"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
	"log"
	"os"
	"testing"
)

// setupTest 初始化测试环境并返回清理函数
func setupTest(t *testing.T) func() {
	// 创建临时数据库文件
	dbFile := "test.db"
	
	// 确保数据库文件不存在
	if _, err := os.Stat(dbFile); err == nil {
		err = os.Remove(dbFile)
		if err != nil {
			t.Fatalf("failed to remove existing test database: %v", err)
		}
	}
	
	// 配置数据库连接
	newLogger := logger.New(
		log.New(os.Stdout, "\r\n", log.LstdFlags),
		logger.Config{
			LogLevel: logger.Info,
			Colorful: true,
		},
	)

	db, err := gorm.Open(sqlite.Open(dbFile), &gorm.Config{
		Logger: newLogger,
		DisableForeignKeyConstraintWhenMigrating: true,
	})
	if err != nil {
		t.Fatalf("failed to connect database: %v", err)
	}

	// 自动迁移数据库结构
	err = db.AutoMigrate(
		&model.User{},
		&model.License{},
		&model.Device{},
		&model.Permission{},
		&model.Alert{},
		&model.DeviceLocationLog{},
		&model.DeviceLog{},
		&model.OperationLog{},
		&model.SystemLog{},
	)
	if err != nil {
		t.Fatalf("failed to migrate database: %v", err)
	}

	// 设置全局数据库连接
	store.SetDB(db)

	// 初始化加密密钥
	utils.InitEncryptionKey("test-key")

	// 返回清理函数
	return func() {
		// 确保数据库文件存在
		if _, err := os.Stat(dbFile); err == nil {
			// 获取底层的数据库连接
			sqlDB, err := db.DB()
			if err != nil {
				t.Errorf("failed to get database instance: %v", err)
				return
			}
			
			// 关闭数据库连接
			err = sqlDB.Close()
			if err != nil {
				t.Errorf("failed to close database: %v", err)
			}
			
			// 删除测试数据库文件
			err = os.Remove(dbFile)
			if err != nil {
				t.Errorf("failed to remove test database: %v", err)
			}
		}
	}
}
