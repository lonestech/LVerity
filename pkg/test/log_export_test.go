package test

import (
	"LVerity/pkg/database"
	"LVerity/pkg/model"
	"LVerity/pkg/service"
	"LVerity/pkg/utils"
	"bytes"
	"encoding/csv"
	"encoding/json"
	"testing"
	"time"
)

func TestLogExport(t *testing.T) {
	cleanup := setupTest(t)
	defer cleanup()

	// 创建测试数据
	deviceID := "test-device-1"
	now := time.Now()
	
	// 创建设备日志
	logs := []model.DeviceLog{
		{
			DeviceID:  deviceID,
			Type:      "login",
			Action:    "user_login",
			Status:    "success",
			Duration:  3600,
			IP:        "192.168.1.100",
			Timestamp: now,
		},
		{
			DeviceID:  deviceID,
			Type:      "logout",
			Action:    "user_logout",
			Status:    "success",
			Duration:  0,
			IP:        "192.168.1.100",
			Timestamp: now.Add(1 * time.Hour),
		},
	}

	for _, log := range logs {
		if err := database.DB.Create(&log).Error; err != nil {
			t.Fatalf("Failed to create test log: %v", err)
		}
	}

	// 创建位置日志
	locationLogs := []model.DeviceLocationLog{
		{
			ID:       utils.GenerateUUID(),
			DeviceID: deviceID,
			Location: model.Location{
				Latitude:  40.7128,
				Longitude: -74.0060,
				Country:   "United States",
				City:      "New York",
			},
			Timestamp: now,
		},
		{
			ID:       utils.GenerateUUID(),
			DeviceID: deviceID,
			Location: model.Location{
				Latitude:  34.0522,
				Longitude: -118.2437,
				Country:   "United States",
				City:      "Los Angeles",
			},
			Timestamp: now.Add(2 * time.Hour),
		},
	}

	for _, log := range locationLogs {
		if err := database.DB.Create(&log).Error; err != nil {
			t.Fatalf("Failed to create test location log: %v", err)
		}
	}

	t.Run("ExportDeviceLogsCSV", func(t *testing.T) {
		var buf bytes.Buffer
		err := service.ExportDeviceLogs(&buf, service.LogExportOptions{
			StartTime: now.Add(-1 * time.Hour),
			EndTime:   now.Add(2 * time.Hour),
			DeviceID:  deviceID,
			Format:    service.LogExportFormatCSV,
		})

		if err != nil {
			t.Fatalf("ExportDeviceLogs failed: %v", err)
		}

		// 验证CSV格式
		reader := csv.NewReader(&buf)
		records, err := reader.ReadAll()
		if err != nil {
			t.Fatalf("Failed to read CSV: %v", err)
		}

		if len(records) != 3 { // 头部 + 2条记录
			t.Errorf("Expected 3 CSV records, got %d", len(records))
		}
	})

	t.Run("ExportDeviceLogsJSON", func(t *testing.T) {
		var buf bytes.Buffer
		err := service.ExportDeviceLogs(&buf, service.LogExportOptions{
			StartTime: now.Add(-1 * time.Hour),
			EndTime:   now.Add(2 * time.Hour),
			DeviceID:  deviceID,
			Format:    service.LogExportFormatJSON,
		})

		if err != nil {
			t.Fatalf("ExportDeviceLogs failed: %v", err)
		}

		// 验证JSON格式
		var exportedLogs []map[string]interface{}
		if err := json.NewDecoder(&buf).Decode(&exportedLogs); err != nil {
			t.Fatalf("Failed to decode JSON: %v", err)
		}

		if len(exportedLogs) != 2 {
			t.Errorf("Expected 2 JSON records, got %d", len(exportedLogs))
		}
	})

	t.Run("ExportDeviceLocationLogsCSV", func(t *testing.T) {
		var buf bytes.Buffer
		err := service.ExportDeviceLocationLogs(&buf, service.LogExportOptions{
			StartTime: now.Add(-1 * time.Hour),
			EndTime:   now.Add(3 * time.Hour),
			DeviceID:  deviceID,
			Format:    service.LogExportFormatCSV,
		})

		if err != nil {
			t.Fatalf("ExportDeviceLocationLogs failed: %v", err)
		}

		// 验证CSV格式
		reader := csv.NewReader(&buf)
		records, err := reader.ReadAll()
		if err != nil {
			t.Fatalf("Failed to read CSV: %v", err)
		}

		if len(records) != 3 { // 头部 + 2条记录
			t.Errorf("Expected 3 CSV records, got %d", len(records))
		}
	})

	t.Run("ExportDeviceLocationLogsJSON", func(t *testing.T) {
		var buf bytes.Buffer
		err := service.ExportDeviceLocationLogs(&buf, service.LogExportOptions{
			StartTime: now.Add(-1 * time.Hour),
			EndTime:   now.Add(3 * time.Hour),
			DeviceID:  deviceID,
			Format:    service.LogExportFormatJSON,
		})

		if err != nil {
			t.Fatalf("ExportDeviceLocationLogs failed: %v", err)
		}

		// 验证JSON格式
		var exportedLogs []map[string]interface{}
		if err := json.NewDecoder(&buf).Decode(&exportedLogs); err != nil {
			t.Fatalf("Failed to decode JSON: %v", err)
		}

		if len(exportedLogs) != 2 {
			t.Errorf("Expected 2 JSON records, got %d", len(exportedLogs))
		}
	})
}
