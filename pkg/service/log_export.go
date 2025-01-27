package service

import (
	"LVerity/pkg/model"
	"LVerity/pkg/store"
	"encoding/csv"
	"encoding/json"
	"fmt"
	"io"
	"time"
)

// ExportDeviceLogs 导出设备日志
func ExportDeviceLogs(writer io.Writer, opts model.LogExportOptions) error {
	query := store.GetDB().Model(&model.DeviceLog{}).
		Where("timestamp BETWEEN ? AND ?", opts.StartTime, opts.EndTime)

	if opts.DeviceID != "" {
		query = query.Where("device_id = ?", opts.DeviceID)
	}

	var logs []model.DeviceLog
	if err := query.Find(&logs).Error; err != nil {
		return err
	}

	switch opts.Format {
	case model.ExportFormatCSV:
		return exportLogsToCSV(writer, logs)
	case model.ExportFormatJSON:
		return json.NewEncoder(writer).Encode(logs)
	default:
		return fmt.Errorf("unsupported format: %s", opts.Format)
	}
}

// exportLogsToCSV 导出日志为CSV格式
func exportLogsToCSV(writer io.Writer, logs []model.DeviceLog) error {
	csvWriter := csv.NewWriter(writer)
	defer csvWriter.Flush()

	// 写入表头
	headers := []string{
		"ID", "DeviceID", "Type", "Level", "Message",
		"Source", "Timestamp", "AdditionalInfo",
	}
	if err := csvWriter.Write(headers); err != nil {
		return err
	}

	// 写入数据
	for _, log := range logs {
		record := []string{
			log.ID,
			log.DeviceID,
			log.Type,
			string(log.Level),
			log.Message,
			log.Source,
			log.Timestamp.Format(time.RFC3339),
			log.AdditionalInfo,
		}
		if err := csvWriter.Write(record); err != nil {
			return err
		}
	}

	return nil
}

// ExportDeviceLocationLogs 导出设备位置日志
func ExportDeviceLocationLogs(writer io.Writer, opts model.LogExportOptions) error {
	query := store.GetDB().Model(&model.DeviceLocationLog{}).
		Where("timestamp BETWEEN ? AND ?", opts.StartTime, opts.EndTime)

	if opts.DeviceID != "" {
		query = query.Where("device_id = ?", opts.DeviceID)
	}

	var logs []model.DeviceLocationLog
	if err := query.Find(&logs).Error; err != nil {
		return err
	}

	switch opts.Format {
	case model.ExportFormatCSV:
		return exportLocationLogsToCSV(writer, logs)
	case model.ExportFormatJSON:
		return json.NewEncoder(writer).Encode(logs)
	default:
		return fmt.Errorf("unsupported format: %s", opts.Format)
	}
}

// exportLocationLogsToCSV 导出位置日志为CSV格式
func exportLocationLogsToCSV(writer io.Writer, logs []model.DeviceLocationLog) error {
	csvWriter := csv.NewWriter(writer)
	defer csvWriter.Flush()

	// 写入表头
	headers := []string{
		"ID", "DeviceID", "Latitude", "Longitude",
		"Country", "City", "Timestamp",
	}
	if err := csvWriter.Write(headers); err != nil {
		return err
	}

	// 写入数据
	for _, log := range logs {
		record := []string{
			log.ID,
			log.DeviceID,
			fmt.Sprintf("%f", log.Location.Latitude),
			fmt.Sprintf("%f", log.Location.Longitude),
			log.Location.Country,
			log.Location.City,
			log.Timestamp.Format(time.RFC3339),
		}
		if err := csvWriter.Write(record); err != nil {
			return err
		}
	}

	return nil
}

// ExportAlerts 导出告警记录
func ExportAlerts(writer io.Writer, opts model.LogExportOptions) error {
	query := store.GetDB().Model(&model.Alert{}).
		Where("created_at BETWEEN ? AND ?", opts.StartTime, opts.EndTime)

	if opts.DeviceID != "" {
		query = query.Where("device_id = ?", opts.DeviceID)
	}

	var alerts []model.Alert
	if err := query.Find(&alerts).Error; err != nil {
		return err
	}

	switch opts.Format {
	case model.ExportFormatCSV:
		return exportAlertsToCSV(writer, alerts)
	case model.ExportFormatJSON:
		return json.NewEncoder(writer).Encode(alerts)
	default:
		return fmt.Errorf("unsupported format: %s", opts.Format)
	}
}

// exportAlertsToCSV 导出告警记录为CSV格式
func exportAlertsToCSV(writer io.Writer, alerts []model.Alert) error {
	csvWriter := csv.NewWriter(writer)
	defer csvWriter.Flush()

	// 写入表头
	headers := []string{
		"ID",
		"Title",
		"Level",
		"DeviceID",
		"Description",
		"Status",
		"CreatedAt",
		"UpdatedAt",
		"Metadata",
	}
	if err := csvWriter.Write(headers); err != nil {
		return err
	}

	// 写入数据
	for _, alert := range alerts {
		record := []string{
			alert.ID,
			alert.Title,
			string(alert.Level),
			alert.DeviceID,
			alert.Description,
			string(alert.Status),
			alert.CreatedAt.Format(time.RFC3339),
			alert.UpdatedAt.Format(time.RFC3339),
			alert.Metadata,
		}
		if err := csvWriter.Write(record); err != nil {
			return err
		}
	}

	return nil
}
