package model

import (
	"time"
)

// SecurityLog 安全日志
type SecurityLog struct {
	ID        string    `gorm:"primaryKey;type:varchar(36)" json:"id"`
	UserID    string    `gorm:"type:varchar(36);not null;index" json:"user_id"`
	Action    string    `gorm:"type:varchar(50);not null" json:"action"`
	IPAddress string    `gorm:"type:varchar(50);not null" json:"ip_address"`
	UserAgent string    `gorm:"type:varchar(255);not null" json:"user_agent"`
	CreatedAt time.Time `gorm:"not null" json:"created_at"`
}
