// model/customer.go
package model

import "time"

// Customer 客户模型
type Customer struct {
	ID           string    `json:"id" gorm:"primaryKey"`
	Name         string    `json:"name" gorm:"not null"`
	ContactName  string    `json:"contactName"`
	ContactEmail string    `json:"contactEmail"`
	ContactPhone string    `json:"contactPhone"`
	Address      string    `json:"address"`
	CreatedAt    time.Time `json:"createdAt" gorm:"autoCreateTime"`
	UpdatedAt    time.Time `json:"updatedAt" gorm:"autoUpdateTime"`
}

// TableName 指定表名
func (Customer) TableName() string {
	return "customers"
}
