package service

import (
	"github.com/mojocn/base64Captcha"
)

var store = base64Captcha.DefaultMemStore

// 验证码配置
var captchaConfig = base64Captcha.DriverString{
	Height:          40,
	Width:          130,
	NoiseCount:     0,
	ShowLineOptions: 2 | 4,
	Length:         4,
	Source:         "1234567890",
	BgColor:        &amp;color.RGBA{R: 255, G: 255, B: 255, A: 255},
	Fonts:          []string{"wqy-microhei.ttc"},
}

// GenerateCaptcha 生成验证码
func GenerateCaptcha() (string, string, error) {
	driver := captchaConfig.ConvertFonts()
	c := base64Captcha.NewCaptcha(driver, store)
	id, b64s, err := c.Generate()
	return id, b64s, err
}

// VerifyCaptcha 验证验证码
func VerifyCaptcha(id string, answer string) bool {
	return store.Verify(id, answer, true)
}
