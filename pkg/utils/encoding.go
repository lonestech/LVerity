package utils

import (
	"encoding/base64"
)

// EncodeBase64 将字符串编码为base64格式
func EncodeBase64(str string) string {
	return base64.StdEncoding.EncodeToString([]byte(str))
}

// DecodeBase64 将base64字符串解码
func DecodeBase64(str string) (string, error) {
	decoded, err := base64.StdEncoding.DecodeString(str)
	if err != nil {
		return "", err
	}
	return string(decoded), nil
}
