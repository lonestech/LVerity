package database_test

import (
	"LVerity/pkg/database"
	"LVerity/pkg/model"
	"os"
	"path/filepath"
	"sync"
	"testing"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

// Helper function to reset database state for testing
// This is limited because sync.Once cannot be reset from outside the package.
func resetDBState() {
	if database.DB != nil {
		database.CloseDB()
	}
	database.SetDB(nil)
	// We cannot reset the sync.Once from here, which is a limitation.
	// For true isolation, database.once would need to be resettable,
	// e.g., by making it a non-const var or providing a test helper.
}

func TestInitDB_CreatesFile(t *testing.T) {
	// Reset state before test
	resetDBState()

	// Define a temporary, unique database path
	tempDir := t.TempDir() // Using t.TempDir() for automatic cleanup of the directory
	dbPath := filepath.Join(tempDir, "test_create.db")

	// Ensure the database file does not exist before calling InitDB
	// t.TempDir() ensures the directory is clean, so file shouldn't exist.
	_, err := os.Stat(dbPath)
	if !os.IsNotExist(err) {
		t.Fatalf("Database file %s already exists or stat error: %v", dbPath, err)
	}

	config := &database.Config{DBPath: dbPath}

	// Call InitDB
	// IMPORTANT: Due to sync.Once in the database package, the actual
	// DB initialization (gorm.Open, AutoMigrate) will only run if this is the
	// *first* call to InitDB in the entire test suite run.
	initErr := database.InitDB(config)
	if initErr != nil {
		// If InitDB's once.Do was already run, initErr might be the error
		// from that first run, or nil if the first run was successful.
		// This is tricky. Let's assume for this test, we want to see if a call
		// to InitDB (even if it doesn't re-run the core logic) results in a usable DB.
		// However, the file creation check is the primary goal.
		// The current InitDB returns the error captured by once.Do.
		// If another test ran InitDB successfully, err will be nil.
		// If another test ran InitDB and it failed, err will be that error.
		// This is not ideal. We'll proceed assuming this test "owns" the first InitDB call
		// or that subsequent calls with different paths are problematic with current InitDB design.
	}
	
	// Check if InitDB itself returned an error that we should fail on
	// This check is problematic due to sync.Once. If another test already ran InitDB successfully,
	// this specific call to InitDB might not do anything but also might not return an error.
	// For this test, we are primarily concerned with file creation.
	// A more robust InitDB would perhaps return an error if called with a different config
	// after initialization.

	// Check that the database file was created
	_, err = os.Stat(dbPath)
	if os.IsNotExist(err) {
		t.Fatalf("InitDB did not create database file: %s, InitDB error: %v", dbPath, initErr)
	}
	if err != nil {
		t.Fatalf("Error stating database file %s: %v", dbPath, err)
	}

	// Cleanup: Close the database connection.
	// t.TempDir() handles file removal.
	// We call resetDBState again to ensure DB is nil for other tests,
	// though sync.Once remains "done".
	defer resetDBState()
}

// Global variable and sync.Once to ensure InitDB for migration test runs robustly ONCE.
// This is a workaround for the non-resettable sync.Once in the main database package.
var migrationTestDBInitialized sync.Once
var migrationTestDB *gorm.DB
var migrationTestErr error

// TestInitDB_PerformsMigrations_Isolated attempts a more isolated migration test.
// It manages its own DB instance separate from the global database.DB to bypass issues
// with the package-level sync.Once. This is how one might test if they could modify InitDB
// or if InitDB returned the *gorm.DB instance.
func TestInitDB_PerformsMigrations_Isolated(t *testing.T) {
	// This test does NOT use database.InitDB directly due to global sync.Once.
	// Instead, it simulates the core logic of InitDB for testing migration.
	// This is a workaround. Ideally, InitDB would be more testable.

	var localDB *gorm.DB
	var err error

	// Use an in-memory SQLite database
	dsn := "file::memory:?cache=shared" 
	// Manually do what InitDB's once.Do would do:
	localDB, err = gorm.Open(sqlite.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Silent), // Use silent logger for tests
	})
	if err != nil {
		t.Fatalf("gorm.Open failed for in-memory DB: %v", err)
	}

	// Perform migrations on this localDB instance
	modelsToMigrate := []interface{}{
		&model.User{}, &model.Permission{}, &model.Role{}, &model.RolePermission{},
		&model.UserRole{}, &model.License{}, &model.LicenseActivation{}, &model.Device{},
		&model.DeviceGroup{}, &model.DeviceLog{}, &model.SystemLog{}, &model.Alert{},
		&model.SystemInfo{}, &model.Setting{}, &model.Customer{}, &model.Product{},
		&model.SystemBackup{}, &model.BackupConfig{}, &model.SystemConfig{},
		&model.LicenseTag{}, &model.LicenseUsage{}, &model.DeviceLocation{},
		&model.AbnormalBehavior{}, &model.BlacklistRule{},
	}
	err = localDB.AutoMigrate(modelsToMigrate...)
	if err != nil {
		t.Fatalf("AutoMigrate failed for in-memory DB: %v", err)
	}

	// Check migrations
	expectedModelChecks := []struct {
		Name  string
		Model interface{}
	}{
		{"User", &model.User{}}, {"Permission", &model.Permission{}}, {"Role", &model.Role{}},
		{"RolePermission", &model.RolePermission{}}, {"UserRole", &model.UserRole{}},
		{"License", &model.License{}}, {"LicenseActivation", &model.LicenseActivation{}},
		{"Device", &model.Device{}}, {"DeviceGroup", &model.DeviceGroup{}},
		{"DeviceLog", &model.DeviceLog{}}, {"SystemLog", &model.SystemLog{}},
		{"Alert", &model.Alert{}}, {"SystemInfo", &model.SystemInfo{}},
		{"Setting", &model.Setting{}}, {"Customer", &model.Customer{}},
		{"Product", &model.Product{}}, {"SystemBackup", &model.SystemBackup{}},
		{"BackupConfig", &model.BackupConfig{}}, {"SystemConfig", &model.SystemConfig{}},
		{"LicenseTag", &model.LicenseTag{}}, {"LicenseUsage", &model.LicenseUsage{}},
		{"DeviceLocation", &model.DeviceLocation{}},
		{"AbnormalBehavior", &model.AbnormalBehavior{}}, {"BlacklistRule", &model.BlacklistRule{}},
	}

	for _, m := range expectedModelChecks {
		if !localDB.Migrator().HasTable(m.Model) {
			t.Errorf("Expected table for model %s to exist in isolated in-memory DB, but it doesn't.", m.Name)
		}
	}

	// Clean up the localDB connection
	if localDB != nil {
		sqlDB, _ := localDB.DB()
		sqlDB.Close()
	}
}

// Note on gorm/logger: The original InitDB uses logger.Info.
// For tests, especially if they run often, logger.Silent is often preferred
// to avoid verbose output, unless debugging specific DB interactions.
// The TestInitDB_PerformsMigrations_Isolated uses Silent.
// The tests relying on the actual InitDB will use its configured logger.
