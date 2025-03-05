// model/product.go
package model

import (
	"database/sql/driver"
	"encoding/json"
	"errors"
	"time"
)

// StringArray 字符串数组类型，用于存储产品特性
type StringArray []string

// Value 实现driver.Valuer接口
func (a StringArray) Value() (driver.Value, error) {
	return json.Marshal(a)
}

// Scan 实现sql.Scanner接口
func (a *StringArray) Scan(value interface{}) error {
	b, ok := value.([]byte)
	if !ok {
		return errors.New("类型断言到[]byte失败")
	}
	return json.Unmarshal(b, &a)
}

// Product 产品模型
type Product struct {
	ID          string      `json:"id" gorm:"primaryKey"`
	Name        string      `json:"name" gorm:"not null"`
	Description string      `json:"description"`
	Features    StringArray `json:"features" gorm:"type:json"`
	CreatedAt   time.Time   `json:"createdAt" gorm:"autoCreateTime"`
	UpdatedAt   time.Time   `json:"updatedAt" gorm:"autoUpdateTime"`
}

// TableName 指定表名
func (Product) TableName() string {
	return "products"
}
