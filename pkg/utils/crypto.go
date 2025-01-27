package utils

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"encoding/hex"
	"errors"
	"io"
	"sort"
	"golang.org/x/crypto/bcrypt"
)

// 用于授权码加密的密钥
var encryptionKey []byte

// InitEncryptionKey 初始化加密密钥
func InitEncryptionKey(key string) {
	// 使用SHA-256确保密钥长度为32字节
	hash := sha256.Sum256([]byte(key))
	encryptionKey = hash[:]
}

// EncryptAES 使用AES-GCM加密数据
func EncryptAES(plaintext []byte) (string, error) {
	if encryptionKey == nil {
		return "", errors.New("encryption key not initialized")
	}

	block, err := aes.NewCipher(encryptionKey)
	if err != nil {
		return "", err
	}

	// 创建GCM模式
	aesGCM, err := cipher.NewGCM(block)
	if err != nil {
		return "", err
	}

	// 创建随机数
	nonce := make([]byte, aesGCM.NonceSize())
	if _, err = io.ReadFull(rand.Reader, nonce); err != nil {
		return "", err
	}

	// 加密数据
	ciphertext := aesGCM.Seal(nonce, nonce, plaintext, nil)
	
	// 返回base64编码的密文
	return base64.StdEncoding.EncodeToString(ciphertext), nil
}

// DecryptAES 使用AES-GCM解密数据
func DecryptAES(encryptedStr string) ([]byte, error) {
	if encryptionKey == nil {
		return nil, errors.New("encryption key not initialized")
	}

	// 解码base64
	ciphertext, err := base64.StdEncoding.DecodeString(encryptedStr)
	if err != nil {
		return nil, err
	}

	block, err := aes.NewCipher(encryptionKey)
	if err != nil {
		return nil, err
	}

	aesGCM, err := cipher.NewGCM(block)
	if err != nil {
		return nil, err
	}

	if len(ciphertext) < aesGCM.NonceSize() {
		return nil, errors.New("ciphertext too short")
	}

	nonce := ciphertext[:aesGCM.NonceSize()]
	ciphertext = ciphertext[aesGCM.NonceSize():]

	plaintext, err := aesGCM.Open(nil, nonce, ciphertext, nil)
	if err != nil {
		return nil, err
	}

	return plaintext, nil
}

// GenerateDeviceFingerprint 生成设备指纹
func GenerateDeviceFingerprint(info map[string]string) string {
	// 将设备信息排序并连接
	var keys []string
	for k := range info {
		keys = append(keys, k)
	}
	sort.Strings(keys)

	var data string
	for _, k := range keys {
		data += k + ":" + info[k] + "|"
	}

	// 使用SHA-256生成指纹
	hash := sha256.Sum256([]byte(data))
	return hex.EncodeToString(hash[:])
}

// GenerateRandomBytes 生成指定长度的随机字节
func GenerateRandomBytes(length int) ([]byte, error) {
	bytes := make([]byte, length)
	if _, err := rand.Read(bytes); err != nil {
		return nil, err
	}
	return bytes, nil
}

// HashPassword 对密码进行加盐哈希
func HashPassword(password string, salt []byte) string {
	// 将密码和盐值组合
	combined := append([]byte(password), salt...)
	
	// 使用bcrypt进行哈希
	hash, err := bcrypt.GenerateFromPassword(combined, bcrypt.DefaultCost)
	if err != nil {
		return ""
	}
	return string(hash)
}

// VerifyPassword 验证密码
func VerifyPassword(hashedPassword string, password string, salt []byte) bool {
	// 将密码和盐值组合
	combined := append([]byte(password), salt...)
	
	// 验证密码
	err := bcrypt.CompareHashAndPassword([]byte(hashedPassword), combined)
	return err == nil
}

// GenerateID 生成唯一ID
func GenerateID() string {
	b := make([]byte, 16)
	_, err := rand.Read(b)
	if err != nil {
		return ""
	}
	return hex.EncodeToString(b)
}
