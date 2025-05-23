package service_test

import (
	"LVerity/pkg/database"
	"LVerity/pkg/model"
	"LVerity/pkg/service"
	"encoding/json"
	"sync"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
	"gorm.io/datatypes"
)

var (
	testDB *gorm.DB
	dbOnce sync.Once
)

// setupTestDB initializes an in-memory SQLite database for testing.
func setupTestDB(t *testing.T) *gorm.DB {
	dbOnce.Do(func() {
		var err error
		// Using "file::memory:?cache=shared" to allow multiple connections to the same in-memory DB if needed,
		// though for these tests, we typically want isolation. A unique DSN per test function or suite
		// might be better if tests run in parallel and need absolute DB isolation.
		// For simplicity here, we use one in-memory DB for the package.
		testDB, err = gorm.Open(sqlite.Open("file::memory:?cache=shared"), &gorm.Config{
			Logger: logger.Default.LogMode(logger.Silent), // Use Silent logger for tests
		})
		require.NoError(t, err, "Failed to connect to in-memory database")

		// Auto-migrate schemas
		err = testDB.AutoMigrate(
			&model.Product{},
			// Add other models if they are involved in product service operations as dependencies
		)
		require.NoError(t, err, "Failed to migrate database schemas")
	})

	// Clean up product table before each test that uses this specific setup
	// For more complex scenarios, transactions or dropping/recreating tables might be used.
	if testDB != nil { // testDB is shared, ensure cleanup
		err := testDB.Exec("DELETE FROM products").Error
		require.NoError(t, err, "Failed to clean products table")
	}
	
	// Override the global DB instance from the database package with our testDB
	// This is crucial if the service layer uses database.DB directly.
	database.SetDB(testDB)

	return testDB
}


func TestCreateProductWithCustomAttributes(t *testing.T) {
	setupTestDB(t)
	productService := service.NewProductService()

	customAttrsMap := map[string]interface{}{
		"color": "blue",
		"size":  float64(10), // JSON numbers are float64
		"available": true,
	}
	customAttrsJSON, err := json.Marshal(customAttrsMap)
	require.NoError(t, err)

	product := &model.Product{
		ID:               "prod-create-custom",
		Name:             "Custom Product",
		Description:      "Product with custom attributes",
		CustomAttributes: datatypes.JSON(customAttrsJSON),
	}

	err = productService.CreateProduct(product)
	require.NoError(t, err)

	retrievedProduct, err := productService.GetProductByID("prod-create-custom")
	require.NoError(t, err)
	require.NotNil(t, retrievedProduct)

	assert.Equal(t, "Custom Product", retrievedProduct.Name)
	
	require.NotEmpty(t, retrievedProduct.CustomAttributes, "CustomAttributes should not be empty")

	var retrievedAttrsMap map[string]interface{}
	err = json.Unmarshal(retrievedProduct.CustomAttributes, &retrievedAttrsMap)
	require.NoError(t, err, "Failed to unmarshal CustomAttributes from retrieved product")
	
	assert.Equal(t, "blue", retrievedAttrsMap["color"])
	assert.Equal(t, float64(10), retrievedAttrsMap["size"]) // JSON numbers unmarshal to float64
	assert.Equal(t, true, retrievedAttrsMap["available"])
}

func TestUpdateProductWithCustomAttributes(t *testing.T) {
	setupTestDB(t)
	productService := service.NewProductService()

	// 1. Create initial product
	initialAttrsMap := map[string]interface{}{"status": "new"}
	initialAttrsJSON, _ := json.Marshal(initialAttrsMap)
	product := &model.Product{
		ID:               "prod-update-custom",
		Name:             "Updatable Product",
		CustomAttributes: datatypes.JSON(initialAttrsJSON),
	}
	err := productService.CreateProduct(product)
	require.NoError(t, err)

	// 2. Update only custom attributes
	updatedAttrsMap := map[string]interface{}{"status": "used", "condition": "good"}
	updatedAttrsJSON, _ := json.Marshal(updatedAttrsMap)
	
	productToUpdate, err := productService.GetProductByID("prod-update-custom")
	require.NoError(t, err)
	productToUpdate.CustomAttributes = datatypes.JSON(updatedAttrsJSON)
	
	err = productService.UpdateProduct(productToUpdate)
	require.NoError(t, err)

	retrievedProduct, err := productService.GetProductByID("prod-update-custom")
	require.NoError(t, err)
	var currentAttrs map[string]interface{}
	err = json.Unmarshal(retrievedProduct.CustomAttributes, &currentAttrs)
	require.NoError(t, err)
	assert.Equal(t, "used", currentAttrs["status"])
	assert.Equal(t, "good", currentAttrs["condition"])

	// 3. Update other fields alongside custom attributes
	productToUpdate, err = productService.GetProductByID("prod-update-custom")
	require.NoError(t, err)
	productToUpdate.Name = "Updated Product Name"
	finalAttrsMap := map[string]interface{}{"owner": "test_user"}
	finalAttrsJSON, _ := json.Marshal(finalAttrsMap)
	productToUpdate.CustomAttributes = datatypes.JSON(finalAttrsJSON)
	
	err = productService.UpdateProduct(productToUpdate)
	require.NoError(t, err)
	
	retrievedProduct, err = productService.GetProductByID("prod-update-custom")
	require.NoError(t, err)
	assert.Equal(t, "Updated Product Name", retrievedProduct.Name)
	err = json.Unmarshal(retrievedProduct.CustomAttributes, &currentAttrs)
	require.NoError(t, err)
	assert.Equal(t, "test_user", currentAttrs["owner"])
	assert.Nil(t, currentAttrs["status"], "Old custom attributes should be overwritten")

	// 4. Test clearing custom attributes (setting to empty map)
	productToUpdate, err = productService.GetProductByID("prod-update-custom")
	require.NoError(t, err)
	emptyAttrsJSON, _ := json.Marshal(map[string]interface{}{})
	productToUpdate.CustomAttributes = datatypes.JSON(emptyAttrsJSON)

	err = productService.UpdateProduct(productToUpdate)
	require.NoError(t, err)

	retrievedProduct, err = productService.GetProductByID("prod-update-custom")
	require.NoError(t, err)
	// Depending on DB driver and GORM behavior, empty JSON might be "{}", "null", or empty string.
	// datatypes.JSON should handle this. If it's "{}", unmarshalling into a map will yield an empty map.
	if len(retrievedProduct.CustomAttributes) > 0 && string(retrievedProduct.CustomAttributes) != "{}" && string(retrievedProduct.CustomAttributes) != "null" {
		err = json.Unmarshal(retrievedProduct.CustomAttributes, &currentAttrs)
		require.NoError(t, err)
		assert.Empty(t, currentAttrs, "CustomAttributes should be empty map")
	} else if string(retrievedProduct.CustomAttributes) == "{}" {
		// This is fine, represents an empty JSON object
		err = json.Unmarshal(retrievedProduct.CustomAttributes, &currentAttrs)
		require.NoError(t, err)
		assert.Empty(t, currentAttrs, "CustomAttributes should be empty map")
	} else if retrievedProduct.CustomAttributes == nil || len(retrievedProduct.CustomAttributes) == 0 || string(retrievedProduct.CustomAttributes) == "null" {
		// This is also acceptable for "cleared"
		assert.True(t, retrievedProduct.CustomAttributes == nil || len(retrievedProduct.CustomAttributes) == 0 || string(retrievedProduct.CustomAttributes) == "null", "CustomAttributes should be nil or empty JSON")
	}


	// 5. Test setting custom attributes to nil (if supported by model/logic)
	// The model field CustomAttributes datatypes.JSON can be nil.
	// If it's set to nil, GORM should store it as SQL NULL.
	productToUpdate, err = productService.GetProductByID("prod-update-custom")
	require.NoError(t, err)
	productToUpdate.CustomAttributes = nil // Set to nil directly

	err = productService.UpdateProduct(productToUpdate)
	require.NoError(t, err)

	retrievedProduct, err = productService.GetProductByID("prod-update-custom")
	require.NoError(t, err)
	// datatypes.JSON might unmarshal SQL NULL to a 'null' JSON literal or an empty datatypes.JSON object.
	// Check if it's effectively nil or empty.
	assert.True(t, retrievedProduct.CustomAttributes == nil || string(retrievedProduct.CustomAttributes) == "null" || len(retrievedProduct.CustomAttributes) == 0, "CustomAttributes should be nil or represent JSON null")
	if retrievedProduct.CustomAttributes != nil && string(retrievedProduct.CustomAttributes) != "null" {
		err = json.Unmarshal(retrievedProduct.CustomAttributes, &currentAttrs)
		require.NoError(t, err)
		assert.Empty(t, currentAttrs, "CustomAttributes should effectively be empty or nil")
	}
}

func TestGetProductWithCustomAttributes(t *testing.T) {
	setupTestDB(t)
	productService := service.NewProductService()

	attrs1 := map[string]interface{}{"key1": "val1"}
	attrs1JSON, _ := json.Marshal(attrs1)
	prod1 := &model.Product{ID: "prod-get-1", Name: "Product Get 1", CustomAttributes: datatypes.JSON(attrs1JSON)}
	
	attrs2 := map[string]interface{}{"key2": true}
	attrs2JSON, _ := json.Marshal(attrs2)
	prod2 := &model.Product{ID: "prod-get-2", Name: "Product Get 2", CustomAttributes: datatypes.JSON(attrs2JSON)}

	require.NoError(t, productService.CreateProduct(prod1))
	require.NoError(t, productService.CreateProduct(prod2))

	// Test GetProductByID
	retrievedProd1, err := productService.GetProductByID("prod-get-1")
	require.NoError(t, err)
	require.NotNil(t, retrievedProd1)
	var retrievedAttrs1 map[string]interface{}
	err = json.Unmarshal(retrievedProd1.CustomAttributes, &retrievedAttrs1)
	require.NoError(t, err)
	assert.Equal(t, "val1", retrievedAttrs1["key1"])

	// Test GetProducts
	allProducts, err := productService.GetProducts()
	require.NoError(t, err)
	assert.Len(t, allProducts, 2)

	for _, p := range allProducts {
		require.NotEmpty(t, p.CustomAttributes, "CustomAttributes should not be empty for product %s", p.ID)
		var tempAttrs map[string]interface{}
		err = json.Unmarshal(p.CustomAttributes, &tempAttrs)
		require.NoError(t, err, "Failed to unmarshal CustomAttributes for product %s", p.ID)
		if p.ID == "prod-get-1" {
			assert.Equal(t, "val1", tempAttrs["key1"])
		} else if p.ID == "prod-get-2" {
			assert.Equal(t, true, tempAttrs["key2"])
		}
	}
}

// Note: The global `testDB` and `dbOnce` are for simplicity in this example.
// For tests that need to run in parallel or require strict isolation without interference,
// consider creating a new in-memory database instance (e.g., using a unique DSN like "file:testXYZ.db?mode=memory&cache=shared")
// for each test or test suite, and pass the *gorm.DB instance to service constructors if possible,
// or use a more sophisticated test setup (e.g., test suites with SetupTest/TearDownTest).
// The current `setupTestDB` function attempts to clean the `products` table before each run
// and uses `database.SetDB(testDB)` to inject the test DB for services that might use a global database.DB.The file `pkg/service/product_service_test.go` has been created with the initial set of tests for the product service, focusing on `CustomAttributes`. This includes setting up an in-memory SQLite database for testing.

Next, I need to create `pkg/handler/product_handler_test.go`.

**Step 2.1: Check for existing `pkg/handler/product_handler_test.go`**.
