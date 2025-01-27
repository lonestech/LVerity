package test

import (
	"LVerity/pkg/database"
	"LVerity/pkg/model"
	"LVerity/pkg/service"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	"testing"
	"time"
)

// setupTest 初始化测试环境
func setupTest(t *testing.T) func() {
	// 使用SQLite内存数据库
	db, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	if err != nil {
		t.Fatalf("Failed to connect to test database: %v", err)
	}

	// 自动迁移数据库结构
	err = db.AutoMigrate(
		&model.Device{},
		&model.Alert{},
	)
	if err != nil {
		t.Fatalf("Failed to migrate test database: %v", err)
	}

	// 设置全局数据库连接
	database.DB = db

	// 返回清理函数
	return func() {
		sqlDB, err := db.DB()
		if err != nil {
			t.Errorf("Failed to get underlying DB: %v", err)
			return
		}
		sqlDB.Close()
	}
}

func TestAlertManager(t *testing.T) {
	cleanup := setupTest(t)
	defer cleanup()

	t.Run("CreateAlert", func(t *testing.T) {
		// 创建测试设备
		device := &model.Device{
			ID:          "test-device",
			Name:        "Test Device",
			Status:      model.DeviceStatusNormal,
			Fingerprint: "test-device-fingerprint-1",
			LastSeen:    time.Now(),
		}
		if err := database.DB.Create(device).Error; err != nil {
			t.Fatalf("Failed to create test device: %v", err)
		}

		// 创建告警
		alert, err := service.CreateAlert(device.ID, "test_alert", model.AlertLevelWarning, "Test alert message", "")
		if err != nil {
			t.Fatalf("Failed to create alert: %v", err)
		}

		// 验证告警信息
		if alert.DeviceID != device.ID {
			t.Errorf("Expected device ID %s, got %s", device.ID, alert.DeviceID)
		}
		if alert.Type != "test_alert" {
			t.Errorf("Expected alert type %s, got %s", "test_alert", alert.Type)
		}
		if alert.Level != model.AlertLevelWarning {
			t.Errorf("Expected alert level %s, got %s", model.AlertLevelWarning, alert.Level)
		}
		if alert.Status != model.AlertStatusOpen {
			t.Errorf("Expected alert status %s, got %s", model.AlertStatusOpen, alert.Status)
		}
	})

	t.Run("GetAlert", func(t *testing.T) {
		// 创建测试设备
		device := &model.Device{
			ID:          "test-device-2",
			Name:        "Test Device 2",
			Status:      model.DeviceStatusNormal,
			Fingerprint: "test-device-fingerprint-2",
			LastSeen:    time.Now(),
		}
		if err := database.DB.Create(device).Error; err != nil {
			t.Fatalf("Failed to create test device: %v", err)
		}

		// 创建告警
		alert, err := service.CreateAlert(device.ID, "test_alert", model.AlertLevelWarning, "Test alert message", "")
		if err != nil {
			t.Fatalf("Failed to create alert: %v", err)
		}

		// 获取告警
		retrievedAlert, err := service.GetAlert(alert.ID)
		if err != nil {
			t.Fatalf("Failed to get alert: %v", err)
		}

		// 验证告警信息
		if retrievedAlert.ID != alert.ID {
			t.Errorf("Expected alert ID %s, got %s", alert.ID, retrievedAlert.ID)
		}
		if retrievedAlert.DeviceID != device.ID {
			t.Errorf("Expected device ID %s, got %s", device.ID, retrievedAlert.DeviceID)
		}
	})

	t.Run("UpdateAlertStatus", func(t *testing.T) {
		// 创建测试设备
		device := &model.Device{
			ID:          "test-device-3",
			Name:        "Test Device 3",
			Status:      model.DeviceStatusNormal,
			Fingerprint: "test-device-fingerprint-3",
			LastSeen:    time.Now(),
		}
		if err := database.DB.Create(device).Error; err != nil {
			t.Fatalf("Failed to create test device: %v", err)
		}

		// 创建告警
		alert, err := service.CreateAlert(device.ID, "test_alert", model.AlertLevelWarning, "Test alert message", "")
		if err != nil {
			t.Fatalf("Failed to create alert: %v", err)
		}

		// 更新告警状态
		err = service.UpdateAlertStatus(alert.ID, model.AlertStatusResolved)
		if err != nil {
			t.Fatalf("Failed to update alert status: %v", err)
		}

		// 获取更新后的告警
		updatedAlert, err := service.GetAlert(alert.ID)
		if err != nil {
			t.Fatalf("Failed to get updated alert: %v", err)
		}

		// 验证状态更新
		if updatedAlert.Status != model.AlertStatusResolved {
			t.Errorf("Expected alert status %s, got %s", model.AlertStatusResolved, updatedAlert.Status)
		}
	})

	t.Run("DeleteAlert", func(t *testing.T) {
		// 创建测试设备
		device := &model.Device{
			ID:          "test-device-4",
			Name:        "Test Device 4",
			Status:      model.DeviceStatusNormal,
			Fingerprint: "test-device-fingerprint-4",
			LastSeen:    time.Now(),
		}
		if err := database.DB.Create(device).Error; err != nil {
			t.Fatalf("Failed to create test device: %v", err)
		}

		// 创建告警
		alert, err := service.CreateAlert(device.ID, "test_alert", model.AlertLevelWarning, "Test alert message", "")
		if err != nil {
			t.Fatalf("Failed to create alert: %v", err)
		}

		// 删除告警
		err = service.DeleteAlert(alert.ID)
		if err != nil {
			t.Fatalf("Failed to delete alert: %v", err)
		}

		// 尝试获取已删除的告警
		_, err = service.GetAlert(alert.ID)
		if err == nil {
			t.Error("Expected error when getting deleted alert")
		}
	})
}

func TestAlertQueries(t *testing.T) {
	cleanup := setupTest(t)
	defer cleanup()

	// 创建测试设备
	device := &model.Device{
		ID:          "test-device-5",
		Name:        "Test Device 5",
		Status:      model.DeviceStatusNormal,
		Fingerprint: "test-device-fingerprint-5",
		LastSeen:    time.Now(),
	}
	if err := database.DB.Create(device).Error; err != nil {
		t.Fatalf("Failed to create test device: %v", err)
	}

	// 创建多个测试告警
	alerts := []struct {
		deviceID string
		level    model.AlertLevel
		status   model.AlertStatus
		message  string
	}{
		{device.ID, model.AlertLevelWarning, model.AlertStatusOpen, "Warning alert 1"},
		{device.ID, model.AlertLevelCritical, model.AlertStatusOpen, "Critical alert 1"},
		{device.ID, model.AlertLevelWarning, model.AlertStatusResolved, "Warning alert 2"},
		{device.ID, model.AlertLevelInfo, model.AlertStatusOpen, "Info alert 1"},
	}

	createdTime := time.Now()
	for _, a := range alerts {
		alert, err := service.CreateAlert(a.deviceID, "test_alert", a.level, a.message, "")
		if err != nil {
			t.Fatalf("Failed to create alert: %v", err)
		}
		// 设置告警状态
		if err := service.UpdateAlertStatus(alert.ID, a.status); err != nil {
			t.Fatalf("Failed to update alert status: %v", err)
		}
	}

	t.Run("GetAlertsByDevice", func(t *testing.T) {
		deviceAlerts, err := service.GetAlertsByDevice(device.ID)
		if err != nil {
			t.Fatalf("Failed to get alerts by device: %v", err)
		}
		if len(deviceAlerts) != len(alerts) {
			t.Errorf("Expected %d alerts, got %d", len(alerts), len(deviceAlerts))
		}
	})

	t.Run("GetAlertsByStatus", func(t *testing.T) {
		openAlerts, err := service.GetAlertsByStatus(model.AlertStatusOpen)
		if err != nil {
			t.Fatalf("Failed to get alerts by status: %v", err)
		}
		expectedOpenAlerts := 3 // Warning 1, Critical 1, Info 1
		if len(openAlerts) != expectedOpenAlerts {
			t.Errorf("Expected %d open alerts, got %d", expectedOpenAlerts, len(openAlerts))
		}
	})

	t.Run("GetAlertsByLevel", func(t *testing.T) {
		warningAlerts, err := service.GetAlertsByLevel(model.AlertLevelWarning)
		if err != nil {
			t.Fatalf("Failed to get alerts by level: %v", err)
		}
		expectedWarningAlerts := 2 // Warning 1, Warning 2
		if len(warningAlerts) != expectedWarningAlerts {
			t.Errorf("Expected %d warning alerts, got %d", expectedWarningAlerts, len(warningAlerts))
		}
	})

	t.Run("GetAlertsByTimeRange", func(t *testing.T) {
		startTime := createdTime.Add(-time.Hour)
		endTime := createdTime.Add(time.Hour)
		timeRangeAlerts, err := service.GetAlertsByTimeRange(startTime, endTime)
		if err != nil {
			t.Fatalf("Failed to get alerts by time range: %v", err)
		}
		if len(timeRangeAlerts) != len(alerts) {
			t.Errorf("Expected %d alerts in time range, got %d", len(alerts), len(timeRangeAlerts))
		}
	})

	t.Run("GetAlertCount", func(t *testing.T) {
		// 测试获取设备的所有告警数量
		totalCount, err := service.GetAlertCount(device.ID, "")
		if err != nil {
			t.Fatalf("Failed to get total alert count: %v", err)
		}
		if totalCount != int64(len(alerts)) {
			t.Errorf("Expected total count %d, got %d", len(alerts), totalCount)
		}

		// 测试获取设备的打开状态告警数量
		openCount, err := service.GetAlertCount(device.ID, model.AlertStatusOpen)
		if err != nil {
			t.Fatalf("Failed to get open alert count: %v", err)
		}
		expectedOpenCount := int64(3) // Warning 1, Critical 1, Info 1
		if openCount != expectedOpenCount {
			t.Errorf("Expected open count %d, got %d", expectedOpenCount, openCount)
		}
	})
}

// TestAlertHandler 用于测试的告警处理器
type TestAlertHandler struct {
	t       *testing.T
	handled bool
}

// Handle 处理告警
func (h *TestAlertHandler) Handle(alert *model.Alert) error {
	h.handled = true
	return nil
}
