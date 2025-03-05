// handler/customer.go
package handler

import (
	"LVerity/pkg/model"
	"LVerity/pkg/service"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// CreateCustomerRequest 创建客户请求结构
type CreateCustomerRequest struct {
	Name         string `json:"name" binding:"required"`
	ContactName  string `json:"contactName"`
	ContactEmail string `json:"contactEmail"`
	ContactPhone string `json:"contactPhone"`
	Address      string `json:"address"`
}

// UpdateCustomerRequest 更新客户请求结构
type UpdateCustomerRequest struct {
	Name         string `json:"name"`
	ContactName  string `json:"contactName"`
	ContactEmail string `json:"contactEmail"`
	ContactPhone string `json:"contactPhone"`
	Address      string `json:"address"`
}

// GetCustomers 获取客户列表
func GetCustomers(c *gin.Context) {
	customerService := service.NewCustomerService()
	customers, err := customerService.GetCustomers()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "获取客户列表失败",
			"error":   err.Error(),
		})
		return
	}

	// 为了兼容前端，如果数据库为空，则返回模拟数据
	if len(customers) == 0 {
		// 创建初始客户数据
		initialCustomers := []model.Customer{
			{
				ID:           "c-001",
				Name:         "北京科技有限公司",
				ContactName:  "张先生",
				ContactPhone: "13800138001",
				ContactEmail: "contact@bjtechnology.com",
				Address:      "北京市海淀区中关村大道1号",
				CreatedAt:    time.Now().AddDate(0, -6, 0),
			},
			{
				ID:           "c-002",
				Name:         "上海互联网科技有限公司",
				ContactName:  "李女士",
				ContactPhone: "13900139002",
				ContactEmail: "service@shinternet.com",
				Address:      "上海市浦东新区张江高科技园区",
				CreatedAt:    time.Now().AddDate(0, -5, 0),
			},
			{
				ID:           "c-003",
				Name:         "广州数据科技有限公司",
				ContactName:  "王总",
				ContactPhone: "13700137003",
				ContactEmail: "info@gzdata.com",
				Address:      "广州市天河区珠江新城",
				CreatedAt:    time.Now().AddDate(0, -4, 0),
			},
		}

		// 将初始数据保存到数据库
		for _, customer := range initialCustomers {
			if err := customerService.CreateCustomer(&customer); err != nil {
				// 仅记录错误，不中断流程
				c.Error(err)
			}
		}

		// 返回初始数据
		c.JSON(http.StatusOK, gin.H{
			"success": true,
			"message": "success",
			"code":    200,
			"data":    initialCustomers,
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "success",
		"code":    200,
		"data":    customers,
	})
}

// GetCustomerByID 获取客户详情
func GetCustomerByID(c *gin.Context) {
	id := c.Param("id")
	customerService := service.NewCustomerService()
	customer, err := customerService.GetCustomerByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"message": "客户不存在",
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "success",
		"code":    200,
		"data":    customer,
	})
}

// CreateCustomer 创建客户
func CreateCustomer(c *gin.Context) {
	var req CreateCustomerRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "无效的请求参数",
			"error":   err.Error(),
		})
		return
	}

	customer := model.Customer{
		ID:           "c-" + uuid.New().String()[:8],
		Name:         req.Name,
		ContactName:  req.ContactName,
		ContactEmail: req.ContactEmail,
		ContactPhone: req.ContactPhone,
		Address:      req.Address,
		CreatedAt:    time.Now(),
		UpdatedAt:    time.Now(),
	}

	customerService := service.NewCustomerService()
	if err := customerService.CreateCustomer(&customer); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "创建客户失败",
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"success": true,
		"message": "客户创建成功",
		"code":    201,
		"data":    customer,
	})
}

// UpdateCustomer 更新客户
func UpdateCustomer(c *gin.Context) {
	id := c.Param("id")
	var req UpdateCustomerRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "无效的请求参数",
			"error":   err.Error(),
		})
		return
	}

	customerService := service.NewCustomerService()
	customer, err := customerService.GetCustomerByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"message": "客户不存在",
			"error":   err.Error(),
		})
		return
	}

	// 更新客户信息
	if req.Name != "" {
		customer.Name = req.Name
	}
	if req.ContactName != "" {
		customer.ContactName = req.ContactName
	}
	if req.ContactEmail != "" {
		customer.ContactEmail = req.ContactEmail
	}
	if req.ContactPhone != "" {
		customer.ContactPhone = req.ContactPhone
	}
	if req.Address != "" {
		customer.Address = req.Address
	}
	customer.UpdatedAt = time.Now()

	if err := customerService.UpdateCustomer(customer); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "更新客户失败",
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "客户更新成功",
		"code":    200,
		"data":    customer,
	})
}

// DeleteCustomer 删除客户
func DeleteCustomer(c *gin.Context) {
	id := c.Param("id")
	customerService := service.NewCustomerService()
	
	// 先检查客户是否存在
	_, err := customerService.GetCustomerByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"message": "客户不存在",
			"error":   err.Error(),
		})
		return
	}

	// 删除客户
	if err := customerService.DeleteCustomer(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "删除客户失败",
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "客户删除成功",
		"code":    200,
		"data":    nil,
	})
}
