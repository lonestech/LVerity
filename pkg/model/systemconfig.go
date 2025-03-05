// pkg/model/systemconfig.go
package model

import (
	"time"
)

// SystemConfig 系统配置模型
type SystemConfig struct {
	ID          string    `json:"id" gorm:"primaryKey"`
	Name        string    `json:"name" gorm:"uniqueIndex"` // 配置名称，唯一索引
	Value       string    `json:"value"`                   // 配置值
	Description string    `json:"description"`             // 配置描述
	Group       string    `json:"group"`                   // 配置分组
	IsSystem    bool      `json:"isSystem"`                // 是否系统配置（系统配置不可删除）
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt"`
}

// TableName 指定表名
func (SystemConfig) TableName() string {
	return "system_configs"
}

// SystemConfigGroup 系统配置组常量
const (
	ConfigGroupSystem    = "system"    // 系统配置
	ConfigGroupSecurity  = "security"  // 安全配置
	ConfigGroupUI        = "ui"        // 界面配置
	ConfigGroupNetwork   = "network"   // 网络配置
	ConfigGroupBackup    = "backup"    // 备份配置
	ConfigGroupIntegration = "integration" // 集成配置
	ConfigGroupNotification = "notification" // 通知配置
)

// DefaultSystemConfigs 默认系统配置
var DefaultSystemConfigs = []SystemConfig{
	{
		Name:        "system.name",
		Value:       "LVerity系统",
		Description: "系统名称",
		Group:       ConfigGroupSystem,
		IsSystem:    true,
	},
	{
		Name:        "system.mode",
		Value:       "production",
		Description: "系统运行模式",
		Group:       ConfigGroupSystem,
		IsSystem:    true,
	},
	{
		Name:        "ui.theme",
		Value:       "light",
		Description: "界面主题",
		Group:       ConfigGroupUI,
		IsSystem:    true,
	},
	{
		Name:        "ui.language",
		Value:       "zh_CN",
		Description: "界面语言",
		Group:       ConfigGroupUI,
		IsSystem:    true,
	},
	{
		Name:        "security.passwordExpiration",
		Value:       "90",
		Description: "密码过期天数",
		Group:       ConfigGroupSecurity,
		IsSystem:    true,
	},
	{
		Name:        "security.loginAttempts",
		Value:       "5",
		Description: "最大登录尝试次数",
		Group:       ConfigGroupSecurity,
		IsSystem:    true,
	},
	{
		Name:        "security.sessionTimeout",
		Value:       "30",
		Description: "会话超时时间(分钟)",
		Group:       ConfigGroupSecurity,
		IsSystem:    true,
	},
	{
		Name:        "backup.autoBackup",
		Value:       "true",
		Description: "是否自动备份",
		Group:       ConfigGroupBackup,
		IsSystem:    true,
	},
	{
		Name:        "backup.retentionDays",
		Value:       "30",
		Description: "备份保留天数",
		Group:       ConfigGroupBackup,
		IsSystem:    true,
	},
	{
		Name:        "notification.email",
		Value:       "true",
		Description: "是否启用邮件通知",
		Group:       ConfigGroupNotification,
		IsSystem:    true,
	},
}
