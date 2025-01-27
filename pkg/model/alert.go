package model

import "time"

// AlertStatus 告警状态
type AlertStatus string

const (
	AlertStatusOpen     AlertStatus = "open"
	AlertStatusClosed   AlertStatus = "closed"
	AlertStatusResolved AlertStatus = "resolved"
)

// Alert 告警记录
type Alert struct {
	ID          string      `json:"id" gorm:"primaryKey"`
	DeviceID    string      `json:"device_id" gorm:"index"`
	Level       AlertLevel  `json:"level"`
	Status      AlertStatus `json:"status"`
	Title       string      `json:"title"`
	Description string      `json:"description"`
	CreatedAt   time.Time   `json:"created_at"`
	UpdatedAt   time.Time   `json:"updated_at"`
	ResolvedAt  *time.Time  `json:"resolved_at,omitempty"`
	ResolvedBy  string      `json:"resolved_by,omitempty"`
	Metadata    string      `json:"metadata"`
}
