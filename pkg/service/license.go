package service

import (
	"LVerity/pkg/database"
	"LVerity/pkg/model"
	"LVerity/pkg/utils"
	"encoding/json"
	"errors"
	"fmt"
	"time"
)

// GenerateLicense 生成授权码
func GenerateLicense(licenseType model.LicenseType, maxDevices int, startTime time.Time, expireTime time.Time, groupID string, features []string, usageLimit int64) (*model.License, error) {
	// 生成授权码
	code := utils.GenerateUUID()

	// 序列化功能列表
	featuresJSON, err := json.Marshal(features)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal features: %v", err)
	}

	// 创建授权记录
	license := &model.License{
		ID:          utils.GenerateUUID(),
		Code:        code,
		Type:        licenseType,
		Status:      model.LicenseStatusUnused,
		MaxDevices:  maxDevices,
		StartTime:   startTime,
		ExpireTime:  expireTime,
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
		GroupID:     groupID,
		Features:    features,
		FeaturesStr: string(featuresJSON),
		UsageLimit:  usageLimit,
		UsageCount:  0,
	}

	if err := database.GetDB().Create(license).Error; err != nil {
		return nil, fmt.Errorf("failed to create license: %v", err)
	}

	return license, nil
}

// VerifyLicense 验证授权码
func VerifyLicense(code string) (bool, error) {
	var license model.License
	if err := database.GetDB().Where("code = ?", code).First(&license).Error; err != nil {
		return false, fmt.Errorf("failed to get license: %v", err)
	}

	// 处理 Features 字段
	if license.FeaturesStr != "" {
		if err := json.Unmarshal([]byte(license.FeaturesStr), &license.Features); err != nil {
			return false, fmt.Errorf("failed to unmarshal features: %v", err)
		}
	}

	// 检查授权状态
	if license.Status != model.LicenseStatusUnused && license.Status != model.LicenseStatusActive {
		return false, fmt.Errorf("license is not valid")
	}

	// 检查过期时间
	if time.Now().After(license.ExpireTime) {
		return false, fmt.Errorf("license has expired")
	}

	return true, nil
}

// ActivateLicense 激活授权码
func ActivateLicense(code string, deviceID string) error {
	var license model.License
	if err := database.GetDB().Where("code = ?", code).First(&license).Error; err != nil {
		return fmt.Errorf("failed to get license: %v", err)
	}

	// 处理 Features 字段
	if license.FeaturesStr != "" {
		if err := json.Unmarshal([]byte(license.FeaturesStr), &license.Features); err != nil {
			return fmt.Errorf("failed to unmarshal features: %v", err)
		}
	}

	// 检查授权状态
	if license.Status != model.LicenseStatusUnused {
		return fmt.Errorf("license is not unused")
	}

	// 检查过期时间
	if time.Now().After(license.ExpireTime) {
		return fmt.Errorf("license has expired")
	}

	// 更新授权状态
	license.Status = model.LicenseStatusUsed
	license.DeviceID = deviceID
	license.UpdatedAt = time.Now()

	if err := database.GetDB().Save(&license).Error; err != nil {
		return fmt.Errorf("failed to update license: %v", err)
	}

	// 创建使用记录
	usage := &model.LicenseUsage{
		ID:        utils.GenerateUUID(),
		LicenseID: license.ID,
		DeviceID:  deviceID,
		StartTime: time.Now(),
		Status:    "active",
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	if err := database.GetDB().Create(usage).Error; err != nil {
		return fmt.Errorf("failed to create license usage: %v", err)
	}

	return nil
}

// BatchCreateLicense 批量生成授权码
func BatchCreateLicense(count int, licenseType model.LicenseType, maxDevices int, startTime time.Time, expireTime time.Time, groupID string, features []string, usageLimit int64) ([]*model.License, error) {
	var licenses []*model.License

	// 批量生成授权码
	for i := 0; i < count; i++ {
		code := utils.GenerateUUID()

		// 序列化功能列表
		featuresJSON, err := json.Marshal(features)
		if err != nil {
			return nil, fmt.Errorf("failed to marshal features: %v", err)
		}

		license := &model.License{
			ID:          utils.GenerateUUID(),
			Code:        code,
			Type:        licenseType,
			Status:      model.LicenseStatusUnused,
			MaxDevices:  maxDevices,
			StartTime:   startTime,
			ExpireTime:  expireTime,
			CreatedAt:   time.Now(),
			UpdatedAt:   time.Now(),
			GroupID:     groupID,
			Features:    features,
			FeaturesStr: string(featuresJSON),
			UsageLimit:  usageLimit,
			UsageCount:  0,
		}
		licenses = append(licenses, license)
	}

	// 批量创建授权记录
	if err := database.GetDB().Create(&licenses).Error; err != nil {
		return nil, fmt.Errorf("failed to create licenses: %v", err)
	}

	return licenses, nil
}

// QueryLicenses 查询授权记录
func QueryLicenses(status model.LicenseStatus, startTime time.Time, endTime time.Time) ([]model.License, error) {
	var licenses []model.License
	query := database.GetDB().Model(&model.License{})

	if status != "" {
		query = query.Where("status = ?", status)
	}
	if !startTime.IsZero() {
		query = query.Where("created_at >= ?", startTime)
	}
	if !endTime.IsZero() {
		query = query.Where("created_at <= ?", endTime)
	}

	if err := query.Find(&licenses).Error; err != nil {
		return nil, fmt.Errorf("failed to query licenses: %v", err)
	}

	// 处理 Features 字段
	for i := range licenses {
		if licenses[i].FeaturesStr != "" {
			if err := json.Unmarshal([]byte(licenses[i].FeaturesStr), &licenses[i].Features); err != nil {
				return nil, fmt.Errorf("failed to unmarshal features: %v", err)
			}
		}
	}

	return licenses, nil
}

// ImportLicenses 导入授权记录
func ImportLicenses(licenses []model.License) error {
	for i := range licenses {
		licenses[i].ID = utils.GenerateUUID()
		licenses[i].CreatedAt = time.Now()
		licenses[i].UpdatedAt = time.Now()
	}

	if err := database.GetDB().Create(&licenses).Error; err != nil {
		return fmt.Errorf("failed to import licenses: %v", err)
	}

	return nil
}

// QueryLicenseStats 查询授权统计信息
func QueryLicenseStats(startTime time.Time, endTime time.Time) (*model.LicenseStats, error) {
	stats := &model.LicenseStats{}

	// 统计总授权数
	if err := database.GetDB().Model(&model.License{}).Count(&stats.TotalCount).Error; err != nil {
		return nil, fmt.Errorf("failed to count total licenses: %v", err)
	}

	// 统计已使用授权数
	if err := database.GetDB().Model(&model.License{}).Where("status = ?", model.LicenseStatusUsed).Count(&stats.UsedCount).Error; err != nil {
		return nil, fmt.Errorf("failed to count used licenses: %v", err)
	}

	// 统计未使用授权数
	if err := database.GetDB().Model(&model.License{}).Where("status = ?", model.LicenseStatusUnused).Count(&stats.UnusedCount).Error; err != nil {
		return nil, fmt.Errorf("failed to count unused licenses: %v", err)
	}

	// 统计已过期授权数
	if err := database.GetDB().Model(&model.License{}).Where("expire_time < ?", time.Now()).Count(&stats.ExpiredCount).Error; err != nil {
		return nil, fmt.Errorf("failed to count expired licenses: %v", err)
	}

	// 统计各类型授权数量
	var typeStats []struct {
		Type  model.LicenseType `json:"type"`
		Count int64             `json:"count"`
	}
	if err := database.GetDB().Model(&model.License{}).Select("type, count(*) as count").Group("type").Scan(&typeStats).Error; err != nil {
		return nil, fmt.Errorf("failed to count license types: %v", err)
	}
	stats.TypeStats = make(map[model.LicenseType]int64)
	for _, ts := range typeStats {
		stats.TypeStats[ts.Type] = ts.Count
	}

	return stats, nil
}

// QueryDeviceLocationStats 查询设备位置统计信息
func QueryDeviceLocationStats(startTime time.Time, endTime time.Time) (*model.DeviceLocationStats, error) {
	stats := &model.DeviceLocationStats{}

	// 统计各省份设备数量
	var provinceStats []struct {
		Province string `json:"province"`
		Count    int64  `json:"count"`
	}
	if err := database.GetDB().Model(&model.Device{}).
		Select("province, count(*) as count").
		Where("province != ''").
		Group("province").
		Scan(&provinceStats).Error; err != nil {
		return nil, fmt.Errorf("failed to count devices by province: %v", err)
	}
	stats.ProvinceStats = make(map[string]int64)
	for _, ps := range provinceStats {
		stats.ProvinceStats[ps.Province] = ps.Count
	}

	// 统计各城市设备数量
	var cityStats []struct {
		City  string `json:"city"`
		Count int64  `json:"count"`
	}
	if err := database.GetDB().Model(&model.Device{}).
		Select("city, count(*) as count").
		Where("city != ''").
		Group("city").
		Scan(&cityStats).Error; err != nil {
		return nil, fmt.Errorf("failed to count devices by city: %v", err)
	}
	stats.CityStats = make(map[string]int64)
	for _, cs := range cityStats {
		stats.CityStats[cs.City] = cs.Count
	}

	return stats, nil
}

// DisableLicense 禁用授权码
func DisableLicense(code string) error {
	var license model.License
	if err := database.GetDB().Where("code = ?", code).First(&license).Error; err != nil {
		return fmt.Errorf("failed to get license: %v", err)
	}

	license.Status = model.LicenseStatusDisabled
	license.UpdatedAt = time.Now()

	if err := database.GetDB().Save(&license).Error; err != nil {
		return fmt.Errorf("failed to disable license: %v", err)
	}

	return nil
}

// GetLicenseInfo 获取授权码信息
func GetLicenseInfo(code string) (*model.License, error) {
	var license model.License
	if err := database.GetDB().Where("code = ?", code).First(&license).Error; err != nil {
		return nil, err
	}

	// 处理 Features 字段
	if license.FeaturesStr != "" {
		if err := json.Unmarshal([]byte(license.FeaturesStr), &license.Features); err != nil {
			return nil, fmt.Errorf("failed to unmarshal features: %v", err)
		}
	}

	return &license, nil
}

// BatchDisableLicense 批量禁用授权码
func BatchDisableLicense(codes []string) error {
	tx := database.GetDB().Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	for _, code := range codes {
		if err := tx.Model(&model.License{}).
			Where("code = ?", code).
			Updates(map[string]interface{}{
				"status":     model.LicenseStatusDisabled,
				"updated_at": time.Now(),
			}).Error; err != nil {
			tx.Rollback()
			return fmt.Errorf("failed to disable license %s: %v", code, err)
		}
	}

	return tx.Commit().Error
}

// BatchGetLicenseInfo 批量获取授权码信息
func BatchGetLicenseInfo(codes []string) ([]*model.License, error) {
	var licenses []*model.License
	if err := database.GetDB().Where("code IN ?", codes).Find(&licenses).Error; err != nil {
		return nil, fmt.Errorf("failed to get licenses: %v", err)
	}

	// 处理 Features 字段
	for i := range licenses {
		if licenses[i].FeaturesStr != "" {
			if err := json.Unmarshal([]byte(licenses[i].FeaturesStr), &licenses[i].Features); err != nil {
				return nil, fmt.Errorf("failed to unmarshal features: %v", err)
			}
		}
	}

	return licenses, nil
}

// CreateLicenseGroup 创建授权组
func CreateLicenseGroup(name string, description string, createdBy string) (*model.LicenseGroup, error) {
	group := &model.LicenseGroup{
		ID:          utils.GenerateUUID(),
		Name:        name,
		Description: description,
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
		CreatedBy:   createdBy,
	}

	if err := database.GetDB().Create(group).Error; err != nil {
		return nil, fmt.Errorf("failed to create license group: %v", err)
	}

	return group, nil
}

// CreateLicenseTag 创建授权标签
func CreateLicenseTag(name string, color string) (*model.LicenseTag, error) {
	tag := &model.LicenseTag{
		ID:        utils.GenerateUUID(),
		Name:      name,
		Color:     color,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	if err := database.GetDB().Create(tag).Error; err != nil {
		return nil, fmt.Errorf("failed to create license tag: %v", err)
	}

	return tag, nil
}

// AssignLicenseToGroup 将授权码分配到组
func AssignLicenseToGroup(licenseID string, groupID string) error {
	return database.GetDB().Model(&model.License{}).
		Where("id = ?", licenseID).
		Update("group_id", groupID).Error
}

// AddTagsToLicense 为授权码添加标签
func AddTagsToLicense(licenseID string, tagIDs []string) error {
	// 开启事务
	tx := database.GetDB().Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	// 删除现有映射
	if err := tx.Where("license_id = ?", licenseID).Delete(&model.LicenseTagMapping{}).Error; err != nil {
		tx.Rollback()
		return err
	}

	// 添加新映射
	for _, tagID := range tagIDs {
		mapping := &model.LicenseTagMapping{
			LicenseID: licenseID,
			TagID:     tagID,
			CreatedAt: time.Now(),
		}
		if err := tx.Create(mapping).Error; err != nil {
			tx.Rollback()
			return err
		}
	}

	return tx.Commit().Error
}

// UpdateLicenseMetadata 更新授权码元数据
func UpdateLicenseMetadata(code string, metadata string) error {
	result := database.GetDB().Model(&model.License{}).
		Where("code = ?", code).
		Update("metadata", metadata)

	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return errors.New("license not found")
	}
	return nil
}

// UpdateLicenseFeatures 更新授权码功能列表
func UpdateLicenseFeatures(licenseID string, features []string) error {
	featuresJSON, err := json.Marshal(features)
	if err != nil {
		return err
	}

	return database.GetDB().Model(&model.License{}).
		Where("id = ?", licenseID).
		Update("features", string(featuresJSON)).Error
}

// ListLicenses 获取授权码列表
func ListLicenses(page string, pageSize string, status string, groupID string) ([]model.License, int64, error) {
	var licenses []model.License
	var total int64

	offset, limit := utils.GetPagination(page, pageSize)
	query := database.GetDB().Model(&model.License{})

	// 应用过滤条件
	if status != "" {
		query = query.Where("status = ?", status)
	}
	if groupID != "" {
		query = query.Where("group_id = ?", groupID)
	}

	// 获取总数
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// 获取分页数据
	if err := query.Offset(offset).Limit(limit).Find(&licenses).Error; err != nil {
		return nil, 0, err
	}

	// 处理 Features 字段
	for i := range licenses {
		if licenses[i].FeaturesStr != "" {
			if err := json.Unmarshal([]byte(licenses[i].FeaturesStr), &licenses[i].Features); err != nil {
				return nil, 0, fmt.Errorf("failed to unmarshal features: %v", err)
			}
		}
	}

	return licenses, total, nil
}

// GetLicenseByCode 根据授权码获取授权信息
func GetLicenseByCode(code string) (*model.License, error) {
	var license model.License
	if err := database.GetDB().Where("code = ?", code).First(&license).Error; err != nil {
		return nil, err
	}

	// 处理 Features 字段
	if license.FeaturesStr != "" {
		if err := json.Unmarshal([]byte(license.FeaturesStr), &license.Features); err != nil {
			return nil, fmt.Errorf("failed to unmarshal features: %v", err)
		}
	}

	return &license, nil
}

// DeleteLicense 删除授权码
func DeleteLicense(code string) error {
	result := database.GetDB().Delete(&model.License{}, "code = ?", code)
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return errors.New("license not found")
	}
	return nil
}

// GenerateLicenseKey 生成随机授权密钥
func GenerateLicenseKey() (string, error) {
	// 使用utils包中的随机字符串生成器生成授权密钥
	// 生成格式为: XXXX-XXXX-XXXX-XXXX 的密钥
	part1 := utils.RandomString(4)
	part2 := utils.RandomString(4)
	part3 := utils.RandomString(4)
	part4 := utils.RandomString(4)
	
	key := fmt.Sprintf("%s-%s-%s-%s", part1, part2, part3, part4)
	return key, nil
}
