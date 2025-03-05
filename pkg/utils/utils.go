package utils

import (
	"math"
	"math/rand"
	"time"
	"github.com/google/uuid"
)

// CalculateDistance 计算两点之间的距离（公里）
func CalculateDistance(lat1, lon1, lat2, lon2 float64) float64 {
	const R = 6371 // 地球半径（公里）

	dlat := (lat2 - lat1) * math.Pi / 180
	dlon := (lon2 - lon1) * math.Pi / 180
	a := math.Sin(dlat/2)*math.Sin(dlat/2) +
		math.Cos(lat1*math.Pi/180)*math.Cos(lat2*math.Pi/180)*
			math.Sin(dlon/2)*math.Sin(dlon/2)
	c := 2 * math.Atan2(math.Sqrt(a), math.Sqrt(1-a))
	return R * c
}

// GenerateUUID 生成唯一识别符
func GenerateUUID() string {
	return uuid.New().String()
}

// RandomString 生成指定长度的随机字符串
func RandomString(length int) string {
	const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	rand.Seed(time.Now().UnixNano())
	
	result := make([]byte, length)
	for i := 0; i < length; i++ {
		result[i] = charset[rand.Intn(len(charset))]
	}
	return string(result)
}
