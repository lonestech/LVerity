package test

import (
	"LVerity/pkg/database"
	"LVerity/pkg/model"
	"LVerity/pkg/service"
	"testing"
	"time"
)

func TestDeviceMonitor(t *testing.T) {
	cleanup := setupTest(t)
	defer cleanup()

	// 创建测试设备
	device := &model.Device{
		ID:          "test-device-1",
		Name:        "Test Device 1",
		Status:      model.DeviceStatusNormal,
		LastSeen:    time.Now().Add(-1 * time.Hour),
		Fingerprint: "device-fingerprint-1",
	}
	if err := database.DB.Create(device).Error; err != nil {
		t.Fatalf("Failed to create test device: %v", err)
	}

	monitor := service.GetDeviceMonitor()
	monitor.Start()
	defer monitor.Stop()

	t.Run("UpdateDeviceHeartbeat", func(t *testing.T) {
		ip := "192.168.1.100"
		err := monitor.UpdateDeviceHeartbeat(device.ID, ip, nil)
		if err != nil {
			t.Errorf("UpdateDeviceHeartbeat failed: %v", err)
		}

		// 验证设备状态已更新
		var updatedDevice model.Device
		if err := database.DB.First(&updatedDevice, "id = ?", device.ID).Error; err != nil {
			t.Fatalf("Failed to get updated device: %v", err)
		}

		if updatedDevice.Status != model.DeviceStatusNormal {
			t.Errorf("Expected device status to be normal, got %s", updatedDevice.Status)
		}
		if updatedDevice.LastIP != ip {
			t.Errorf("Expected device IP to be %s, got %s", ip, updatedDevice.LastIP)
		}
	})

	t.Run("CleanupOfflineDevices", func(t *testing.T) {
		// 创建一个长时间未活动的设备
		offlineDevice := &model.Device{
			ID:          "test-device-2",
			Name:        "Test Device 2",
			Status:      model.DeviceStatusNormal,
			LastSeen:    time.Now().Add(-2 * time.Hour),
			Fingerprint: "device-fingerprint-2",
		}
		if err := database.DB.Create(offlineDevice).Error; err != nil {
			t.Fatalf("Failed to create offline test device: %v", err)
		}

		// 运行清理
		monitor.CleanupOfflineDevices()

		// 验证设备状态已更新为离线
		var updatedDevice model.Device
		if err := database.DB.First(&updatedDevice, "id = ?", offlineDevice.ID).Error; err != nil {
			t.Fatalf("Failed to get updated device: %v", err)
		}

		if updatedDevice.Status != model.DeviceStatusOffline {
			t.Errorf("Expected device status to be offline, got %s", updatedDevice.Status)
		}
	})

	t.Run("DeviceSession", func(t *testing.T) {
		// 创建新的会话
		session := service.NewDeviceSession(device.ID)
		
		// 等待一小段时间
		time.Sleep(100 * time.Millisecond)
		
		// 结束会话
		duration := session.End()
		
		if duration <= 0 {
			t.Errorf("Expected session duration > 0, got %d", duration)
		}

		// 验证设备统计已更新
		var updatedDevice model.Device
		if err := database.DB.First(&updatedDevice, "id = ?", device.ID).Error; err != nil {
			t.Fatalf("Failed to get updated device: %v", err)
		}

		if updatedDevice.UsageStats == nil {
			t.Fatal("Expected device usage stats to be initialized")
		}

		if updatedDevice.UsageStats.TotalUsageTime <= 0 {
			t.Errorf("Expected total usage time > 0, got %d", updatedDevice.UsageStats.TotalUsageTime)
		}
		if updatedDevice.UsageStats.SessionCount != 1 {
			t.Errorf("Expected session count to be 1, got %d", updatedDevice.UsageStats.SessionCount)
		}
	})
}
