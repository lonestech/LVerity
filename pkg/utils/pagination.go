package utils

import (
	"strconv"
)

// GetPagination 获取分页参数
func GetPagination(page string, pageSize string) (int, int) {
	pageNum, err := strconv.Atoi(page)
	if err != nil || pageNum < 1 {
		pageNum = 1
	}

	limit, err := strconv.Atoi(pageSize)
	if err != nil || limit < 1 {
		limit = 10
	}

	offset := (pageNum - 1) * limit
	return offset, limit
}
