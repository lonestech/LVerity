// handler/license.go
package handler

import (
	"LVerity/pkg/model"
	"LVerity/pkg/service"
	"encoding/csv"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

// GenerateLicenseRequest 生成授权码请求
type GenerateLicenseRequest struct {
	Type       model.LicenseType `json:"type"`
	ExpireDays int              `json:"expire_days"`
	MaxDevices int              `json:"max_devices"`
	GroupID    string           `json:"group_id"`
	Features   []string         `json:"features" binding:"required"`
	ExpiresAt  string           `json:"expires_at" binding:"required"`
	UsageLimit int64            `json:"usage_limit"`
	Tags       []string         `json:"tags"`
	Metadata   string           `json:"metadata"`
}

// ActivateLicenseRequest 激活授权码请求
type ActivateLicenseRequest struct {
	Code     string `json:"code"`
	DeviceID string `json:"device_id"`
}

// BatchGenerateLicenseRequest 批量生成授权码请求
type BatchGenerateLicenseRequest struct {
	Type       model.LicenseType `json:"type"`
	ExpireDays int              `json:"expire_days"`
	MaxDevices int              `json:"max_devices"`
	Count      int              `json:"count"`
	GroupID    string           `json:"group_id"`
	Features   []string         `json:"features" binding:"required"`
	ExpiresAt  string           `json:"expires_at" binding:"required"`
	UsageLimit int64            `json:"usage_limit"`
	Tags       []string         `json:"tags"`
	Metadata   string           `json:"metadata"`
}

// BatchDisableLicenseRequest 批量禁用授权码请求
type BatchDisableLicenseRequest struct {
	Codes []string `json:"codes"`
}

// ExportLicensesRequest 导出授权码请求
type ExportLicensesRequest struct {
	Status     model.LicenseStatus `json:"status"`
	StartTime  time.Time          `json:"start_time"`
	EndTime    time.Time          `json:"end_time"`
}

// CreateLicenseGroupRequest 创建授权组请求
type CreateLicenseGroupRequest struct {
	Name        string `json:"name" binding:"required"`
	Description string `json:"description"`
}

// CreateLicenseTagRequest 创建授权标签请求
type CreateLicenseTagRequest struct {
	Name  string `json:"name" binding:"required"`
	Color string `json:"color" binding:"required"`
}

// AssignLicenseToGroupRequest 分配授权码到组请求
type AssignLicenseToGroupRequest struct {
	LicenseID string `json:"license_id" binding:"required"`
	GroupID   string `json:"group_id" binding:"required"`
}

// AddTagsToLicenseRequest 添加标签到授权码请求
type AddTagsToLicenseRequest struct {
	LicenseID string   `json:"license_id" binding:"required"`
	TagIDs    []string `json:"tag_ids" binding:"required"`
}

// UpdateLicenseMetadataRequest 更新授权码元数据请求
type UpdateLicenseMetadataRequest struct {
	LicenseID string `json:"license_id" binding:"required"`
	Metadata  string `json:"metadata" binding:"required"`
}

// UpdateLicenseFeaturesRequest 更新授权码功能列表请求
type UpdateLicenseFeaturesRequest struct {
	LicenseID string   `json:"license_id" binding:"required"`
	Features  []string `json:"features" binding:"required"`
}

// GenerateLicense 生成授权码
func GenerateLicense(c *gin.Context) {
	var req GenerateLicenseRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	startTime := time.Now()
	expireTime := startTime.AddDate(0, 0, req.ExpireDays)

	// 获取当前用户ID作为创建者
	userID := c.GetString("user_id")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	license, err := service.GenerateLicense(
		req.Type,
		req.MaxDevices,
		startTime,
		expireTime,
		req.GroupID,
		req.Features,
		req.UsageLimit,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, license)
}

// ActivateLicense 激活授权码
func ActivateLicense(c *gin.Context) {
	var req ActivateLicenseRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := service.ActivateLicense(req.Code, req.DeviceID); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "License activated successfully"})
}

// VerifyLicense 验证授权码
func VerifyLicense(c *gin.Context) {
	var req struct {
		Code string `json:"code" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// 验证授权码
	valid, err := service.VerifyLicense(req.Code)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"valid": valid})
}

// DisableLicense 禁用授权码
func DisableLicense(c *gin.Context) {
	code := c.Param("code")

	if err := service.DisableLicense(code); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "License disabled successfully"})
}

// GetLicenseInfo 获取授权码信息
func GetLicenseInfo(c *gin.Context) {
	code := c.Param("code")

	license, err := service.GetLicenseInfo(code)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, license)
}

// BatchGenerateLicense 批量生成授权码
func BatchGenerateLicense(c *gin.Context) {
	var req BatchGenerateLicenseRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	startTime := time.Now()
	expireTime := startTime.AddDate(0, 0, req.ExpireDays)
	codes, err := service.BatchCreateLicense(req.Count, req.Type, req.MaxDevices, startTime, expireTime, req.GroupID, req.Features, req.UsageLimit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Licenses generated successfully",
		"codes":   codes,
	})
}

// BatchDisableLicense 批量禁用授权码
func BatchDisableLicense(c *gin.Context) {
	var req BatchDisableLicenseRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := service.BatchDisableLicense(req.Codes); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Licenses disabled successfully"})
}

// ExportLicenses 导出授权记录
func ExportLicenses(c *gin.Context) {
	// 获取查询参数
	status := model.LicenseStatus(c.Query("status"))
	startTime := time.Now().AddDate(0, -1, 0) // 默认查询最近一个月
	endTime := time.Now()

	if startStr := c.Query("start_time"); startStr != "" {
		if t, err := time.Parse(time.RFC3339, startStr); err == nil {
			startTime = t
		}
	}
	if endStr := c.Query("end_time"); endStr != "" {
		if t, err := time.Parse(time.RFC3339, endStr); err == nil {
			endTime = t
		}
	}

	// 查询授权记录
	licenses, err := service.QueryLicenses(status, startTime, endTime)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// 导出为CSV文件
	c.Header("Content-Type", "text/csv")
	c.Header("Content-Disposition", "attachment;filename=licenses.csv")

	// 创建CSV写入器
	writer := csv.NewWriter(c.Writer)
	defer writer.Flush()

	// 写入表头
	headers := []string{
		"ID",
		"Code",
		"Type",
		"Status",
		"MaxDevices",
		"StartTime",
		"ExpireTime",
		"CreatedAt",
		"UpdatedAt",
	}
	if err := writer.Write(headers); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to write CSV headers"})
		return
	}

	// 写入数据
	for _, license := range licenses {
		record := []string{
			license.ID,
			license.Code,
			string(license.Type),
			string(license.Status),
			strconv.Itoa(license.MaxDevices),
			license.StartTime.Format(time.RFC3339),
			license.ExpireTime.Format(time.RFC3339),
			license.CreatedAt.Format(time.RFC3339),
			license.UpdatedAt.Format(time.RFC3339),
		}
		if err := writer.Write(record); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to write CSV data"})
			return
		}
	}
}

// ImportLicenses 导入授权码
func ImportLicenses(c *gin.Context) {
	file, err := c.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No file uploaded"})
		return
	}

	// 打开文件
	src, err := file.Open()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to open file"})
		return
	}
	defer src.Close()

	// 读取CSV文件
	reader := csv.NewReader(src)
	records, err := reader.ReadAll()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to read CSV file"})
		return
	}

	// 跳过表头
	if len(records) < 2 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Empty or invalid CSV file"})
		return
	}
	records = records[1:]

	// 解析授权码记录
	var licenses []model.License
	for _, record := range records {
		if len(record) < 9 {
			continue
		}

		maxDevices, _ := strconv.Atoi(record[4])
		startTime, _ := time.Parse(time.RFC3339, record[5])
		expireTime, _ := time.Parse(time.RFC3339, record[6])

		license := model.License{
			Code:       record[1],
			Type:       model.LicenseType(record[2]),
			Status:     model.LicenseStatus(record[3]),
			MaxDevices: maxDevices,
			StartTime:  startTime,
			ExpireTime: expireTime,
		}
		licenses = append(licenses, license)
	}

	// 导入授权码
	if err := service.ImportLicenses(licenses); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Licenses imported successfully",
		"count":   len(licenses),
	})
}

// BatchGetLicenseInfo 批量获取授权码信息
func BatchGetLicenseInfo(c *gin.Context) {
	var req BatchDisableLicenseRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	licenses, err := service.BatchGetLicenseInfo(req.Codes)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"licenses": licenses,
	})
}

// CreateLicenseGroup 创建授权组
func CreateLicenseGroup(c *gin.Context) {
	var req CreateLicenseGroupRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// 获取当前用户ID
	userID := c.GetString("user_id")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	group, err := service.CreateLicenseGroup(req.Name, req.Description, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, group)
}

// CreateLicenseTag 创建授权标签
func CreateLicenseTag(c *gin.Context) {
	var req CreateLicenseTagRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	tag, err := service.CreateLicenseTag(req.Name, req.Color)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, tag)
}

// AssignLicenseToGroup 分配授权码到组
func AssignLicenseToGroup(c *gin.Context) {
	var req AssignLicenseToGroupRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := service.AssignLicenseToGroup(req.LicenseID, req.GroupID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "License assigned to group successfully"})
}

// AddTagsToLicense 添加标签到授权码
func AddTagsToLicense(c *gin.Context) {
	var req AddTagsToLicenseRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := service.AddTagsToLicense(req.LicenseID, req.TagIDs); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Tags added to license successfully"})
}

// UpdateLicenseMetadata 更新授权码元数据
func UpdateLicenseMetadata(c *gin.Context) {
	var req UpdateLicenseMetadataRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := service.UpdateLicenseMetadata(req.LicenseID, req.Metadata); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "License metadata updated successfully"})
}

// UpdateLicenseFeatures 更新授权码功能列表
func UpdateLicenseFeatures(c *gin.Context) {
	var req UpdateLicenseFeaturesRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := service.UpdateLicenseFeatures(req.LicenseID, req.Features); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "License features updated successfully"})
}

// ListLicenses 获取授权码列表
func ListLicenses(c *gin.Context) {
    // 从查询参数获取分页信息
    page := c.DefaultQuery("page", "1")
    pageSize := c.DefaultQuery("pageSize", "10")
    
    // 获取筛选条件
    status := c.DefaultQuery("status", "")
    groupID := c.DefaultQuery("group_id", "")
    
    licenses, total, err := service.ListLicenses(page, pageSize, status, groupID)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{
            "success": false,
            "error_message": err.Error(),
        })
        return
    }
    
    c.JSON(http.StatusOK, gin.H{
        "success": true,
        "data": gin.H{
            "list": licenses,
            "total": total,
        },
    })
}

// CreateLicense 创建授权码
func CreateLicense(c *gin.Context) {
    var req GenerateLicenseRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{
            "success": false,
            "error_message": err.Error(),
        })
        return
    }

    // 解析过期时间
    expiresAt, err := time.Parse("2006-01-02", req.ExpiresAt)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{
            "success": false,
            "error_message": "invalid expires_at format, should be YYYY-MM-DD",
        })
        return
    }
    
    startTime := time.Now()
    license, err := service.GenerateLicense(
        req.Type,
        req.MaxDevices,
        startTime,
        expiresAt,
        req.GroupID,
        req.Features,
        req.UsageLimit,
    )
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{
            "success": false,
            "error_message": err.Error(),
        })
        return
    }
    
    c.JSON(http.StatusOK, gin.H{
        "success": true,
        "data": license,
    })
}

// GetLicense 获取授权码详情
func GetLicense(c *gin.Context) {
    code := c.Param("code")
    
    license, err := service.GetLicenseByCode(code)
    if err != nil {
        c.JSON(http.StatusNotFound, gin.H{
            "success": false,
            "error_message": err.Error(),
        })
        return
    }
    
    c.JSON(http.StatusOK, gin.H{
        "success": true,
        "data": license,
    })
}

// UpdateLicense 更新授权码
func UpdateLicense(c *gin.Context) {
    code := c.Param("code")
    var req UpdateLicenseMetadataRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{
            "success": false,
            "error_message": err.Error(),
        })
        return
    }
    
    err := service.UpdateLicenseMetadata(code, req.Metadata)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{
            "success": false,
            "error_message": err.Error(),
        })
        return
    }
    
    c.JSON(http.StatusOK, gin.H{
        "success": true,
        "data": gin.H{
            "message": "License updated successfully",
        },
    })
}

// DeleteLicense 删除授权码
func DeleteLicense(c *gin.Context) {
    code := c.Param("code")
    
    err := service.DeleteLicense(code)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{
            "success": false,
            "error_message": err.Error(),
        })
        return
    }
    
    c.JSON(http.StatusOK, gin.H{
        "success": true,
        "data": gin.H{
            "message": "License deleted successfully",
        },
    })
}

// GenerateLicenseKey 生成随机授权密钥
func GenerateLicenseKey(c *gin.Context) {
	// 使用授权服务生成随机密钥
	key, err := service.GenerateLicenseKey()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "生成授权密钥失败",
			"error": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": gin.H{
			"key": key,
		},
	})
}

// ResetLicenseFilters 重置授权过滤条件
func ResetLicenseFilters(c *gin.Context) {
	// 这里是一个简单的API，主要用于前端重置操作
	// 实际上不需要后端存储状态，因为过滤状态存在前端
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "过滤条件已重置",
	})
}
