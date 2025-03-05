// pkg/model/backup.go
package model

import (
	"time"
)

// BackupType 备份类型
type BackupType string

const (
	BackupTypeManual    BackupType = "manual"    // 手动备份
	BackupTypeScheduled BackupType = "scheduled" // 计划备份
	BackupTypeAutomatic BackupType = "automatic" // 自动备份
)

// BackupStatus 备份状态
type BackupStatus string

const (
	BackupStatusCompleted BackupStatus = "completed" // 完成
	BackupStatusFailed    BackupStatus = "failed"    // 失败
	BackupStatusRunning   BackupStatus = "running"   // 进行中
	BackupStatusPending   BackupStatus = "pending"   // 等待中
)

// SystemBackup 系统备份模型
type SystemBackup struct {
	ID           string       `json:"id" gorm:"primaryKey"`
	Name         string       `json:"name"`
	Description  string       `json:"description"`
	Type         BackupType   `json:"type"`
	Status       BackupStatus `json:"status"`
	FilePath     string       `json:"filePath"`
	FileSize     int64        `json:"fileSize"`
	Duration     int          `json:"duration"` // 备份耗时(秒)
	CreatedBy    string       `json:"createdBy"`
	CreatedAt    time.Time    `json:"createdAt"`
	CompletedAt  *time.Time   `json:"completedAt"`
	IsAutoDelete bool         `json:"isAutoDelete"` // 是否自动删除
	RetentionDays int         `json:"retentionDays"` // 保留天数
}

// TableName 指定表名
func (SystemBackup) TableName() string {
	return "system_backups"
}

// BackupConfig 备份配置
type BackupConfig struct {
	ID              string    `json:"id" gorm:"primaryKey"`
	AutoBackup      bool      `json:"autoBackup"`      // 是否自动备份
	BackupPath      string    `json:"backupPath"`      // 备份路径
	Schedule        string    `json:"schedule"`        // 备份计划 (cron表达式)
	RetentionCount  int       `json:"retentionCount"`  // 保留备份数量
	RetentionDays   int       `json:"retentionDays"`   // 保留天数
	CompressBackup  bool      `json:"compressBackup"`  // 是否压缩备份
	IncludeDatabase bool      `json:"includeDatabase"` // 是否包含数据库
	IncludeFiles    bool      `json:"includeFiles"`    // 是否包含文件
	IncludeLogs     bool      `json:"includeLogs"`     // 是否包含日志
	LastBackupAt    time.Time `json:"lastBackupAt"`    // 上次备份时间
	CreatedAt       time.Time `json:"createdAt"`
	UpdatedAt       time.Time `json:"updatedAt"`
}

// TableName 指定表名
func (BackupConfig) TableName() string {
	return "backup_config"
}
