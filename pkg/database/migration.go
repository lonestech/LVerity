package database

import (
	"fmt"
	"io/ioutil"
	"os"
	"path/filepath"
	"sort"
	"strings"
)

// RunMigrations 执行数据库迁移
func RunMigrations(migrationsDir string) error {
	// 确保迁移目录存在
	if err := os.MkdirAll(migrationsDir, 0755); err != nil {
		return fmt.Errorf("failed to create migrations directory: %v", err)
	}

	// 获取所有迁移文件
	files, err := ioutil.ReadDir(migrationsDir)
	if err != nil {
		return fmt.Errorf("failed to read migrations directory: %v", err)
	}

	// 过滤并排序SQL文件
	var migrations []string
	for _, file := range files {
		if !file.IsDir() && strings.HasSuffix(file.Name(), ".sql") {
			migrations = append(migrations, file.Name())
		}
	}
	sort.Strings(migrations)

	// 创建迁移记录表
	if err := GetDB().Exec(`
		CREATE TABLE IF NOT EXISTS migrations (
			id VARCHAR(255) PRIMARY KEY,
			executed_at DATETIME NOT NULL
		)
	`).Error; err != nil {
		return fmt.Errorf("failed to create migrations table: %v", err)
	}

	// 执行每个迁移文件
	for _, migration := range migrations {
		// 检查是否已执行过该迁移
		var count int64
		if err := GetDB().Model(&struct{ ID string }{}).
			Table("migrations").
			Where("id = ?", migration).
			Count(&count).Error; err != nil {
			return fmt.Errorf("failed to check migration status: %v", err)
		}

		if count > 0 {
			fmt.Printf("Skipping migration: %s (already executed)\n", migration)
			continue
		}

		filePath := filepath.Join(migrationsDir, migration)
		content, err := ioutil.ReadFile(filePath)
		if err != nil {
			return fmt.Errorf("failed to read migration file %s: %v", migration, err)
		}

		// 开始事务
		tx := GetDB().Begin()

		// 分割SQL语句
		statements := strings.Split(string(content), ";")

		// 执行每条SQL语句
		fmt.Printf("Running migration: %s\n", migration)
		var executed bool
		for _, stmt := range statements {
			// 跳过空语句和注释
			stmt = strings.TrimSpace(stmt)
			if stmt == "" || strings.HasPrefix(stmt, "--") {
				continue
			}

			// 尝试执行语句
			err := tx.Exec(stmt).Error
			if err != nil {
				// 可以忽略的错误类型
				if strings.Contains(err.Error(), "Duplicate key name") ||
					strings.Contains(err.Error(), "Duplicate foreign key constraint name") ||
					strings.Contains(err.Error(), "already exists") ||
					strings.Contains(err.Error(), "Unknown column") ||
					strings.Contains(err.Error(), "Duplicate column name") {
					fmt.Printf("Warning: %v in %s (continuing)\n", err, migration)
					continue
				}
				// 如果是创建索引失败，但表不存在，回滚并返回错误
				if strings.Contains(err.Error(), "Table") &&
					strings.Contains(err.Error(), "doesn't exist") &&
					strings.Contains(stmt, "CREATE INDEX") {
					tx.Rollback()
					return fmt.Errorf("failed to execute migration %s: %v", migration, err)
				}
				// 其他错误需要回滚
				tx.Rollback()
				return fmt.Errorf("failed to execute migration %s: %v", migration, err)
			}
			executed = true
		}

		// 如果有语句被成功执行，记录迁移完成
		if executed {
			if err := tx.Exec(
				"INSERT INTO migrations (id, executed_at) VALUES (?, NOW())",
				migration,
			).Error; err != nil {
				tx.Rollback()
				return fmt.Errorf("failed to record migration %s: %v", migration, err)
			}
		}

		// 提交事务
		if err := tx.Commit().Error; err != nil {
			return fmt.Errorf("failed to commit migration %s: %v", migration, err)
		}

		fmt.Printf("Completed migration: %s\n", migration)
	}

	return nil
}
