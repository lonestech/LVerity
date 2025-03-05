// service/product.go
package service

import (
	"LVerity/pkg/database"
	"LVerity/pkg/model"
	"fmt"
)

// ProductService 产品服务接口
type ProductService interface {
	GetProducts() ([]model.Product, error)
	GetProductByID(id string) (*model.Product, error)
	CreateProduct(product *model.Product) error
	UpdateProduct(product *model.Product) error
	DeleteProduct(id string) error
}

// productService 产品服务实现
type productService struct{}

// NewProductService 创建产品服务实例
func NewProductService() ProductService {
	return &productService{}
}

// GetProducts 获取所有产品
func (s *productService) GetProducts() ([]model.Product, error) {
	var products []model.Product
	if err := database.DB.Find(&products).Error; err != nil {
		return nil, fmt.Errorf("获取产品列表失败: %w", err)
	}
	return products, nil
}

// GetProductByID 根据ID获取产品
func (s *productService) GetProductByID(id string) (*model.Product, error) {
	var product model.Product
	if err := database.DB.Where("id = ?", id).First(&product).Error; err != nil {
		return nil, fmt.Errorf("获取产品失败: %w", err)
	}
	return &product, nil
}

// CreateProduct 创建产品
func (s *productService) CreateProduct(product *model.Product) error {
	if err := database.DB.Create(product).Error; err != nil {
		return fmt.Errorf("创建产品失败: %w", err)
	}
	return nil
}

// UpdateProduct 更新产品
func (s *productService) UpdateProduct(product *model.Product) error {
	if err := database.DB.Save(product).Error; err != nil {
		return fmt.Errorf("更新产品失败: %w", err)
	}
	return nil
}

// DeleteProduct 删除产品
func (s *productService) DeleteProduct(id string) error {
	if err := database.DB.Delete(&model.Product{}, "id = ?", id).Error; err != nil {
		return fmt.Errorf("删除产品失败: %w", err)
	}
	return nil
}
