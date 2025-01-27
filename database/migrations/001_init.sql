-- 创建设备表
CREATE TABLE IF NOT EXISTS devices (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    disk_id VARCHAR(255) NOT NULL,
    bios VARCHAR(255) NOT NULL,
    motherboard VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'normal',
    risk_level INT DEFAULT 0,
    group_id VARCHAR(36),
    metadata JSON,
    last_seen DATETIME,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    deleted_at DATETIME,
    INDEX idx_devices_status (status),
    INDEX idx_devices_risk_level (risk_level),
    INDEX idx_devices_last_seen (last_seen),
    INDEX idx_devices_deleted_at (deleted_at)
);

-- 创建设备组表
CREATE TABLE IF NOT EXISTS device_groups (
    id VARCHAR(191) PRIMARY KEY,
    name VARCHAR(191) NOT NULL,
    description TEXT,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    created_by VARCHAR(191)
);

-- 创建黑名单规则表
CREATE TABLE IF NOT EXISTS blacklist_rules (
    id VARCHAR(191) PRIMARY KEY,
    type VARCHAR(50) NOT NULL,
    pattern VARCHAR(191) NOT NULL,
    description TEXT,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    created_by VARCHAR(191),
    INDEX idx_blacklist_rules_type (type)
);

-- 创建异常行为记录表
CREATE TABLE IF NOT EXISTS abnormal_behaviors (
    id VARCHAR(191) PRIMARY KEY,
    device_id VARCHAR(191) NOT NULL,
    type VARCHAR(50) NOT NULL,
    description TEXT,
    level VARCHAR(20) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    data TEXT,
    INDEX idx_abnormal_behaviors_device_id (device_id),
    INDEX idx_abnormal_behaviors_type (type),
    FOREIGN KEY (device_id) REFERENCES devices(id)
);

-- 添加设备组外键约束
ALTER TABLE devices
ADD CONSTRAINT fk_devices_group
FOREIGN KEY (group_id) REFERENCES device_groups(id);
