package model

// AlertLevel 告警级别
type AlertLevel string

const (
	AlertLevelInfo     AlertLevel = "info"     // 信息
	AlertLevelWarning  AlertLevel = "warning"  // 警告
	AlertLevelError    AlertLevel = "error"    // 错误
	AlertLevelCritical AlertLevel = "critical" // 严重
)

// IsValid 检查告警级别是否有效
func (l AlertLevel) IsValid() bool {
	switch l {
	case AlertLevelInfo, AlertLevelWarning, AlertLevelError, AlertLevelCritical:
		return true
	default:
		return false
	}
}

// GetPriority 获取告警级别的优先级
func (l AlertLevel) GetPriority() int {
	switch l {
	case AlertLevelInfo:
		return 0
	case AlertLevelWarning:
		return 1
	case AlertLevelError:
		return 2
	case AlertLevelCritical:
		return 3
	default:
		return -1
	}
}
