// service/systeminfo.go
package service

import (
	"LVerity/pkg/common"
	"LVerity/pkg/database"
	"LVerity/pkg/model"
	"errors"
	"fmt"
	"runtime"
	"time"

	"github.com/shirou/gopsutil/v3/cpu"
	"github.com/shirou/gopsutil/v3/disk"
	"github.com/shirou/gopsutil/v3/host"
	"github.com/shirou/gopsutil/v3/mem"
)

var (
	// 系统信息相关错误
	ErrSystemInfoNotFound = errors.New("系统信息不存在")
)

// GetSystemInfo 获取系统信息
func GetSystemInfo() (*model.SystemInfo, error) {
	var systemInfo model.SystemInfo
	if err := database.GetDB().First(&systemInfo).Error; err != nil {
		return nil, ErrSystemInfoNotFound
	}
	return &systemInfo, nil
}

// UpdateSystemInfo 更新系统信息
func UpdateSystemInfo() (*model.SystemInfo, error) {
	// 获取主机信息
	hostInfo, err := host.Info()
	if err != nil {
		return nil, err
	}

	// 获取CPU使用率
	cpuPercent, err := cpu.Percent(time.Second, false)
	if err != nil {
		return nil, err
	}
	cpuUsage := 0.0
	if len(cpuPercent) > 0 {
		cpuUsage = cpuPercent[0]
	}

	// 获取内存使用率
	memInfo, err := mem.VirtualMemory()
	if err != nil {
		return nil, err
	}

	// 获取磁盘使用率
	parts, err := disk.Partitions(false)
	if err != nil {
		return nil, err
	}
	diskUsage := 0.0
	if len(parts) > 0 {
		diskInfo, err := disk.Usage(parts[0].Mountpoint)
		if err == nil {
			diskUsage = diskInfo.UsedPercent
		}
	}

	// 查询是否已存在系统信息记录
	var systemInfo model.SystemInfo
	result := database.GetDB().First(&systemInfo)
	
	// 如果不存在，创建新记录
	if result.Error != nil {
		systemInfo = model.SystemInfo{
			ID:        "sys-" + common.GenerateUUID(),
			CreatedAt: time.Now(),
		}
	}

	// 更新系统信息
	systemInfo.Version = "1.0.0" // 这里应该从配置或环境变量中获取
	systemInfo.BuildNumber = "build-001"
	systemInfo.LastUpdate = time.Now()
	systemInfo.ServerIP = hostInfo.HostID
	systemInfo.ServerName = hostInfo.Hostname
	systemInfo.OSInfo = hostInfo.Platform + " " + hostInfo.PlatformVersion + " " + runtime.GOARCH
	systemInfo.CPUUsage = cpuUsage
	systemInfo.MemoryUsage = memInfo.UsedPercent
	systemInfo.DiskUsage = diskUsage
	systemInfo.Status = "running"
	systemInfo.UpdatedAt = time.Now()

	// 保存系统信息
	if result.Error != nil {
		if err := database.GetDB().Create(&systemInfo).Error; err != nil {
			return nil, err
		}
	} else {
		if err := database.GetDB().Save(&systemInfo).Error; err != nil {
			return nil, err
		}
	}

	return &systemInfo, nil
}

// GetSystemUptime 获取系统运行时间
func GetSystemUptime() (string, error) {
	hostInfo, err := host.Info()
	if err != nil {
		return "", err
	}
	uptime := time.Duration(hostInfo.Uptime) * time.Second
	return formatDuration(uptime), nil
}

// formatDuration 格式化持续时间为人类可读形式
func formatDuration(d time.Duration) string {
	days := int(d.Hours() / 24)
	hours := int(d.Hours()) % 24
	minutes := int(d.Minutes()) % 60
	
	if days > 0 {
		return fmt.Sprintf("%dd %dh %dm", days, hours, minutes)
	}
	return fmt.Sprintf("%dh %dm", hours, minutes)
}

// GetSystemStatusInfo 获取系统状态详细信息
func GetSystemStatusInfo() (map[string]interface{}, error) {
	// 获取CPU使用率
	cpuUsage, err := getCPUUsage()
	if err != nil {
		cpuUsage = 0.0
	}
	
	// 获取内存使用率
	memoryInfo, err := mem.VirtualMemory()
	var memoryUsage float64
	var memoryUsageText string
	if err == nil {
		memoryUsage = float64(memoryInfo.Used) / float64(memoryInfo.Total) * 100
		memoryUsageText = fmt.Sprintf("%.1f%%", memoryUsage)
	} else {
		memoryUsageText = "未知"
	}
	
	// 获取磁盘使用率
	diskInfo, err := disk.Usage("/")
	var diskUsage float64
	var diskUsageText string
	if err == nil {
		diskUsage = diskInfo.UsedPercent
		diskUsageText = fmt.Sprintf("%.1f%%", diskUsage)
	} else {
		diskUsageText = "未知"
	}
	
	// 获取系统运行时间
	uptime, err := GetSystemUptime()
	if err != nil {
		uptime = "未知"
	}
	
	// 获取主机信息
	hostInfo, _ := host.Info()
	
	// 构建状态信息
	status := map[string]interface{}{
		"status":      "running",
		"uptime":      uptime,
		"cpuUsage":    fmt.Sprintf("%.1f%%", cpuUsage),
		"memoryUsage": memoryUsageText,
		"diskUsage":   diskUsageText,
		"hostname":    hostInfo.Hostname,
		"platform":    hostInfo.Platform,
		"platformVersion": hostInfo.PlatformVersion,
		"kernelVersion":   hostInfo.KernelVersion,
		"connections": 0, // 这里需要另外实现获取连接数
		"lastBackup": "2025-03-04T12:00:00Z", // 这里需要从备份系统获取实际数据
		"updates": map[string]interface{}{
			"available": false,
			"version":   "",
		},
		"services": []map[string]interface{}{
			{"name": "主服务", "status": "running", "uptime": uptime},
			{"name": "数据库", "status": "running", "uptime": uptime},
			{"name": "缓存", "status": "running", "uptime": uptime},
			{"name": "任务队列", "status": "running", "uptime": uptime},
		},
	}
	
	return status, nil
}

func getCPUUsage() (float64, error) {
	cpuPercent, err := cpu.Percent(time.Second, false)
	if err != nil {
		return 0.0, err
	}
	if len(cpuPercent) > 0 {
		return cpuPercent[0], nil
	}
	return 0.0, nil
}
