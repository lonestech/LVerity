package test

import (
	"testing"
	"time"
	"LVerity/pkg/database"
	"LVerity/pkg/model"
	"LVerity/pkg/service"
	"github.com/stretchr/testify/assert"
)

func TestUserCreation(t *testing.T) {
	cleanup := setupTest(t)
	defer cleanup()

	// 测试创建用户
	user, err := service.CreateUser("testuser", "password123", model.RoleAdmin)
	assert.NoError(t, err)
	assert.NotNil(t, user)
	assert.Equal(t, "testuser", user.Username)
	assert.Equal(t, model.RoleAdmin, user.Role)

	// 测试创建重复用户
	_, err = service.CreateUser("testuser", "password123", model.RoleAdmin)
	assert.Error(t, err)
}

func TestUserAuthentication(t *testing.T) {
	cleanup := setupTest(t)
	defer cleanup()

	// 创建测试用户
	_, err := service.CreateUser("testuser", "password123", model.RoleAdmin)
	assert.NoError(t, err)

	// 测试正确密码登录
	token, err := service.Login("testuser", "password123")
	assert.NoError(t, err)
	assert.NotEmpty(t, token)

	// 测试错误密码登录
	_, err = service.Login("testuser", "wrongpassword")
	assert.Error(t, err)
}

func TestPasswordChange(t *testing.T) {
	cleanup := setupTest(t)
	defer cleanup()

	// 创建测试用户
	user, err := service.CreateUser("testuser", "password123", model.RoleAdmin)
	assert.NoError(t, err)

	// 测试修改密码
	err = service.ChangePassword(user.ID, "password123", "newpassword123")
	assert.NoError(t, err)

	// 使用新密码登录
	token, err := service.Login("testuser", "newpassword123")
	assert.NoError(t, err)
	assert.NotEmpty(t, token)

	// 使用旧密码登录
	_, err = service.Login("testuser", "password123")
	assert.Error(t, err)
}

func TestUserPermissions(t *testing.T) {
	cleanup := setupTest(t)
	defer cleanup()

	// 创建不同角色的用户
	adminUser, err := service.CreateUser("admin", "password123", model.RoleAdmin)
	assert.NoError(t, err)
	assert.Equal(t, model.RoleAdmin, adminUser.Role)

	operatorUser, err := service.CreateUser("operator", "password123", model.RoleOperator)
	assert.NoError(t, err)
	assert.Equal(t, model.RoleOperator, operatorUser.Role)

	viewerUser, err := service.CreateUser("viewer", "password123", model.RoleViewer)
	assert.NoError(t, err)
	assert.Equal(t, model.RoleViewer, viewerUser.Role)

	// 创建权限
	err = database.DB.Create(&model.Permission{
		ID:        "1",
		Role:      model.RoleOperator,
		Resource:  "devices",
		Action:    "write",
		CreatedAt: time.Now(),
	}).Error
	assert.NoError(t, err)

	err = database.DB.Create(&model.Permission{
		ID:        "2",
		Role:      model.RoleViewer,
		Resource:  "devices",
		Action:    "read",
		CreatedAt: time.Now(),
	}).Error
	assert.NoError(t, err)

	// 测试权限检查
	// 管理员权限测试
	assert.True(t, service.HasPermission(adminUser.ID, "users", "write"))    // 管理员拥有所有权限
	assert.True(t, service.HasPermission(adminUser.ID, "devices", "write"))  // 管理员拥有所有权限
	assert.True(t, service.HasPermission(adminUser.ID, "devices", "read"))   // 管理员拥有所有权限

	// 操作员权限测试
	assert.True(t, service.HasPermission(operatorUser.ID, "devices", "write"))   // 操作员拥有设备写权限
	assert.False(t, service.HasPermission(operatorUser.ID, "devices", "delete")) // 操作员没有设备删除权限
	assert.False(t, service.HasPermission(operatorUser.ID, "users", "write"))    // 操作员没有用户管理权限

	// 查看者权限测试
	assert.True(t, service.HasPermission(viewerUser.ID, "devices", "read"))    // 查看者有设备读权限
	assert.False(t, service.HasPermission(viewerUser.ID, "devices", "write"))  // 查看者没有设备写权限
	assert.False(t, service.HasPermission(viewerUser.ID, "users", "read"))     // 查看者没有用户查看权限
}

func TestTokenValidation(t *testing.T) {
	cleanup := setupTest(t)
	defer cleanup()

	// 创建测试用户并获取token
	user, err := service.CreateUser("testuser", "password123", model.RoleAdmin)
	assert.NoError(t, err)

	// 获取token
	token, err := service.Login("testuser", "password123")
	assert.NoError(t, err)
	assert.NotEmpty(t, token)

	// 验证token
	claims, err := service.ValidateToken(token)
	assert.NoError(t, err)
	assert.Equal(t, user.ID, claims.UserID)
	assert.Equal(t, user.Role, claims.Role)

	// 验证无效token
	_, err = service.ValidateToken("invalid-token")
	assert.Error(t, err)

	// 验证过期token
	expiredToken := "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoidGVzdC11c2VyIiwicm9sZSI6ImFkbWluIiwiZXhwIjoxNTE2MjM5MDIyfQ.2lNT8wKhvfsmjKz9q-BkqDHfXvvOk4JKoHLTa_ImpPo"
	_, err = service.ValidateToken(expiredToken)
	assert.Error(t, err)
}
