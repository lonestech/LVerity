-- 创建设备状态历史表
CREATE TABLE IF NOT EXISTS device_status_history (
    id VARCHAR(36) PRIMARY KEY,
    device_id VARCHAR(191) NOT NULL,
    old_status VARCHAR(20),
    new_status VARCHAR(20) NOT NULL,
    reason TEXT,
    metadata TEXT,
    create_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(191),
    INDEX idx_device_status_history_device_id (device_id),
    INDEX idx_device_status_history_old_status (old_status),
    INDEX idx_device_status_history_new_status (new_status),
    INDEX idx_device_status_history_create_time (create_time),
    FOREIGN KEY (device_id) REFERENCES devices(id)
);

-- 创建设备活动日志表
CREATE TABLE IF NOT EXISTS device_activities (
    id VARCHAR(36) PRIMARY KEY,
    device_id VARCHAR(191) NOT NULL,
    type VARCHAR(50) NOT NULL,
    description TEXT,
    metadata TEXT,
    ip_address VARCHAR(45),
    location VARCHAR(255),
    create_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_device_activities_device_id (device_id),
    INDEX idx_device_activities_type (type),
    INDEX idx_device_activities_create_time (create_time),
    INDEX idx_device_activities_ip_address (ip_address),
    FOREIGN KEY (device_id) REFERENCES devices(id)
);

-- 创建设备维护记录表
CREATE TABLE IF NOT EXISTS device_maintenance (
    id VARCHAR(36) PRIMARY KEY,
    device_id VARCHAR(191) NOT NULL,
    type VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL,
    description TEXT,
    scheduled_at TIMESTAMP NOT NULL,
    completed_at TIMESTAMP NULL,
    metadata TEXT,
    notes TEXT,
    create_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(191),
    update_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by VARCHAR(191),
    INDEX idx_device_maintenance_device_id (device_id),
    INDEX idx_device_maintenance_type (type),
    INDEX idx_device_maintenance_status (status),
    INDEX idx_device_maintenance_scheduled_at (scheduled_at),
    INDEX idx_device_maintenance_completed_at (completed_at),
    FOREIGN KEY (device_id) REFERENCES devices(id)
);

-- 创建设备配置历史表
CREATE TABLE IF NOT EXISTS device_config_history (
    id VARCHAR(36) PRIMARY KEY,
    device_id VARCHAR(191) NOT NULL,
    config_type VARCHAR(50) NOT NULL,
    old_value TEXT,
    new_value TEXT NOT NULL,
    reason TEXT,
    metadata TEXT,
    create_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(191),
    INDEX idx_device_config_history_device_id (device_id),
    INDEX idx_device_config_history_config_type (config_type),
    INDEX idx_device_config_history_create_time (create_time),
    FOREIGN KEY (device_id) REFERENCES devices(id)
);
