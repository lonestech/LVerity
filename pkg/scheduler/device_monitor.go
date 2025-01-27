package scheduler

import (
	"LVerity/pkg/model"
	"LVerity/pkg/service"
	"LVerity/pkg/utils"
	"log"
	"time"
)

// StartDeviceMonitor 启动设备监控任务
func StartDeviceMonitor() {
	// 每分钟检查一次离线设备
	go func() {
		ticker := time.NewTicker(1 * time.Minute)
		for range ticker.C {
			if err := checkOfflineDevices(); err != nil {
				log.Printf("Error checking offline devices: %v", err)
			}
		}
	}()

	// 每5分钟检查一次异常行为
	go func() {
		ticker := time.NewTicker(5 * time.Minute)
		for range ticker.C {
			if err := checkAbnormalBehaviors(); err != nil {
				log.Printf("Error checking abnormal behaviors: %v", err)
			}
		}
	}()

	// 每小时进行一次设备状态统计
	go func() {
		ticker := time.NewTicker(1 * time.Hour)
		for range ticker.C {
			if err := updateDeviceStatistics(); err != nil {
				log.Printf("Error updating device statistics: %v", err)
			}
		}
	}()
}

// checkOfflineDevices 检查离线设备
func checkOfflineDevices() error {
	return service.CheckOfflineDevices()
}

// checkAbnormalBehaviors 检查异常行为
func checkAbnormalBehaviors() error {
	// 获取所有正常状态的设备
	devices, err := service.GetDevicesByStatus(model.DeviceStatusNormal)
	if err != nil {
		return err
	}

	for _, device := range devices {
		// 获取设备的异常行为记录
		behaviors, err := service.GetDeviceAbnormalBehaviors(device.ID)
		if err != nil {
			log.Printf("Error getting abnormal behaviors for device %s: %v", device.ID, err)
			continue
		}

		// 检查设备是否可疑
		if utils.IsDeviceSuspicious(&device) {
			// 记录可疑行为
			err := service.RecordAbnormalBehavior(
				device.ID,
				"suspicious_activity",
				"Device showing suspicious behavior patterns",
				"high",
				map[string]interface{}{
					"risk_level":  device.RiskLevel,
					"alert_count": device.AlertCount,
				},
			)
			if err != nil {
				log.Printf("Error recording abnormal behavior for device %s: %v", device.ID, err)
				continue
			}

			// 更新设备状态为可疑
			if device.Status != model.DeviceStatusSuspect {
				err := service.BlockDeviceWithReason(
					device.ID,
					"Suspicious activity detected - multiple abnormal behaviors",
				)
				if err != nil {
					log.Printf("Error blocking suspicious device %s: %v", device.ID, err)
				}
			}
		}

		// 检查设备风险等级
		riskLevel := utils.CalculateDeviceRisk(&device, behaviors)
		if riskLevel > device.RiskLevel {
			// 更新设备风险等级
			if err := service.UpdateDeviceRiskLevel(device.ID, riskLevel); err != nil {
				log.Printf("Error updating risk level for device %s: %v", device.ID, err)
			}
		}
	}

	return nil
}

// updateDeviceStatistics 更新设备统计信息
func updateDeviceStatistics() error {
	// 获取所有设备
	devices, err := service.GetAllDevices()
	if err != nil {
		return err
	}

	for _, device := range devices {
		// 更新设备使用统计
		stats := device.UsageStats
		if stats == nil {
			stats = &model.UsageStats{}
		}

		// 更新日均使用时长
		if !stats.LastActiveDate.IsZero() {
			daysSinceActive := time.Since(stats.LastActiveDate).Hours() / 24
			if daysSinceActive > 0 {
				stats.AverageUsageTime = int64(float64(stats.TotalUsageTime) / daysSinceActive)
			}
		}

		// 更新设备统计信息
		if err := service.UpdateDeviceStats(device.ID, stats); err != nil {
			log.Printf("Error updating statistics for device %s: %v", device.ID, err)
			continue
		}
	}

	return nil
}
