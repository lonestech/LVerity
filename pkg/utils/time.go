package utils

import "time"

// IsSameDay 判断两个时间是否在同一天
func IsSameDay(t1, t2 time.Time) bool {
	y1, m1, d1 := t1.Date()
	y2, m2, d2 := t2.Date()
	return y1 == y2 && m1 == m2 && d1 == d2
}

// IsSameMonth 判断两个时间是否在同一月
func IsSameMonth(t1, t2 time.Time) bool {
	y1, m1, _ := t1.Date()
	y2, m2, _ := t2.Date()
	return y1 == y2 && m1 == m2
}

// StartOfDay 获取一天的开始时间
func StartOfDay(t time.Time) time.Time {
	year, month, day := t.Date()
	return time.Date(year, month, day, 0, 0, 0, 0, t.Location())
}

// EndOfDay 获取一天的结束时间
func EndOfDay(t time.Time) time.Time {
	year, month, day := t.Date()
	return time.Date(year, month, day, 23, 59, 59, 999999999, t.Location())
}

// StartOfMonth 获取一个月的开始时间
func StartOfMonth(t time.Time) time.Time {
	year, month, _ := t.Date()
	return time.Date(year, month, 1, 0, 0, 0, 0, t.Location())
}

// EndOfMonth 获取一个月的结束时间
func EndOfMonth(t time.Time) time.Time {
	year, month, _ := t.Date()
	return time.Date(year, month+1, 0, 23, 59, 59, 999999999, t.Location())
}
