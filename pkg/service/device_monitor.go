package service

import (
	"LVerity/pkg/model"
	"LVerity/pkg/store"
	"gorm.io/gorm"
	"sync"
	"time"
)

const (
	deviceOfflineThreshold = 30 * time.Minute
	deviceCleanupInterval = 1 * time.Hour
)

var (
	deviceMonitor *DeviceMonitor
	monitorOnce   sync.Once
)

// DeviceMonitor 设备监控器
type DeviceMonitor struct {
	stopChan chan struct{}
	sessions map[string]*DeviceSession
	mu       sync.RWMutex
	running  bool
}

// DeviceSession 设备会话
type DeviceSession struct {
	DeviceID  string
	StartTime time.Time
}

// GetDeviceMonitor 获取设备监控器单例
func GetDeviceMonitor() *DeviceMonitor {
	monitorOnce.Do(func() {
		deviceMonitor = &DeviceMonitor{
			stopChan: make(chan struct{}),
			sessions: make(map[string]*DeviceSession),
		}
	})
	return deviceMonitor
}

// Start 启动监控
func (dm *DeviceMonitor) Start() {
	dm.mu.Lock()
	if dm.running {
		dm.mu.Unlock()
		return
	}
	dm.running = true
	dm.mu.Unlock()

	go func() {
		ticker := time.NewTicker(deviceCleanupInterval)
		defer ticker.Stop()

		for {
			select {
			case <-ticker.C:
				dm.CleanupOfflineDevices()
			case <-dm.stopChan:
				return
			}
		}
	}()
}

// Stop 停止监控
func (dm *DeviceMonitor) Stop() {
	dm.mu.Lock()
	defer dm.mu.Unlock()

	if !dm.running {
		return
	}

	close(dm.stopChan)
	dm.running = false
}

// UpdateDeviceHeartbeat 更新设备心跳
func (dm *DeviceMonitor) UpdateDeviceHeartbeat(deviceID, ip string, location *model.Location) error {
	dm.mu.Lock()
	defer dm.mu.Unlock()

	now := time.Now()

	// 更新设备状态
	updates := map[string]interface{}{
		"status":     model.DeviceStatusNormal,
		"last_seen":  now,
		"last_ip":    ip,
		"updated_at": now,
	}

	if location != nil {
		updates["location"] = location
	}

	// 更新设备状态
	if err := store.GetDB().Model(&model.Device{}).
		Where("id = ?", deviceID).
		Updates(updates).Error; err != nil {
		return err
	}

	// 检查是否需要创建新会话
	if _, exists := dm.sessions[deviceID]; !exists {
		dm.sessions[deviceID] = &DeviceSession{
			DeviceID:  deviceID,
			StartTime: now,
		}
	}

	return nil
}

// CleanupOfflineDevices 清理离线设备
func (dm *DeviceMonitor) CleanupOfflineDevices() {
	dm.mu.RLock()
	defer dm.mu.RUnlock()

	offlineTime := time.Now().Add(-deviceOfflineThreshold)

	// 查找所有长时间未活动的设备
	var devices []model.Device
	if err := store.GetDB().Where("last_seen < ? AND status = ?", offlineTime, model.DeviceStatusNormal).Find(&devices).Error; err != nil {
		return
	}

	// 更新设备状态为离线
	for _, device := range devices {
		if err := store.GetDB().Model(&device).Updates(map[string]interface{}{
			"status":     model.DeviceStatusOffline,
			"updated_at": time.Now(),
		}).Error; err != nil {
			continue
		}

		// 结束设备会话
		if session, ok := dm.sessions[device.ID]; ok {
			session.End(device.ID)
			delete(dm.sessions, device.ID)
		}
	}
}

// NewDeviceSession 创建新的设备会话
func NewDeviceSession(deviceID string) *DeviceSession {
	return &DeviceSession{
		DeviceID:  deviceID,
		StartTime: time.Now(),
	}
}

// End 结束会话并更新设备使用统计
func (s *DeviceSession) End(deviceID string) int64 {
	duration := time.Since(s.StartTime).Seconds()
	
	// 更新设备使用统计
	now := time.Now()
	updates := map[string]interface{}{
		"avg_usage_time": gorm.Expr("(avg_usage_time * alert_count + ?) / (alert_count + 1)", duration),
		"alert_count":    gorm.Expr("alert_count + 1"),
		"last_active_date": now,
		"updated_at":     now,
	}

	if err := store.GetDB().Model(&model.Device{}).
		Where("id = ?", deviceID).
		Updates(updates).Error; err != nil {
		return 0
	}

	return int64(duration)
}
