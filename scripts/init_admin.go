package main

import (
	"LVerity/pkg/config"
	"LVerity/pkg/database"
	"LVerity/pkg/model"
	"golang.org/x/crypto/bcrypt"
	"log"
)

func main() {
	// 加载配置
	if err := config.LoadConfig(); err != nil {
		log.Fatalf("Failed to load config: %v", err)
	}

	// 初始化数据库连接
	if err := database.InitDB(); err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}

	// 创建管理员角色
	adminRole := &model.Role{
		Name:        "admin",
		Description: "System Administrator",
		Permissions: []string{"*"},
	}
	
	if err := database.DB.Create(adminRole).Error; err != nil {
		log.Printf("Warning: Failed to create admin role: %v", err)
	}

	// 生成密码哈希
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte("admin123"), bcrypt.DefaultCost)
	if err != nil {
		log.Fatalf("Failed to hash password: %v", err)
	}

	// 创建管理员用户
	adminUser := &model.User{
		Username: "admin",
		Password: string(hashedPassword),
		RoleID:   adminRole.ID,
		Status:   "active",
	}

	if err := database.DB.Create(adminUser).Error; err != nil {
		log.Fatalf("Failed to create admin user: %v", err)
	}

	log.Println("Successfully created admin user:")
	log.Println("Username: admin")
	log.Println("Password: admin123")
}
