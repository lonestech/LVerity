package test

import (
	"testing"
	"time"
	"LVerity/pkg/model"
	"LVerity/pkg/service"
	"LVerity/pkg/utils"
	"encoding/json"
	"github.com/stretchr/testify/assert"
)

func TestDeviceRegistration(t *testing.T) {
	cleanup := setupTest(t)
	defer cleanup()

	deviceInfo := &model.DeviceInfo{
		OS:   "windows",
		Arch: "amd64",
		CPU:  "intel",
		MAC:  "00:11:22:33:44:55",
	}

	device, err := service.RegisterDevice(deviceInfo, "Test Device")
	assert.NoError(t, err)
	assert.NotNil(t, device)
	assert.Equal(t, "Test Device", device.Name)
}

func TestDeviceBinding(t *testing.T) {
	cleanup := setupTest(t)
	defer cleanup()

	utils.InitEncryptionKey("test-key")

	// 注册设备
	deviceInfo := &model.DeviceInfo{
		OS:   "windows",
		Arch: "amd64",
		CPU:  "intel",
		MAC:  "00:11:22:33:44:55",
	}

	device, err := service.RegisterDevice(deviceInfo, "Test Device")
	assert.NoError(t, err)

	// 生成授权码
	license, err := service.CreateLicense(model.LicenseTypeStandard, 30, 1)
	assert.NoError(t, err)

	// 绑定设备
	err = service.ActivateLicense(license.Code, device.ID)
	assert.NoError(t, err)

	// 验证绑定状态
	boundDevice, err := service.GetDevice(device.ID)
	assert.NoError(t, err)
	assert.Equal(t, license.ID, boundDevice.LicenseID)
}

func TestDeviceHeartbeat(t *testing.T) {
	cleanup := setupTest(t)
	defer cleanup()

	utils.InitEncryptionKey("test-key")

	// 注册设备
	deviceInfo := &model.DeviceInfo{
		OS:   "windows",
		Arch: "amd64",
		CPU:  "intel",
		MAC:  "00:11:22:33:44:55",
	}

	device, err := service.RegisterDevice(deviceInfo, "Test Device")
	assert.NoError(t, err)

	// 记录当前时间
	beforeTime := time.Now()

	// 发送心跳
	monitor := service.GetDeviceMonitor()
	err = monitor.UpdateDeviceHeartbeat(device.ID, "127.0.0.1", nil)
	assert.NoError(t, err)

	// 验证心跳时间
	updatedDevice, err := service.GetDevice(device.ID)
	assert.NoError(t, err)
	assert.True(t, updatedDevice.LastSeen.After(beforeTime))
}

func TestDeviceMetadata(t *testing.T) {
	cleanup := setupTest(t)
	defer cleanup()

	utils.InitEncryptionKey("test-key")

	// 注册设备
	deviceInfo := &model.DeviceInfo{
		OS:   "windows",
		Arch: "amd64",
		CPU:  "intel",
		MAC:  "00:11:22:33:44:55",
	}

	device, err := service.RegisterDevice(deviceInfo, "Test Device")
	assert.NoError(t, err)

	// 更新元数据
	metadata := map[string]interface{}{
		"version": "1.0.0",
		"config": map[string]interface{}{
			"debug": true,
			"port":  8080,
		},
	}

	metadataJSON, err := json.Marshal(metadata)
	assert.NoError(t, err)

	err = service.UpdateDeviceMetadata(device.ID, string(metadataJSON))
	assert.NoError(t, err)

	// 验证元数据
	updatedDevice, err := service.GetDevice(device.ID)
	assert.NoError(t, err)
	assert.Equal(t, metadata["version"], updatedDevice.Metadata["version"])
	assert.Equal(t, metadata["config"].(map[string]interface{})["debug"], updatedDevice.Metadata["config"].(map[string]interface{})["debug"])
	assert.Equal(t, metadata["config"].(map[string]interface{})["port"], updatedDevice.Metadata["config"].(map[string]interface{})["port"])
}

func TestDeviceStatus(t *testing.T) {
	cleanup := setupTest(t)
	defer cleanup()

	utils.InitEncryptionKey("test-key")

	// 注册设备
	deviceInfo := &model.DeviceInfo{
		OS:   "windows",
		Arch: "amd64",
		CPU:  "intel",
		MAC:  "00:11:22:33:44:55",
	}

	device, err := service.RegisterDevice(deviceInfo, "Test Device")
	assert.NoError(t, err)

	// 测试禁用设备
	err = service.BlockDevice(device.ID)
	assert.NoError(t, err)

	blockedDevice, err := service.GetDevice(device.ID)
	assert.NoError(t, err)
	assert.Equal(t, model.DeviceStatusBlocked, blockedDevice.Status)

	// 测试解除禁用
	err = service.UnblockDevice(device.ID)
	assert.NoError(t, err)

	unblockedDevice, err := service.GetDevice(device.ID)
	assert.NoError(t, err)
	assert.Equal(t, model.DeviceStatusNormal, unblockedDevice.Status)
}
