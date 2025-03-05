// service/customer.go
package service

import (
	"LVerity/pkg/database"
	"LVerity/pkg/model"
	"fmt"
)

// CustomerService 客户服务接口
type CustomerService interface {
	GetCustomers() ([]model.Customer, error)
	GetCustomerByID(id string) (*model.Customer, error)
	CreateCustomer(customer *model.Customer) error
	UpdateCustomer(customer *model.Customer) error
	DeleteCustomer(id string) error
}

// customerService 客户服务实现
type customerService struct{}

// NewCustomerService 创建客户服务实例
func NewCustomerService() CustomerService {
	return &customerService{}
}

// GetCustomers 获取所有客户
func (s *customerService) GetCustomers() ([]model.Customer, error) {
	var customers []model.Customer
	if err := database.DB.Find(&customers).Error; err != nil {
		return nil, fmt.Errorf("获取客户列表失败: %w", err)
	}
	return customers, nil
}

// GetCustomerByID 根据ID获取客户
func (s *customerService) GetCustomerByID(id string) (*model.Customer, error) {
	var customer model.Customer
	if err := database.DB.Where("id = ?", id).First(&customer).Error; err != nil {
		return nil, fmt.Errorf("获取客户失败: %w", err)
	}
	return &customer, nil
}

// CreateCustomer 创建客户
func (s *customerService) CreateCustomer(customer *model.Customer) error {
	if err := database.DB.Create(customer).Error; err != nil {
		return fmt.Errorf("创建客户失败: %w", err)
	}
	return nil
}

// UpdateCustomer 更新客户
func (s *customerService) UpdateCustomer(customer *model.Customer) error {
	if err := database.DB.Save(customer).Error; err != nil {
		return fmt.Errorf("更新客户失败: %w", err)
	}
	return nil
}

// DeleteCustomer 删除客户
func (s *customerService) DeleteCustomer(id string) error {
	if err := database.DB.Delete(&model.Customer{}, "id = ?", id).Error; err != nil {
		return fmt.Errorf("删除客户失败: %w", err)
	}
	return nil
}
