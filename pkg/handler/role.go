// handler/role.go
package handler

import (
	"LVerity/pkg/service"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

// CreateRoleRequest 创建角色请求结构
type CreateRoleRequest struct {
	Name        string `json:"name" binding:"required"`
	Description string `json:"description"`
}

// UpdateRoleRequest 更新角色请求结构
type UpdateRoleRequest struct {
	Name        string `json:"name"`
	Description string `json:"description"`
}

// UpdateRolePermissionsRequest 更新角色权限请求结构
type UpdateRolePermissionsRequest struct {
	PermissionIDs []string `json:"permissionIds" binding:"required"`
}

// GetAllRoles 获取所有角色
func GetAllRoles(c *gin.Context) {
	// 检查是否需要分页
	page := c.DefaultQuery("page", "0")
	pageSize := c.DefaultQuery("pageSize", "0")

	// 如果提供了分页参数，使用分页查询
	if page != "0" && pageSize != "0" {
		pageInt, err := strconv.Atoi(page)
		if err != nil || pageInt < 1 {
			pageInt = 1
		}
		pageSizeInt, err := strconv.Atoi(pageSize)
		if err != nil || pageSizeInt < 1 {
			pageSizeInt = 10
		}

		// 限制每页最大数量
		if pageSizeInt > 100 {
			pageSizeInt = 100
		}

		// 获取分页角色列表
		roles, total, err := service.GetRolesByPage(pageInt, pageSizeInt)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"success": false,
				"message": "获取角色列表失败",
				"error":   err.Error(),
			})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"success": true,
			"message": "success",
			"code":    200,
			"data": gin.H{
				"roles":    roles,
				"total":    total,
				"page":     pageInt,
				"pageSize": pageSizeInt,
			},
		})
		return
	}

	// 如果没有分页参数，获取所有角色
	roles, err := service.GetAllRoles()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "获取角色列表失败",
			"error":   err.Error(),
		})
		return
	}

	// 初始化默认角色（如果数据库为空）
	if len(roles) == 0 {
		if err := service.InitDefaultRoles(); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"success": false,
				"message": "初始化默认角色失败",
				"error":   err.Error(),
			})
			return
		}
		
		// 再次获取角色列表
		roles, err = service.GetAllRoles()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"success": false,
				"message": "获取角色列表失败",
				"error":   err.Error(),
			})
			return
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "success",
		"code":    200,
		"data":    roles,
	})
}

// GetRoleByID 获取角色详情
func GetRoleByID(c *gin.Context) {
	id := c.Param("id")
	role, err := service.GetRoleByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"message": "角色不存在",
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "success",
		"code":    200,
		"data":    role,
	})
}

// CreateRole 创建角色
func CreateRole(c *gin.Context) {
	var req CreateRoleRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "无效的请求参数",
			"error":   err.Error(),
		})
		return
	}

	role, err := service.CreateRole(req.Name, req.Description)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "创建角色失败",
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"success": true,
		"message": "角色创建成功",
		"code":    201,
		"data":    role,
	})
}

// UpdateRole 更新角色
func UpdateRole(c *gin.Context) {
	id := c.Param("id")
	var req UpdateRoleRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "无效的请求参数",
			"error":   err.Error(),
		})
		return
	}

	role, err := service.UpdateRole(id, req.Name, req.Description)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "更新角色失败",
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "角色更新成功",
		"code":    200,
		"data":    role,
	})
}

// DeleteRole 删除角色
func DeleteRole(c *gin.Context) {
	id := c.Param("id")
	if err := service.DeleteRole(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "删除角色失败",
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "角色删除成功",
		"code":    200,
		"data":    nil,
	})
}

// GetRolePermissions 获取角色权限
func GetRolePermissions(c *gin.Context) {
	id := c.Param("id")
	permissions, err := service.GetRolePermissions(id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "获取角色权限失败",
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "success",
		"code":    200,
		"data":    permissions,
	})
}

// UpdateRolePermissions 更新角色权限
func UpdateRolePermissions(c *gin.Context) {
	id := c.Param("id")
	var req UpdateRolePermissionsRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "无效的请求参数",
			"error":   err.Error(),
		})
		return
	}

	if err := service.UpdateRolePermissions(id, req.PermissionIDs); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "更新角色权限失败",
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "角色权限更新成功",
		"code":    200,
		"data":    nil,
	})
}
