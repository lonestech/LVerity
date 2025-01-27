package service

import (
	"LVerity/pkg/model"
	"encoding/json"
	"fmt"
	"regexp"
	"strings"
	"time"
)

// MatchBlacklistRule 检查设备是否匹配黑名单规则
func MatchBlacklistRule(device *model.Device, rule *model.BlacklistRule) (bool, error) {
	var value string

	// 根据规则类型获取对应的设备信息
	switch rule.Type {
	case "disk_id":
		value = device.DiskID
	case "bios":
		value = device.BIOS
	case "motherboard":
		value = device.Motherboard
	default:
		return false, fmt.Errorf("unknown rule type: %s", rule.Type)
	}

	// 使用正则表达式匹配
	matched, err := regexp.MatchString(rule.Pattern, value)
	if err != nil {
		return false, fmt.Errorf("invalid pattern: %v", err)
	}

	return matched, nil
}

// CompareDevices 比较两个设备的差异
func CompareDevices(device1, device2 *model.Device) []string {
	var differences []string

	if device1.DiskID != device2.DiskID {
		differences = append(differences, fmt.Sprintf("DiskID: %s -> %s", device1.DiskID, device2.DiskID))
	}
	if device1.BIOS != device2.BIOS {
		differences = append(differences, fmt.Sprintf("BIOS: %s -> %s", device1.BIOS, device2.BIOS))
	}
	if device1.Motherboard != device2.Motherboard {
		differences = append(differences, fmt.Sprintf("Motherboard: %s -> %s", device1.Motherboard, device2.Motherboard))
	}
	if device1.Name != device2.Name {
		differences = append(differences, fmt.Sprintf("Name: %s -> %s", device1.Name, device2.Name))
	}
	if device1.Status != device2.Status {
		differences = append(differences, fmt.Sprintf("Status: %s -> %s", device1.Status, device2.Status))
	}

	return differences
}

// ValidateDeviceInfo 验证设备信息是否完整
func ValidateDeviceInfo(device *model.Device) error {
	if device.DiskID == "" {
		return fmt.Errorf("disk_id is required")
	}
	if device.BIOS == "" {
		return fmt.Errorf("bios is required")
	}
	if device.Motherboard == "" {
		return fmt.Errorf("motherboard is required")
	}
	if device.Name == "" {
		return fmt.Errorf("name is required")
	}
	return nil
}

// IsDeviceOnline 检查设备是否在线
func IsDeviceOnline(device *model.Device) bool {
	if device.LastHeartbeat == nil {
		return false
	}
	heartbeatTimeout := time.Duration(device.HeartbeatRate) * time.Second * 2
	return time.Since(*device.LastHeartbeat) <= heartbeatTimeout
}

// IsDeviceBlocked 检查设备是否被封禁
func IsDeviceBlocked(device *model.Device) bool {
	return device.Status == model.DeviceStatusBlocked
}

// ParseNetworkCards 解析网卡信息
func ParseNetworkCards(networkCardsJSON string) ([]map[string]string, error) {
	var networkCards []map[string]string
	if err := json.Unmarshal([]byte(networkCardsJSON), &networkCards); err != nil {
		return nil, err
	}
	return networkCards, nil
}

// FormatNetworkCards 格式化网卡信息
func FormatNetworkCards(networkCards []map[string]string) (string, error) {
	data, err := json.Marshal(networkCards)
	if err != nil {
		return "", err
	}
	return string(data), nil
}

// GetDeviceIdentifier 获取设备唯一标识
func GetDeviceIdentifier(device *model.Device) string {
	parts := []string{
		device.DiskID,
		device.BIOS,
		device.Motherboard,
	}
	return strings.Join(parts, "|")
}
