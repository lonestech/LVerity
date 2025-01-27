package utils

import (
	"encoding/json"
	"html"
	"regexp"
	"strings"
	"unicode"
)

var (
	sqlInjectionPattern = regexp.MustCompile(`(?i)(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|WHERE|FROM|INTO|CREATE|ALTER|TRUNCATE)`)
	xssPattern         = regexp.MustCompile(`(?i)(<script|javascript:|on\w+\s*=)`)
)

// ValidateInput 验证输入是否安全
func ValidateInput(input string) (bool, string) {
	// 检查SQL注入
	if sqlInjectionPattern.MatchString(input) {
		return false, "检测到潜在的SQL注入攻击"
	}

	// 检查XSS攻击
	if xssPattern.MatchString(input) {
		return false, "检测到潜在的XSS攻击"
	}

	return true, ""
}

// SanitizeOutput 清理输出内容
func SanitizeOutput(input string) string {
	// HTML转义
	escaped := html.EscapeString(input)
	// 移除潜在的危险字符
	escaped = strings.Map(func(r rune) rune {
		if unicode.IsPrint(r) {
			return r
		}
		return -1
	}, escaped)
	return escaped
}

// ValidateJSON 验证JSON数据
func ValidateJSON(data []byte, maxDepth int) (bool, error) {
	var j interface{}
	decoder := json.NewDecoder(strings.NewReader(string(data)))
	decoder.UseNumber()

	err := decoder.Decode(&j)
	if err != nil {
		return false, err
	}

	// 检查JSON深度
	if depth := checkJSONDepth(j); depth > maxDepth {
		return false, nil
	}

	return true, nil
}

// checkJSONDepth 检查JSON深度
func checkJSONDepth(v interface{}) int {
	switch v := v.(type) {
	case map[string]interface{}:
		maxDepth := 1
		for _, value := range v {
			if depth := checkJSONDepth(value); depth+1 > maxDepth {
				maxDepth = depth + 1
			}
		}
		return maxDepth
	case []interface{}:
		maxDepth := 1
		for _, value := range v {
			if depth := checkJSONDepth(value); depth+1 > maxDepth {
				maxDepth = depth + 1
			}
		}
		return maxDepth
	default:
		return 1
	}
}
