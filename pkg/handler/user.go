package handler

import (
	"LVerity/pkg/model" // Added for model responses
	"LVerity/pkg/service"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strconv"

	"github.com/gin-gonic/gin"
)

// UpdateUserProfile 更新用户信息
func UpdateUserProfile(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"error_message": "未找到用户信息",
		})
		return
	}

	var updates map[string]interface{}
	if err := c.ShouldBindJSON(&updates); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error_message": err.Error(),
		})
		return
	}

	user, err := service.UpdateUserProfile(userID.(string), updates)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error_message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    user,
	})
}

// UploadAvatar 上传头像
func UploadAvatar(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"error_message": "未找到用户信息",
		})
		return
	}

	// 获取上传的文件
	file, header, err := c.Request.FormFile("avatar")
	if err != nil {
		log.Printf("获取上传文件失败: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error_message": "请选择要上传的头像",
		})
		return
	}
	defer file.Close()

	// 检查文件大小
	if header.Size == 0 {
		log.Printf("上传的文件为空")
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error_message": "上传的文件为空",
		})
		return
	}

	// 检查文件大小限制（例如 5MB）
	if header.Size > 5*1024*1024 {
		log.Printf("文件太大: %d bytes", header.Size)
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error_message": "文件大小不能超过 5MB",
		})
		return
	}

	// 检查文件类型
	ext := filepath.Ext(header.Filename)
	if ext != ".jpg" && ext != ".jpeg" && ext != ".png" {
		log.Printf("不支持的文件类型: %s", ext)
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error_message": "只支持 jpg、jpeg、png 格式的图片",
		})
		return
	}

	// 获取用户目录
	userHome, err := os.UserHomeDir()
	if err != nil {
		log.Printf("获取用户目录失败: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error_message": "服务器内部错误",
		})
		return
	}

	// 确保上传目录存在
	uploadDir := filepath.Join(userHome, "LVerity", "uploads", "avatars")
	if err := os.MkdirAll(uploadDir, 0755); err != nil {
		log.Printf("创建上传目录失败: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error_message": "创建上传目录失败",
		})
		return
	}

	// 生成文件名
	filename := fmt.Sprintf("%s%s", userID, ext)
	avatarPath := filepath.Join(uploadDir, filename)

	log.Printf("准备保存头像到: %s", avatarPath)

	// 创建目标文件
	dst, err := os.Create(avatarPath)
	if err != nil {
		log.Printf("创建目标文件失败: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error_message": "创建文件失败",
		})
		return
	}
	defer dst.Close()

	// 复制文件内容
	written, err := io.Copy(dst, file)
	if err != nil {
		log.Printf("复制文件内容失败: %v", err)
		os.Remove(avatarPath) // 清理失败的文件
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error_message": "保存文件失败",
		})
		return
	}

	log.Printf("成功写入 %d 字节到文件: %s", written, avatarPath)

	// 检查文件是否成功保存
	if written == 0 {
		log.Printf("写入的文件大小为 0")
		os.Remove(avatarPath)
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error_message": "保存的文件为空",
		})
		return
	}

	// 更新用户头像
	updates := map[string]interface{}{
		"avatar": fmt.Sprintf("/uploads/avatars/%s", filename),
	}

	user, err := service.UpdateUserProfile(userID.(string), updates)
	if err != nil {
		// 如果更新失败，删除上传的文件
		os.Remove(avatarPath)
		log.Printf("更新用户头像失败: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error_message": err.Error(),
		})
		return
	}

	log.Printf("头像上传成功: %s, 大小: %d 字节", avatarPath, written)

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    user,
	})
}

// GetUserProfile 获取用户信息
func GetUserProfile(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"error_message": "未找到用户信息",
		})
		return
	}

	user, err := service.GetUserByID(userID.(string))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error_message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    user,
	})
}

// ListUsers 获取用户列表（分页）
// @Summary List users
// @Description Retrieves a paginated list of users.
// @Tags users
// @Security ApiKeyAuth
// @Accept json
// @Produce json
// @Param page query int false "Page number" default(1)
// @Param limit query int false "Items per page" default(10)
// @Success 200 {object} model.PaginatedUsersResponse "List of users"
// @Failure 500 {object} model.ErrorResponse "Internal server error"
// @Router /users [get]
func ListUsers(c *gin.Context) {
	// 获取分页参数
	pageStr := c.DefaultQuery("page", "1")
	limitStr := c.DefaultQuery("pageSize", "10") // Swagger uses 'limit', existing code uses 'pageSize'

	// 转换为整数
	page, err := strconv.Atoi(pageStr)
	if err != nil || page < 1 {
		page = 1
	}
	limit, err := strconv.Atoi(limitStr)
	if err != nil || limit < 1 {
		limit = 10
	}

	// 限制每页最大数量
	if limit > 100 {
		limit = 100
	}

	// 获取用户列表
	users, total, err := service.ListUsers(page, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, model.ErrorResponse{
			Error:   "Failed to retrieve user list",
			Message: err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, model.PaginatedUsersResponse{
		Data:  users,
		Total: total,
		Page:  page,
		Limit: limit,
	})
}
