package utils

import (
	"encoding/base64"
)

// Base64Encode 将字节数组编码为base64字符串
func Base64Encode(data []byte) string {
	return base64.URLEncoding.EncodeToString(data)
}

// Base64Decode 将base64字符串解码为字节数组
func Base64Decode(encodedData string) ([]byte, error) {
	return base64.URLEncoding.DecodeString(encodedData)
}
