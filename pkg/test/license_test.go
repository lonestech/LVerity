package test

import (
	"LVerity/pkg/database"
	"LVerity/pkg/model"
	"LVerity/pkg/service"
	"LVerity/pkg/utils"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
)

func TestLicenseGeneration(t *testing.T) {
	cleanup := setupTest(t)
	defer cleanup()

	utils.InitEncryptionKey("test-key")

	// 测试生成授权码
	license, err := service.CreateLicense(model.LicenseTypeStandard, 30, 1)
	assert.NoError(t, err)
	assert.NotNil(t, license)
	assert.Equal(t, model.LicenseTypeStandard, license.Type)
	assert.Equal(t, 1, license.MaxDevices)
	assert.Equal(t, 0, license.UsedDevices)

	// 验证授权码过期时间
	expectedExpireTime := time.Now().Add(30 * 24 * time.Hour)
	assert.True(t, license.ExpireTime.After(expectedExpireTime.Add(-time.Minute)))
	assert.True(t, license.ExpireTime.Before(expectedExpireTime.Add(time.Minute)))
}

func TestLicenseActivation(t *testing.T) {
	cleanup := setupTest(t)
	defer cleanup()

	utils.InitEncryptionKey("test-key")

	// 生成授权码
	license, err := service.CreateLicense(model.LicenseTypeStandard, 30, 1)
	assert.NoError(t, err)

	// 准备设备信息
	deviceInfo := &model.DeviceInfo{
		OS:   "windows",
		Arch: "amd64",
		CPU:  "intel",
		MAC:  "00:11:22:33:44:55",
	}

	// 注册设备
	device, err := service.RegisterDevice(deviceInfo, "Test Device")
	assert.NoError(t, err)

	// 测试激活授权码
	err = service.ActivateLicense(license.Code, device.ID)
	assert.NoError(t, err)

	// 验证授权码状态
	activatedLicense, err := service.GetLicense(license.Code)
	assert.NoError(t, err)
	assert.Equal(t, model.LicenseStatusActive, activatedLicense.Status)

	// 获取设备列表
	devices, err := service.GetLicenseDevices(license.Code)
	assert.NoError(t, err)
	assert.Equal(t, 1, len(devices))
	assert.Equal(t, device.ID, devices[0].ID)
}

func TestLicenseVerification(t *testing.T) {
	cleanup := setupTest(t)
	defer cleanup()

	utils.InitEncryptionKey("test-key")

	// 生成授权码
	license, err := service.CreateLicense(model.LicenseTypeStandard, 30, 1)
	assert.NoError(t, err)

	// 准备设备信息
	deviceInfo := &model.DeviceInfo{
		OS:   "windows",
		Arch: "amd64",
		CPU:  "intel",
		MAC:  "00:11:22:33:44:55",
	}

	// 注册设备
	device, err := service.RegisterDevice(deviceInfo, "Test Device")
	assert.NoError(t, err)

	// 激活授权码
	err = service.ActivateLicense(license.Code, device.ID)
	assert.NoError(t, err)

	// 测试验证授权码
	isValid, err := service.CheckLicenseExpiration(license.Code)
	assert.NoError(t, err)
	assert.True(t, isValid)

	// 测试验证过期授权码
	expiredLicense, err := service.CreateLicense(model.LicenseTypeStandard, -1, 1)
	assert.NoError(t, err)
	isValid, err = service.CheckLicenseExpiration(expiredLicense.Code)
	assert.NoError(t, err)
	assert.False(t, isValid)
}

func TestLicenseDisabling(t *testing.T) {
	cleanup := setupTest(t)
	defer cleanup()

	utils.InitEncryptionKey("test-key")

	// 生成授权码
	license, err := service.CreateLicense(model.LicenseTypeStandard, 30, 1)
	assert.NoError(t, err)

	// 准备设备信息
	deviceInfo := &model.DeviceInfo{
		OS:   "windows",
		Arch: "amd64",
		CPU:  "intel",
		MAC:  "00:11:22:33:44:55",
	}

	// 注册设备
	device, err := service.RegisterDevice(deviceInfo, "Test Device")
	assert.NoError(t, err)

	// 激活授权码
	err = service.ActivateLicense(license.Code, device.ID)
	assert.NoError(t, err)

	// 测试禁用授权码
	err = service.DisableLicense(license.Code)
	assert.NoError(t, err)

	// 验证授权码状态
	disabledLicense, err := service.GetLicense(license.Code)
	assert.NoError(t, err)
	assert.Equal(t, model.LicenseStatusDisabled, disabledLicense.Status)

	// 测试验证已禁用的授权码
	isValid, err := service.CheckLicenseExpiration(license.Code)
	assert.NoError(t, err)
	assert.False(t, isValid)

	// 测试重新激活已禁用的授权码
	err = service.ActivateLicense(license.Code, device.ID)
	assert.Error(t, err)
	assert.Contains(t, err.Error(), "license is disabled")
}

func TestLicenseExpiration(t *testing.T) {
	cleanup := setupTest(t)
	defer cleanup()

	utils.InitEncryptionKey("test-key")

	// 生成一个已过期的授权码
	license, err := service.CreateLicense(model.LicenseTypeStandard, -1, 1)
	assert.NoError(t, err)

	// 准备设备信息
	deviceInfo := &model.DeviceInfo{
		OS:   "windows",
		Arch: "amd64",
		CPU:  "intel",
		MAC:  "00:11:22:33:44:55",
	}

	// 注册设备
	device, err := service.RegisterDevice(deviceInfo, "Test Device")
	assert.NoError(t, err)

	// 尝试激活已过期的授权码
	err = service.ActivateLicense(license.Code, device.ID)
	assert.Error(t, err)
	assert.Contains(t, err.Error(), "license has expired")

	// 验证过期状态
	isValid, err := service.CheckLicenseExpiration(license.Code)
	assert.NoError(t, err)
	assert.False(t, isValid)
}

func TestLicenseDeviceLimit(t *testing.T) {
	cleanup := setupTest(t)
	defer cleanup()

	utils.InitEncryptionKey("test-key")

	// 生成只允许一个设备的授权码
	license, err := service.CreateLicense(model.LicenseTypeStandard, 30, 1)
	assert.NoError(t, err)

	// 第一个设备信息
	device1Info := &model.DeviceInfo{
		OS:   "windows",
		Arch: "amd64",
		CPU:  "intel",
		MAC:  "00:11:22:33:44:55",
	}

	// 第二个设备信息
	device2Info := &model.DeviceInfo{
		OS:   "windows",
		Arch: "amd64",
		CPU:  "intel",
		MAC:  "55:44:33:22:11:00",
	}

	// 注册第一个设备
	device1, err := service.RegisterDevice(device1Info, "Test Device 1")
	assert.NoError(t, err)

	// 注册第二个设备
	device2, err := service.RegisterDevice(device2Info, "Test Device 2")
	assert.NoError(t, err)

	// 激活第一个设备
	err = service.ActivateLicense(license.Code, device1.ID)
	assert.NoError(t, err)

	// 尝试激活第二个设备
	err = service.ActivateLicense(license.Code, device2.ID)
	assert.Error(t, err)
	assert.Contains(t, err.Error(), "license has reached maximum number of devices")
}

func TestLicenseReactivation(t *testing.T) {
	cleanup := setupTest(t)
	defer cleanup()

	utils.InitEncryptionKey("test-key")

	// 生成授权码
	license, err := service.CreateLicense(model.LicenseTypeStandard, 30, 1)
	assert.NoError(t, err)

	// 设备信息
	deviceInfo := &model.DeviceInfo{
		OS:   "windows",
		Arch: "amd64",
		CPU:  "intel",
		MAC:  "00:11:22:33:44:55",
	}

	// 注册设备
	device, err := service.RegisterDevice(deviceInfo, "Test Device")
	assert.NoError(t, err)

	// 首次激活
	err = service.ActivateLicense(license.Code, device.ID)
	assert.NoError(t, err)

	// 禁用授权码
	err = service.DisableLicense(license.Code)
	assert.NoError(t, err)

	// 尝试重新激活
	err = service.ActivateLicense(license.Code, device.ID)
	assert.Error(t, err)
	assert.Contains(t, err.Error(), "license is disabled")
}

func TestBatchCreateLicense(t *testing.T) {
	cleanup := setupTest(t)
	defer cleanup()

	utils.InitEncryptionKey("test-key")

	t.Run("BatchCreateStandardLicenses", func(t *testing.T) {
		// 批量创建标准授权码
		count := 5
		licenses, err := service.BatchCreateLicense(model.LicenseTypeStandard, 30, 1, count)
		assert.NoError(t, err)
		assert.Equal(t, count, len(licenses))

		// 验证创建的授权码
		for _, license := range licenses {
			assert.Equal(t, model.LicenseStatusActive, license.Status)
			assert.Equal(t, model.LicenseTypeStandard, license.Type)
			assert.Equal(t, 1, license.MaxDevices)
		}
	})
}

func TestBatchDisableLicense(t *testing.T) {
	cleanup := setupTest(t)
	defer cleanup()

	utils.InitEncryptionKey("test-key")

	// 批量创建授权码
	count := 5
	licenses, err := service.BatchCreateLicense(model.LicenseTypeStandard, 30, 1, count)
	assert.NoError(t, err)

	// 收集授权码
	var codes []string
	for _, license := range licenses {
		codes = append(codes, license.Code)
	}

	// 批量禁用授权码
	err = service.BatchDisableLicense(codes)
	assert.NoError(t, err)

	// 验证授权码状态
	for _, code := range codes {
		license, err := service.GetLicense(code)
		assert.NoError(t, err)
		assert.Equal(t, model.LicenseStatusDisabled, license.Status)
	}
}

func TestExportImportLicenses(t *testing.T) {
	cleanup := setupTest(t)
	defer cleanup()

	utils.InitEncryptionKey("test-key")

	// 创建测试授权码
	count := 5
	licenses, err := service.BatchCreateLicense(model.LicenseTypeStandard, 30, 1, count)
	assert.NoError(t, err)

	// 导出授权码
	exportData, err := service.ExportLicenses(licenses)
	assert.NoError(t, err)
	assert.NotEmpty(t, exportData)

	// 清理数据库中的授权码
	err = database.DB.Exec("DELETE FROM licenses").Error
	assert.NoError(t, err)

	// 导入授权码
	importedLicenses, err := service.ImportLicenses(exportData)
	assert.NoError(t, err)
	assert.Equal(t, len(licenses), len(importedLicenses))

	// 验证导入的授权码
	for i, license := range licenses {
		assert.Equal(t, license.Code, importedLicenses[i].Code)
		assert.Equal(t, license.Type, importedLicenses[i].Type)
		assert.Equal(t, license.MaxDevices, importedLicenses[i].MaxDevices)
	}
}

func TestBatchGetLicenseInfo(t *testing.T) {
	cleanup := setupTest(t)
	defer cleanup()

	utils.InitEncryptionKey("test-key")

	// 创建测试授权码
	count := 5
	licenses, err := service.BatchCreateLicense(model.LicenseTypeStandard, 30, 1, count)
	assert.NoError(t, err)

	// 收集授权码
	var codes []string
	codeToLicense := make(map[string]*model.License)
	for _, license := range licenses {
		codes = append(codes, license.Code)
		codeToLicense[license.Code] = license
	}

	// 批量获取授权码信息
	licenseInfos, err := service.BatchGetLicenseInfo(codes)
	assert.NoError(t, err)
	assert.Equal(t, len(codes), len(licenseInfos))

	// 验证授权码信息
	for _, info := range licenseInfos {
		expectedLicense := codeToLicense[info.Code]
		assert.Equal(t, expectedLicense.Code, info.Code)
		assert.Equal(t, model.LicenseTypeStandard, info.Type)
		assert.Equal(t, 1, info.MaxDevices)
	}
}
