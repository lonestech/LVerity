package handler

import (
	"LVerity/pkg/model" // Added for model.LoginRequest
	"LVerity/pkg/service"
	"net/http"

	"github.com/gin-gonic/gin"
)

// CreateUserRequest 创建用户请求
type CreateUserRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
	RoleID   string `json:"role_id" binding:"required"`
}

// ChangePasswordRequest 修改密码请求
type ChangePasswordRequest struct {
	OldPassword string `json:"old_password" binding:"required"`
	NewPassword string `json:"new_password" binding:"required"`
}

// Login 用户登录
// @Summary User login
// @Description Authenticates a user and returns a JWT token.
// @Tags auth
// @Accept json
// @Produce json
// @Param login body model.LoginRequest true "Login credentials"
// @Success 200 {object} model.LoginResponse "Successful login"
// @Failure 400 {object} model.ErrorResponse "Invalid input"
// @Failure 401 {object} model.ErrorResponse "Unauthorized"
// @Failure 500 {object} model.ErrorResponse "Internal server error"
// @Router /auth/login [post]
func Login(c *gin.Context) {
	var req model.LoginRequest // Changed to use model.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, model.ErrorResponse{Error: "Invalid input", Message: err.Error()})
		return
	}

	token, user, err := service.Login(req.Username, req.Password)
	if err != nil {
		c.JSON(http.StatusUnauthorized, model.ErrorResponse{Error: "Unauthorized", Message: err.Error()})
		return
	}

	// The original code re-generates token here. Assuming service.Login already provides the final token.
	// If GenerateToken is still needed, it should be considered if it's part of the primary login flow or a separate step.
	// For simplicity, I will use the token from service.Login.
	// If a new token must be generated here:
	// token, err = service.GenerateToken(user.ID, user.Username, user.RoleID)
	// if err != nil {
	// 	c.JSON(http.StatusInternalServerError, model.ErrorResponse{Error: "Failed to generate token", Message: err.Error()})
	// 	return
	// }

	// The LoginResponse includes the User model.
	// Ensure the User model has appropriate json tags and doesn't expose sensitive info like password hash.
	// The previously created model.LoginResponse expects *model.User.
	// The service.Login returns *model.User.
	loginResp := model.LoginResponse{
		Token: token,
		User:  user,
	}
	c.JSON(http.StatusOK, loginResp)
}

// ChangePassword 修改密码
func ChangePassword(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"success":       false,
			"error_message": "未找到用户信息",
		})
		return
	}

	var req ChangePasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success":       false,
			"error_message": err.Error(),
		})
		return
	}

	err := service.ChangePassword(userID.(string), req.OldPassword, req.NewPassword)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success":       false,
			"error_message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    nil,
	})
}

// RefreshToken 刷新令牌
func RefreshToken(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"success":       false,
			"error_message": "未找到用户信息",
		})
		return
	}

	token, err := service.GenerateToken(userID.(string), "", "")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success":       false,
			"error_message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": gin.H{
			"token": token,
		},
	})
}

// CreateUser 创建用户
func CreateUser(c *gin.Context) {
	var req CreateUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success":       false,
			"error_message": err.Error(),
		})
		return
	}

	user, err := service.CreateUser(req.Username, req.Password, req.RoleID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success":       false,
			"error_message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    user,
	})
}
