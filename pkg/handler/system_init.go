package handler

import (
	"LVerity/pkg/model"
	"LVerity/pkg/service"
	"net/http"

	"github.com/gin-gonic/gin"
)

// InitAdminRequest 初始化管理员账户请求
type InitAdminRequest struct {
	Username        string `json:"username" binding:"required"`
	Password        string `json:"password" binding:"required"`
	ConfirmPassword string `json:"confirmPassword" binding:"required"`
	Email           string `json:"email"`
	Name            string `json:"name"`
}

// GetInitStatus 获取系统初始化状态
func GetInitStatus(c *gin.Context) {
	status, err := service.CheckSystemInitStatus()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "检查系统初始化状态失败: " + err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    status,
	})
}

// InitAdmin 初始化管理员账户
func InitAdmin(c *gin.Context) {
	var req InitAdminRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "无效的请求数据: " + err.Error(),
		})
		return
	}

	// 转换为服务层需要的参数格式
	params := model.InitAdminParams{
		Username:        req.Username,
		Password:        req.Password,
		ConfirmPassword: req.ConfirmPassword,
		Email:           req.Email,
		Name:            req.Name,
	}

	// 初始化管理员账户
	_, err := service.InitializeAdmin(params)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "初始化管理员账户失败: " + err.Error(),
		})
		return
	}

	// 生成JWT令牌
	token, loginUser, err := service.Login(req.Username, req.Password)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "生成令牌失败: " + err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "管理员账户创建成功",
		"data": gin.H{
			"token": token,
			"user":  loginUser,
		},
	})
}
