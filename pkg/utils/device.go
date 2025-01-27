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

// GenerateUUID 生成UUID
func GenerateUUID() string {
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

// CalculateDeviceRisk 计算设备风险评分
func CalculateDeviceRisk(device *model.Device) float64 {
	// TODO: 实现设备风险评分算法
	// 这里是一个简单的示例实现
	var risk float64 = 0.0

	// 基于设备状态评分
	switch device.Status {
	case DeviceStatusAbnormal:
		risk += 0.5
	case DeviceStatusOffline:
		risk += 0.3
	}

	// 基于最后心跳时间评分
	if device.LastHeartbeat != nil && time.Since(*device.LastHeartbeat) > time.Hour*24 {
		risk += 0.2
	}

	return risk
}
