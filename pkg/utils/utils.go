package utils

import (
	"math"
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
