package service

import (
	"LVerity/pkg/database"
	"LVerity/pkg/model"
	"LVerity/pkg/utils"
	"encoding/json"
	"errors"
	"time"
)

// RegisterDevice 注册设备
func RegisterDevice(diskID, bios, motherboard, name string) (*model.Device, error) {
	// 检查设备是否已存在
	if err := database.GetDB().Where("disk_id = ? AND bios = ? AND motherboard = ?", diskID, bios, motherboard).First(&model.Device{}).Error; err == nil {
		return nil, errors.New("device already exists")
	}

	// 创建新设备
	device := &model.Device{
		ID:          utils.GenerateDeviceUUID(),
		Name:        name,
		DiskID:      diskID,
		BIOS:        bios,
		Motherboard: motherboard,
		Status:      model.DeviceStatusNormal,
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}

	if err := database.GetDB().Create(device).Error; err != nil {
		return nil, err
	}

	return device, nil
}

// GetDevice 获取设备信息
func GetDevice(deviceID string) (*model.Device, error) {
	var device model.Device
	if err := database.GetDB().Where("id = ?", deviceID).First(&device).Error; err != nil {
		return nil, err
	}
	return &device, nil
}

// GetDeviceByHardwareInfo 根据硬件信息获取设备
func GetDeviceByHardwareInfo(diskID, bios, motherboard string) (*model.Device, error) {
	var device model.Device
	if err := database.GetDB().Where("disk_id = ? AND bios = ? AND motherboard = ?", diskID, bios, motherboard).First(&device).Error; err != nil {
		return nil, err
	}
	return &device, nil
}

// UpdateDeviceInfo 更新设备信息
func UpdateDeviceInfo(deviceID string, updateData map[string]interface{}) error {
	// 验证设备是否存在
	if err := database.GetDB().Where("id = ?", deviceID).First(&model.Device{}).Error; err != nil {
		return err
	}

	// 更新设备信息
	if err := database.GetDB().Model(&model.Device{}).
		Where("id = ?", deviceID).
		Updates(updateData).Error; err != nil {
		return err
	}

	return nil
}

// DeleteDevice 删除设备
func DeleteDevice(deviceID string) error {
	if err := database.GetDB().Delete(&model.Device{}, "id = ?", deviceID).Error; err != nil {
		return err
	}
	return nil
}

// BlockDevice 禁用设备
func BlockDevice(deviceID string) error {
	device, err := GetDevice(deviceID)
	if err != nil {
		return err
	}

	now := time.Now()
	device.Status = model.DeviceStatusBlocked
	device.BlockTime = &now
	device.UpdatedAt = now

	if err := database.GetDB().Save(device).Error; err != nil {
		return err
	}

	return nil
}

// UnblockDevice 解除设备禁用
func UnblockDevice(deviceID string) error {
	device, err := GetDevice(deviceID)
	if err != nil {
		return err
	}

	device.Status = model.DeviceStatusNormal
	device.BlockTime = nil
	device.BlockReason = ""
	device.UpdatedAt = time.Now()

	if err := database.GetDB().Save(device).Error; err != nil {
		return err
	}

	return nil
}

// GetDevicesByStatus 获取指定状态的设备列表
func GetDevicesByStatus(status string) ([]model.Device, error) {
	var devices []model.Device
	if err := database.GetDB().Where("status = ?", status).Find(&devices).Error; err != nil {
		return nil, err
	}
	return devices, nil
}

// GetDeviceCount 获取设备数量
func GetDeviceCount(status string) (int64, error) {
	var count int64
	query := database.GetDB().Model(&model.Device{})
	if status != "" {
		query = query.Where("status = ?", status)
	}
	if err := query.Count(&count).Error; err != nil {
		return 0, err
	}
	return count, nil
}

// GetDevicesByTimeRange 获取指定时间范围内的设备
func GetDevicesByTimeRange(startTime, endTime time.Time) ([]model.Device, error) {
	var devices []model.Device
	if err := database.GetDB().Where("created_at BETWEEN ? AND ?", startTime, endTime).Find(&devices).Error; err != nil {
		return nil, err
	}
	return devices, nil
}

// GetActiveDevices 获取活动设备列表
func GetActiveDevices() ([]model.Device, error) {
	return GetDevicesByStatus(string(model.DeviceStatusNormal))
}

// GetBlockedDevices 获取已禁用的设备列表
func GetBlockedDevices() ([]model.Device, error) {
	return GetDevicesByStatus(string(model.DeviceStatusBlocked))
}

// GetOfflineDevices 获取离线设备列表
func GetOfflineDevices() ([]model.Device, error) {
	return GetDevicesByStatus(string(model.DeviceStatusOffline))
}

// GetDevicesByGroup 获取组内设备
func GetDevicesByGroup(groupID string) ([]model.Device, error) {
	var devices []model.Device
	if err := database.GetDB().Where("group_id = ?", groupID).Find(&devices).Error; err != nil {
		return nil, err
	}
	return devices, nil
}

// AssignDeviceToGroup 分配设备到组
func AssignDeviceToGroup(deviceID string, groupID string) error {
	return database.GetDB().Model(&model.Device{}).Where("id = ?", deviceID).Update("group_id", groupID).Error
}

// UpdateDeviceHeartbeat 更新设备心跳
func UpdateDeviceHeartbeat(deviceID string) error {
	now := time.Now()
	updates := map[string]interface{}{
		"last_heartbeat": now,
		"updated_at":     now,
	}
	return database.GetDB().Model(&model.Device{}).Where("id = ?", deviceID).Updates(updates).Error
}

// CheckOfflineDevices 检查离线设备
func CheckOfflineDevices() error {
	var devices []model.Device
	if err := database.GetDB().Where("status = ?", model.DeviceStatusNormal).Find(&devices).Error; err != nil {
		return err
	}

	for _, device := range devices {
		if device.LastHeartbeat == nil {
			continue
		}

		heartbeatTimeout := time.Duration(device.HeartbeatRate) * time.Second * 2
		if time.Since(*device.LastHeartbeat) > heartbeatTimeout {
			device.Status = model.DeviceStatusOffline
			device.UpdatedAt = time.Now()
			if err := database.GetDB().Save(&device).Error; err != nil {
				return err
			}
		}
	}

	return nil
}

// GetDeviceInfo 获取设备详细信息
func GetDeviceInfo(deviceID string) (*model.Device, error) {
	device, err := GetDevice(deviceID)
	if err != nil {
		return nil, err
	}

	// 加载关联数据
	if err := database.GetDB().Model(device).Association("Group").Find(&device.Group); err != nil {
		return nil, err
	}

	return device, nil
}

// UpdateDeviceMetadata 更新设备元数据
func UpdateDeviceMetadata(deviceID string, metadata map[string]interface{}) error {
	device, err := GetDevice(deviceID)
	if err != nil {
		return err
	}

	metadataJSON, err := json.Marshal(metadata)
	if err != nil {
		return err
	}

	device.Metadata = string(metadataJSON)
	device.UpdatedAt = time.Now()

	return database.GetDB().Save(device).Error
}

// GetDeviceStats 获取设备统计信息
func GetDeviceStats() (*model.DeviceStats, error) {
	var stats model.DeviceStats
	var err error

	// 获取总设备数
	stats.TotalCount, err = GetDeviceCount("")
	if err != nil {
		return nil, err
	}

	// 获取活动设备数
	stats.ActiveCount, err = GetDeviceCount(string(model.DeviceStatusNormal))
	if err != nil {
		return nil, err
	}

	// 获取离线设备数
	stats.OfflineCount, err = GetDeviceCount(string(model.DeviceStatusOffline))
	if err != nil {
		return nil, err
	}

	// 获取禁用设备数
	stats.BlockedCount, err = GetDeviceCount(string(model.DeviceStatusBlocked))
	if err != nil {
		return nil, err
	}

	// 计算在线率
	if stats.TotalCount > 0 {
		stats.OnlineRate = float64(stats.ActiveCount) / float64(stats.TotalCount) * 100
	}

	return &stats, nil
}

// GetDeviceStatus 获取设备当前状态
func GetDeviceStatus(deviceID string) string {
	device, err := GetDevice(deviceID)
	if err != nil {
		return string(model.DeviceStatusUnknown)
	}

	if device.Status == model.DeviceStatusBlocked {
		return string(model.DeviceStatusBlocked)
	}

	if device.LastHeartbeat == nil {
		return string(model.DeviceStatusOffline)
	}

	heartbeatTimeout := time.Duration(device.HeartbeatRate) * time.Second * 2
	if time.Since(*device.LastHeartbeat) > heartbeatTimeout {
		return string(model.DeviceStatusOffline)
	}

	return string(model.DeviceStatusNormal)
}

// CalculateDeviceRiskLevel 计算设备风险等级
func CalculateDeviceRiskLevel(deviceID string) int {
	device, err := GetDevice(deviceID)
	if err != nil {
		return 100 // 无法获取设备信息时返回最高风险等级
	}

	var riskLevel int

	// 基础风险分值
	switch device.Status {
	case model.DeviceStatusBlocked:
		riskLevel += 100
	case model.DeviceStatusOffline:
		riskLevel += 50
	case model.DeviceStatusNormal:
		riskLevel += 0
	default:
		riskLevel += 75
	}

	// 心跳检查
	if device.LastHeartbeat != nil {
		heartbeatTimeout := time.Duration(device.HeartbeatRate) * time.Second * 2
		if time.Since(*device.LastHeartbeat) > heartbeatTimeout {
			riskLevel += 30
		}
	} else {
		riskLevel += 40
	}

	// 告警检查
	var alertCount int64
	if err := database.GetDB().Model(&model.Alert{}).
		Where("device_id = ? AND status = ? AND created_at > ?",
			deviceID,
			model.AlertStatusOpen,
			time.Now().Add(-24*time.Hour)).
		Count(&alertCount).Error; err == nil {
		if alertCount > 10 {
			riskLevel += 30
		} else if alertCount > 5 {
			riskLevel += 20
		} else if alertCount > 0 {
			riskLevel += 10
		}
	}

	// 确保风险等级在0-100之间
	if riskLevel > 100 {
		riskLevel = 100
	} else if riskLevel < 0 {
		riskLevel = 0
	}

	return riskLevel
}

// ListDevices 获取设备列表
func ListDevices(page string, pageSize string, filters ...string) ([]model.Device, int64, error) {
	var devices []model.Device
	var total int64

	offset, limit := utils.GetPagination(page, pageSize)
	query := database.GetDB().Model(&model.Device{})

	// 应用过滤条件
	for _, filter := range filters {
		if filter != "" {
			query = query.Where("status = ?", filter)
		}
	}

	// 获取总数
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// 获取分页数据
	if err := query.Offset(offset).Limit(limit).Find(&devices).Error; err != nil {
		return nil, 0, err
	}

	return devices, total, nil
}

// UpdateDevice 更新设备
func UpdateDevice(deviceID string, updates map[string]interface{}) error {
	result := database.GetDB().Model(&model.Device{}).Where("id = ?", deviceID).Updates(updates)
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return errors.New("device not found")
	}
	return nil
}

// GetAllDevices 获取所有设备
func GetAllDevices() ([]model.Device, error) {
	var devices []model.Device
	if err := database.GetDB().Find(&devices).Error; err != nil {
		return nil, err
	}
	return devices, nil
}

// UpdateDeviceRiskLevel 更新设备风险等级
func UpdateDeviceRiskLevel(deviceID string, riskLevel float64) error {
	result := database.GetDB().Model(&model.Device{}).
		Where("id = ?", deviceID).
		Update("risk_level", riskLevel)
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return errors.New("device not found")
	}
	return nil
}

// UpdateDeviceStats 更新设备使用统计
func UpdateDeviceStats(deviceID string, stats *model.UsageStats) error {
	// 将 UsageStats 转换为数据库字段
	updates := map[string]interface{}{
		"last_active_date":   stats.LastActiveDate,
		"average_usage_time": stats.AverageUsageTime,
		"peak_usage_time":    stats.PeakUsageTime,
	}

	result := database.GetDB().Model(&model.Device{}).
		Where("id = ?", deviceID).
		Updates(updates)
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return errors.New("device not found")
	}
	return nil
}

// GetDeviceAbnormalBehaviors 获取设备异常行为记录
func GetDeviceAbnormalBehaviors(deviceID string) ([]model.AbnormalBehavior, error) {
	var behaviors []model.AbnormalBehavior
	if err := database.GetDB().Where("device_id = ?", deviceID).Find(&behaviors).Error; err != nil {
		return nil, err
	}
	return behaviors, nil
}

// RecordAbnormalBehavior 记录异常行为
func RecordAbnormalBehavior(deviceID, behaviorType, description, level string, data map[string]interface{}) error {
	// 序列化数据
	dataJSON, err := json.Marshal(data)
	if err != nil {
		return err
	}

	behavior := &model.AbnormalBehavior{
		ID:          utils.GenerateDeviceUUID(),
		DeviceID:    deviceID,
		Type:        behaviorType,
		Description: description,
		Level:       level,
		Data:        string(dataJSON),
		CreatedAt:   time.Now(),
	}

	if err := database.GetDB().Create(behavior).Error; err != nil {
		return err
	}

	return nil
}

// BlockDeviceWithReason 禁用设备并记录原因
func BlockDeviceWithReason(deviceID string, reason string) error {
	now := time.Now()
	updates := map[string]interface{}{
		"status":       model.DeviceStatusBlocked,
		"block_reason": reason,
		"block_time":   now,
		"updated_at":   now,
	}

	result := database.GetDB().Model(&model.Device{}).
		Where("id = ?", deviceID).
		Updates(updates)
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return errors.New("device not found")
	}
	return nil
}

// ActivateDevice 激活设备
func ActivateDevice(deviceID string) error {
	device, err := GetDevice(deviceID)
	if err != nil {
		return err
	}

	now := time.Now()
	device.Status = model.DeviceStatusNormal
	device.UpdatedAt = now

	if err := database.GetDB().Save(device).Error; err != nil {
		return err
	}

	return nil
}

// DeactivateDevice 停用设备
func DeactivateDevice(deviceID string) error {
	device, err := GetDevice(deviceID)
	if err != nil {
		return err
	}

	now := time.Now()
	device.Status = model.DeviceStatusInactive
	device.UpdatedAt = now

	if err := database.GetDB().Save(device).Error; err != nil {
		return err
	}

	return nil
}

// RestartDevice 重启设备
func RestartDevice(deviceID string) error {
	// 这里可能需要调用设备API或者发送重启指令
	// 暂时只记录重启请求
	device, err := GetDevice(deviceID)
	if err != nil {
		return err
	}
	
	// 记录重启指令
	now := time.Now()
	device.LastCommandAt = &now
	device.LastCommand = "restart"
	device.UpdatedAt = now
	
	if err := database.GetDB().Save(device).Error; err != nil {
		return err
	}
	
	return nil
}

// UnbindLicense 解绑设备授权
func UnbindLicense(deviceID string) error {
	device, err := GetDevice(deviceID)
	if err != nil {
		return err
	}
	
	// 清除授权绑定信息
	device.LicenseID = ""
	device.UpdatedAt = time.Now()
	
	if err := database.GetDB().Save(device).Error; err != nil {
		return err
	}
	
	return nil
}
