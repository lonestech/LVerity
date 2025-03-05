package model

// SystemInitStatus 系统初始化状态
type SystemInitStatus struct {
	Initialized      bool `json:"initialized"`        // 系统是否已初始化
	HasAdmin         bool `json:"hasAdmin"`           // 是否已有管理员账户
	SystemConfigured bool `json:"systemConfigured"`   // 系统基础配置是否已完成
}

// InitAdminParams 初始化管理员账户参数
type InitAdminParams struct {
	Username        string `json:"username" binding:"required"`
	Password        string `json:"password" binding:"required"`
	ConfirmPassword string `json:"confirmPassword" binding:"required"`
	Email           string `json:"email"`
	Name            string `json:"name"`
}
