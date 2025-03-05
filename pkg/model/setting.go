// model/setting.go
package model

import (
	"database/sql/driver"
	"encoding/json"
	"errors"
	"time"
)

// SettingType 设置类型
type SettingType string

const (
	SettingTypeSystem   SettingType = "system"   // 系统设置
	SettingTypeUI       SettingType = "ui"       // 界面设置
	SettingTypeEmail    SettingType = "email"    // 邮件设置
	SettingTypeSMS      SettingType = "sms"      // 短信设置
	SettingTypeAlert    SettingType = "alert"    // 告警设置
	SettingTypeDatabase SettingType = "database" // 数据库设置
	SettingTypeBackup   SettingType = "backup"   // 备份设置
	SettingTypeSecurity SettingType = "security" // 安全设置
)

// IsValid 检查设置类型是否有效
func (s SettingType) IsValid() bool {
	switch s {
	case SettingTypeSystem, SettingTypeUI, SettingTypeEmail, SettingTypeSMS,
		SettingTypeAlert, SettingTypeDatabase, SettingTypeBackup, SettingTypeSecurity:
		return true
	default:
		return false
	}
}

// String 返回设置类型的字符串表示
func (s SettingType) String() string {
	return string(s)
}

// JSONValue 用于存储JSON格式的设置值
type JSONValue map[string]interface{}

// Value 实现driver.Valuer接口，用于将JSONValue转换为数据库值
func (j JSONValue) Value() (driver.Value, error) {
	if j == nil {
		return nil, nil
	}
	return json.Marshal(j)
}

// Scan 实现sql.Scanner接口，用于将数据库值转换为JSONValue
func (j *JSONValue) Scan(value interface{}) error {
	if value == nil {
		*j = nil
		return nil
	}

	bytes, ok := value.([]byte)
	if !ok {
		return errors.New("类型断言为[]byte失败")
	}

	if err := json.Unmarshal(bytes, &j); err != nil {
		return err
	}
	return nil
}

// Setting 系统设置模型
type Setting struct {
	ID          string      `json:"id" gorm:"primaryKey"`
	Key         string      `json:"key" gorm:"uniqueIndex:idx_settings_key,length:191;type:varchar(191)"` // 设置键
	Value       JSONValue   `json:"value" gorm:"type:text"`                                               // 设置值（JSON格式）
	Type        SettingType `json:"type" gorm:"type:varchar(20)"`                                         // 设置类型
	Description string      `json:"description" gorm:"type:text"`                                         // 设置描述
	CreatedAt   time.Time   `json:"createdAt"`                                                            // 创建时间
	UpdatedAt   time.Time   `json:"updatedAt"`                                                            // 更新时间
}

// TableName 指定Setting表名
func (Setting) TableName() string {
	return "settings"
}
