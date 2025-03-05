package utils

import (
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"LVerity/pkg/model"
	"time"
)

// GenerateFingerprint 生成设备指纹
func GenerateFingerprint(diskID, bios, motherboard string) string {
	// 构造设备信息
	deviceInfo := map[string]string{
		"disk_id":     diskID,
		"bios":        bios,
		"motherboard": motherboard,
	}

	// 将设备信息转换为JSON
	data, err := json.Marshal(deviceInfo)
	if err != nil {
		return ""
	}

	// 计算SHA256哈希
	hash := sha256.Sum256(data)
	return hex.EncodeToString(hash[:])
}

// GenerateDeviceUUID 生成UUID
func GenerateDeviceUUID() string {
	uuid := make([]byte, 16)
	_, err := rand.Read(uuid)
	if err != nil {
		// 如果随机数生成失败，使用时间戳作为备选
		now := timeNow()
		copy(uuid, []byte(fmt.Sprintf("%d", now.UnixNano())))
	}

	// 设置版本 (4) 和变体位
	uuid[6] = (uuid[6] & 0x0f) | 0x40 // Version 4
	uuid[8] = (uuid[8] & 0x3f) | 0x80 // Variant is 10

	return fmt.Sprintf("%x-%x-%x-%x-%x",
		uuid[0:4],
		uuid[4:6],
		uuid[6:8],
		uuid[8:10],
		uuid[10:16])
}

// timeNow 获取当前时间（可以被测试替换）
var timeNow = func() time.Time {
	return time.Now()
}

// 设备状态
const (
	DeviceStatusNormal    = "normal"
	DeviceStatusAbnormal  = "abnormal"
	DeviceStatusOffline   = "offline"
)

// IsDeviceSuspicious 检查设备是否可疑
func IsDeviceSuspicious(device *model.Device) bool {
	// 检查设备风险等级
	if device.RiskLevel >= 0.8 {
		return true
	}

	// 检查警报次数
	if device.AlertCount >= 5 {
		return true
	}

	// 检查最后一次警报时间
	if device.LastAlertTime != nil && time.Since(*device.LastAlertTime) < time.Hour*24 {
		return true
	}

	return false
}

// CalculateDeviceRisk 计算设备风险评分
func CalculateDeviceRisk(device *model.Device, behaviors []model.AbnormalBehavior) float64 {
	var risk float64 = 0.0

	// 基于设备状态评分
	switch device.Status {
	case model.DeviceStatusSuspect:
		risk += 0.4
	case model.DeviceStatusOffline:
		risk += 0.2
	case model.DeviceStatusBlocked:
		risk += 0.6
	}

	// 基于最后心跳时间评分
	if device.LastHeartbeat != nil {
		offlineHours := time.Since(*device.LastHeartbeat).Hours()
		if offlineHours > 24 {
			risk += 0.2
		} else if offlineHours > 12 {
			risk += 0.1
		}
	}

	// 基于异常行为评分
	if len(behaviors) > 0 {
		// 计算最近24小时内的异常行为数量
		recentBehaviors := 0
		for _, behavior := range behaviors {
			if time.Since(behavior.CreatedAt) <= time.Hour*24 {
				recentBehaviors++
				// 根据异常行为级别增加风险分数
				switch behavior.Level {
				case "high":
					risk += 0.2
				case "medium":
					risk += 0.1
				case "low":
					risk += 0.05
				}
			}
		}

		// 根据异常行为数量增加额外风险分数
		if recentBehaviors >= 5 {
			risk += 0.3
		} else if recentBehaviors >= 3 {
			risk += 0.2
		}
	}

	// 基于警报次数评分
	if device.AlertCount > 0 {
		if device.AlertCount >= 5 {
			risk += 0.3
		} else if device.AlertCount >= 3 {
			risk += 0.2
		} else {
			risk += 0.1
		}
	}

	// 确保风险分数在 0-1 之间
	if risk > 1.0 {
		risk = 1.0
	}
	if risk < 0.0 {
		risk = 0.0
	}

	return risk
}
