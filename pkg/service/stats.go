package service

import (
	"LVerity/pkg/model"
	"LVerity/pkg/store"
	"time"
)

// SystemStats 系统统计信息
type SystemStats struct {
	TotalDevices    int64     `json:"total_devices"`     // 设备总数
	OnlineDevices   int64     `json:"online_devices"`    // 在线设备数量
	TotalLicenses   int64     `json:"total_licenses"`    // 授权码总数
	ActiveLicenses  int64     `json:"active_licenses"`   // 已激活授权码数量
	UnusedLicenses  int64     `json:"unused_licenses"`   // 未使用授权码数量
	LastUpdateTime  time.Time `json:"last_update_time"`  // 最后更新时间
}

// GetSystemStats 获取系统统计信息
func GetSystemStats() (*SystemStats, error) {
	var stats SystemStats

	// 统计设备数量
	if err := store.GetDB().Model(&model.Device{}).Count(&stats.TotalDevices).Error; err != nil {
		return nil, err
	}

	// 统计在线设备数量
	if err := store.GetDB().Model(&model.Device{}).
		Where("status = ?", model.DeviceStatusNormal).
		Count(&stats.OnlineDevices).Error; err != nil {
		return nil, err
	}

	// 统计授权码数量
	if err := store.GetDB().Model(&model.License{}).Count(&stats.TotalLicenses).Error; err != nil {
		return nil, err
	}

	// 统计已激活授权码数量
	if err := store.GetDB().Model(&model.License{}).
		Where("status = ?", model.LicenseStatusActive).
		Count(&stats.ActiveLicenses).Error; err != nil {
		return nil, err
	}

	// 统计未使用授权码数量
	if err := store.GetDB().Model(&model.License{}).
		Where("status = ?", model.LicenseStatusInactive).
		Count(&stats.UnusedLicenses).Error; err != nil {
		return nil, err
	}

	stats.LastUpdateTime = time.Now()
	return &stats, nil
}

// GetLicenseActivationTrend 获取授权码激活趋势
func GetLicenseActivationTrend(days int) ([]map[string]interface{}, error) {
	var results []map[string]interface{}
	startDate := time.Now().AddDate(0, 0, -days)

	rows, err := store.GetDB().Table("licenses").
		Select("DATE(updated_at) as date, COUNT(*) as count").
		Where("status = ? AND updated_at >= ?", model.LicenseStatusActive, startDate).
		Group("DATE(updated_at)").
		Order("date ASC").
		Rows()

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var date string
		var count int64
		if err := rows.Scan(&date, &count); err != nil {
			return nil, err
		}
		results = append(results, map[string]interface{}{
			"date":  date,
			"count": count,
		})
	}

	return results, nil
}

// GetDeviceActivationTrend 获取设备激活趋势
func GetDeviceActivationTrend(days int) ([]map[string]interface{}, error) {
	var results []map[string]interface{}
	startDate := time.Now().AddDate(0, 0, -days)

	rows, err := store.GetDB().Table("devices").
		Select("DATE(created_at) as date, COUNT(*) as count").
		Where("created_at >= ?", startDate).
		Group("DATE(created_at)").
		Order("date ASC").
		Rows()

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var date string
		var count int64
		if err := rows.Scan(&date, &count); err != nil {
			return nil, err
		}
		results = append(results, map[string]interface{}{
			"date":  date,
			"count": count,
		})
	}

	return results, nil
}
