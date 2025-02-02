package service

import (
	"LVerity/pkg/common"
	"LVerity/pkg/database"
	"LVerity/pkg/model"
	"encoding/base32"
	"errors"
	"time"

	"github.com/pquerna/otp/totp"
)

var (
	ErrInvalidTOTPCode = errors.New("无效的验证码")
)

// SecurityLog 安全日志
type SecurityLog struct {
	ID        string    `json:"id"`
	UserID    string    `json:"user_id"`
	Action    string    `json:"action"`
	IPAddress string    `json:"ip_address"`
	UserAgent string    `json:"user_agent"`
	CreatedAt time.Time `json:"created_at"`
}

// Enable2FA 开启两步验证
func Enable2FA(userID string) (string, error) {
	user, err := GetUserByID(userID)
	if err != nil {
		return "", err
	}

	// 生成随机字节作为 TOTP Secret
	secretBytes := []byte(common.GenerateUUID())
	secret := base32.StdEncoding.EncodeToString(secretBytes)

	// 生成 TOTP 配置
	key, err := totp.Generate(totp.GenerateOpts{
		Issuer:      "LVerity",
		AccountName: user.Username,
		Secret:      secretBytes,
	})
	if err != nil {
		return "", err
	}

	// 保存 Secret 到数据库
	user.MFASecret = secret
	user.MFAEnabled = false // 等待验证后再启用
	if err := UpdateUser(user); err != nil {
		return "", err
	}

	return key.URL(), nil
}

// Verify2FA 验证两步验证
func Verify2FA(userID, code string) error {
	user, err := GetUserByID(userID)
	if err != nil {
		return err
	}

	// 验证 TOTP 码
	valid := totp.Validate(code, user.MFASecret)
	if !valid {
		return ErrInvalidTOTPCode
	}

	// 验证成功后启用 2FA
	user.MFAEnabled = true
	return UpdateUser(user)
}

// Disable2FA 关闭两步验证
func Disable2FA(userID string) error {
	user, err := GetUserByID(userID)
	if err != nil {
		return err
	}

	user.MFASecret = ""
	user.MFAEnabled = false
	return UpdateUser(user)
}

// LogSecurityEvent 记录安全事件
func LogSecurityEvent(userID, action, ipAddress, userAgent string) error {
	log := &model.SecurityLog{
		ID:        common.GenerateUUID(),
		UserID:    userID,
		Action:    action,
		IPAddress: ipAddress,
		UserAgent: userAgent,
		CreatedAt: time.Now(),
	}

	return database.GetDB().Create(log).Error
}

// GetSecurityLogs 获取安全日志
func GetSecurityLogs(userID string, page, pageSize int) ([]model.SecurityLog, int64, error) {
	var logs []model.SecurityLog
	var total int64

	db := database.GetDB().Model(&model.SecurityLog{}).Where("user_id = ?", userID)

	// 获取总数
	if err := db.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// 获取分页数据
	offset := (page - 1) * pageSize
	if err := db.Order("created_at DESC").Offset(offset).Limit(pageSize).Find(&logs).Error; err != nil {
		return nil, 0, err
	}

	return logs, total, nil
}
