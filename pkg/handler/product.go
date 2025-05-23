// handler/product.go
package handler

import (
	"LVerity/pkg/model"
	"LVerity/pkg/service"
	"encoding/json" // Added for json.Marshal
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/datatypes" // Added for datatypes.JSON
)

// CreateProductRequest 创建产品请求结构
type CreateProductRequest struct {
	Name             string                 `json:"name" binding:"required"`
	Description      string                 `json:"description"`
	Features         []string               `json:"features"`
	CustomAttributes map[string]interface{} `json:"customAttributes"` // New field
}

// UpdateProductRequest 更新产品请求结构
type UpdateProductRequest struct {
	Name             string                 `json:"name"`
	Description      string                 `json:"description"`
	Features         []string               `json:"features"`
	CustomAttributes map[string]interface{} `json:"customAttributes"` // New field
}

// GetProducts 获取产品列表
// @Summary List products
// @Description Get a list of all products.
// @Tags products
// @Security ApiKeyAuth
// @Accept json
// @Produce json
// @Success 200 {object} model.SuccessResponse{data=[]model.Product} "List of products"
// @Failure 500 {object} model.ErrorResponse "Internal server error"
// @Router /products [get]
func GetProducts(c *gin.Context) {
	productService := service.NewProductService()
	products, err := productService.GetProducts()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "获取产品列表失败",
			"error":   err.Error(),
		})
		return
	}

	// 为了兼容前端，如果数据库为空，则返回模拟数据
	// if len(products) == 0 {
	// 	// 创建初始产品数据
	// 	initialProducts := []model.Product{
	// 		{
	// 			ID:          "p-001",
	// 			Name:        "LVerity 基础版",
	// 			Description: "基础安全管理功能，适合小型组织",
	// 			Features:    []string{"用户管理", "设备管理", "基础日志", "系统监控"},
	// 			CreatedAt:   time.Now().AddDate(0, -7, 0),
	// 		},
	// 		{
	// 			ID:          "p-002",
	// 			Name:        "LVerity 专业版",
	// 			Description: "高级安全管理功能，适合中型企业",
	// 			Features:    []string{"用户管理", "设备管理", "高级日志", "系统监控", "安全审计", "自动备份"},
	// 			CreatedAt:   time.Now().AddDate(0, -6, 0),
	// 		},
	// 		{
	// 			ID:          "p-003",
	// 			Name:        "LVerity 企业版",
	// 			Description: "全功能安全管理平台，适合大型企业",
	// 			Features:    []string{"用户管理", "设备管理", "高级日志", "系统监控", "安全审计", "自动备份", "集群部署", "数据分析", "安全报告"},
	// 			CreatedAt:   time.Now().AddDate(0, -5, 0),
	// 		},
	// 	}

	// 	// 将初始数据保存到数据库
	// 	for _, product := range initialProducts {
	// 		if err := productService.CreateProduct(&product); err != nil {
	// 			// 仅记录错误，不中断流程
	// 			c.Error(err)
	// 		}
	// 	}

	// 	// 返回初始数据
	// 	c.JSON(http.StatusOK, gin.H{
	// 		"success": true,
	// 		"message": "success",
	// 		"code":    200,
	// 		"data":    initialProducts,
	// 	})
	// 	return
	// }

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "success",
		"code":    200,
		"data":    products,
	})
}

// GetProductByID 获取产品详情
// @Summary Get a product by ID
// @Description Get details of a specific product by its ID.
// @Tags products
// @Security ApiKeyAuth
// @Accept json
// @Produce json
// @Param id path string true "Product ID"
// @Success 200 {object} model.SuccessResponse{data=model.Product} "Product details"
// @Failure 404 {object} model.ErrorResponse "Product not found"
// @Failure 500 {object} model.ErrorResponse "Internal server error"
// @Router /products/{id} [get]
func GetProductByID(c *gin.Context) {
	id := c.Param("id")
	productService := service.NewProductService()
	product, err := productService.GetProductByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"message": "产品不存在",
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "success",
		"code":    200,
		"data":    product,
	})
}

// CreateProduct 创建产品
// @Summary Create a new product
// @Description Add a new product to the system, including custom attributes.
// @Tags products
// @Security ApiKeyAuth
// @Accept json
// @Produce json
// @Param product body CreateProductRequest true "Product information including custom attributes"
// @Success 201 {object} model.SuccessResponse{data=model.Product} "Product created successfully"
// @Failure 400 {object} model.ErrorResponse "Invalid input"
// @Failure 500 {object} model.ErrorResponse "Internal server error"
// @Router /products [post]
func CreateProduct(c *gin.Context) {
	var req CreateProductRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "无效的请求参数",
			"error":   err.Error(),
		})
		return
	}

	product := model.Product{
		ID:          "p-" + uuid.New().String()[:8],
		Name:        req.Name,
		Description: req.Description,
		Features:    req.Features,
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}

	if req.CustomAttributes != nil {
		customAttrsJSON, err := json.Marshal(req.CustomAttributes)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Invalid custom attributes format", "error": err.Error()})
			return
		}
		product.CustomAttributes = datatypes.JSON(customAttrsJSON)
	}

	productService := service.NewProductService()
	if err := productService.CreateProduct(&product); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "创建产品失败",
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"success": true,
		"message": "产品创建成功",
		"code":    201,
		"data":    product,
	})
}

// UpdateProduct 更新产品
// @Summary Update an existing product
// @Description Update details of an existing product by its ID, including custom attributes.
// @Tags products
// @Security ApiKeyAuth
// @Accept json
// @Produce json
// @Param id path string true "Product ID"
// @Param product body UpdateProductRequest true "Product information to update"
// @Success 200 {object} model.SuccessResponse{data=model.Product} "Product updated successfully"
// @Failure 400 {object} model.ErrorResponse "Invalid input"
// @Failure 404 {object} model.ErrorResponse "Product not found"
// @Failure 500 {object} model.ErrorResponse "Internal server error"
// @Router /products/{id} [put]
func UpdateProduct(c *gin.Context) {
	id := c.Param("id")
	var req UpdateProductRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "无效的请求参数",
			"error":   err.Error(),
		})
		return
	}

	productService := service.NewProductService()
	product, err := productService.GetProductByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"message": "产品不存在",
			"error":   err.Error(),
		})
		return
	}

	// 更新产品信息
	if req.Name != "" {
		product.Name = req.Name
	}
	if req.Description != "" {
		product.Description = req.Description
	}
	if len(req.Features) > 0 {
		product.Features = req.Features
	}
	if req.CustomAttributes != nil { // Check if CustomAttributes is provided in the request
		customAttrsJSON, err := json.Marshal(req.CustomAttributes)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Invalid custom attributes format", "error": err.Error()})
			return
		}
		product.CustomAttributes = datatypes.JSON(customAttrsJSON)
	}
	product.UpdatedAt = time.Now()

	if err := productService.UpdateProduct(product); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "更新产品失败",
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "产品更新成功",
		"code":    200,
		"data":    product,
	})
}

// DeleteProduct 删除产品
// @Summary Delete a product
// @Description Delete a product by its ID.
// @Tags products
// @Security ApiKeyAuth
// @Accept json
// @Produce json
// @Param id path string true "Product ID"
// @Success 200 {object} model.SuccessResponse "Product deleted successfully"
// @Failure 404 {object} model.ErrorResponse "Product not found"
// @Failure 500 {object} model.ErrorResponse "Internal server error"
// @Router /products/{id} [delete]
func DeleteProduct(c *gin.Context) {
	id := c.Param("id")
	productService := service.NewProductService()
	
	// 先检查产品是否存在
	_, err := productService.GetProductByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"message": "产品不存在",
			"error":   err.Error(),
		})
		return
	}

	// 删除产品
	if err := productService.DeleteProduct(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "删除产品失败",
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "产品删除成功",
		"code":    200,
		"data":    nil,
	})
}
