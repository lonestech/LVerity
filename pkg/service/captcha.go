package service

import (
	"bytes"
	"encoding/base64"
	"github.com/dchest/captcha"
	"image/png"
)

const (
	captchaWidth  = 240
	captchaHeight = 80
	captchaLength = 6
)

// GenerateCaptcha 生成验证码
func GenerateCaptcha() (string, string, error) {
	// 生成验证码ID
	id := captcha.NewLen(captchaLength)

	// 生成图片
	var buf bytes.Buffer
	img := captcha.NewImage(id, captcha.RandomDigits(captchaLength), captchaWidth, captchaHeight)
	if err := png.Encode(&buf, img); err != nil {
		return "", "", err
	}

	// 转换为base64
	b64s := base64.StdEncoding.EncodeToString(buf.Bytes())
	return id, "data:image/png;base64," + b64s, nil
}

// VerifyCaptcha 验证验证码
func VerifyCaptcha(id string, answer string) bool {
	return captcha.VerifyString(id, answer)
}
