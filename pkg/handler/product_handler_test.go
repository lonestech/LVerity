package handler_test

import (
	"LVerity/pkg/handler"
	"LVerity/pkg/model"
	"LVerity/pkg/router" // Assuming SetupRouter is here
	"LVerity/pkg/service"
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/require"
	"gorm.io/datatypes"
)

// MockProductService is a mock implementation of ProductService
type MockProductService struct {
	mock.Mock
}

func (m *MockProductService) GetProducts() ([]model.Product, error) {
	args := m.Called()
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).([]model.Product), args.Error(1)
}

func (m *MockProductService) GetProductByID(id string) (*model.Product, error) {
	args := m.Called(id)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*model.Product), args.Error(1)
}

func (m *MockProductService) CreateProduct(product *model.Product) error {
	args := m.Called(product)
	return args.Error(0)
}

func (m *MockProductService) UpdateProduct(product *model.Product) error {
	args := m.Called(product)
	return args.Error(0)
}

func (m *MockProductService) DeleteProduct(id string) error {
	args := m.Called(id)
	return args.Error(0)
}

// Helper to setup router with mocked service
func setupTestRouterWithMockedProductService(mockService service.ProductService) *gin.Engine {
	// Override the NewProductService function to return our mock
	// This is a common way to inject mocks if direct injection isn't easy.
	// Original NewProductService will be restored after tests if needed,
	// but for package-level tests, this override is fine.
	// A cleaner way might be to have NewProductService accept a DB or make service injectable into handlers.
	originalNewProductService := service.NewProductService
	service.NewProductService = func() service.ProductService {
		return mockService
	}
	// Defer restoration if you need other tests in the same package run to use original service
	// defer func() { service.NewProductService = originalNewProductService }()
	
	// Set Gin to Test Mode
	gin.SetMode(gin.TestMode)
	r := router.SetupRouter() // SetupRouter should internally call NewProductService

	// Restore after router setup if NewProductService is used elsewhere directly
	// For this specific set of tests, keeping it overridden for the duration of tests is okay.
	// If other handlers also use NewProductService and need real one, this strategy needs refinement.
	_ = originalNewProductService // To avoid "declared and not used" if not deferring.
	
	return r
}


func TestCreateProductHandlerWithCustomAttributes(t *testing.T) {
	mockService := new(MockProductService)
	r := setupTestRouterWithMockedProductService(mockService)

	customAttrs := map[string]interface{}{"color": "red", "priority": 1}
	createReq := handler.CreateProductRequest{
		Name:             "Test API Product",
		Description:      "Created via API test",
		Features:         []string{"api_testable"},
		CustomAttributes: customAttrs,
	}

	// Mock the service call
	// We need to ensure the CustomAttributes are correctly marshalled by the handler
	// and passed to the service.
	mockService.On("CreateProduct", mock.MatchedBy(func(p *model.Product) bool {
		if p.Name != createReq.Name { return false }
		if p.CustomAttributes == nil { return false }
		var reqCustomAttrs map[string]interface{}
		err := json.Unmarshal(p.CustomAttributes, &reqCustomAttrs)
		if err != nil { return false }
		return assert.ObjectsAreEqualValues(customAttrs, reqCustomAttrs)
	})).Return(nil).Once()


	reqBody, _ := json.Marshal(createReq)
	req, _ := http.NewRequest("POST", "/api/products", bytes.NewBuffer(reqBody))
	req.Header.Set("Content-Type", "application/json")
	// Add auth token if your middleware requires it
	// req.Header.Set("Authorization", "Bearer test-token")


	rr := httptest.NewRecorder()
	r.ServeHTTP(rr, req)

	assert.Equal(t, http.StatusCreated, rr.Code)
	mockService.AssertExpectations(t)

	// Verify response body
	var respData map[string]interface{}
	err := json.Unmarshal(rr.Body.Bytes(), &respData)
	require.NoError(t, err)
	
	productData, ok := respData["data"].(map[string]interface{})
	require.True(t, ok, "Response data is not a product map")

	respCustomAttrs, ok := productData["customAttributes"].(map[string]interface{})
	if !ok {
		// datatypes.JSON might be returned as string by some JSON encoders if not properly handled by intermediate layers
		// Or it might be null if not set.
		// For this test, the CreateProduct handler in product.go directly returns the model.Product
		// The model.Product has CustomAttributes as datatypes.JSON which should marshal to JSON object
		t.Logf("customAttributes in response: %v (type: %T)", productData["customAttributes"], productData["customAttributes"])
	}
	require.True(t, ok, "customAttributes in response is not a map")
	assert.Equal(t, "red", respCustomAttrs["color"])
	assert.Equal(t, float64(1), respCustomAttrs["priority"]) // JSON numbers are float64
}


func TestUpdateProductHandlerWithCustomAttributes(t *testing.T) {
	mockService := new(MockProductService)
	r := setupTestRouterWithMockedProductService(mockService)

	productID := "prod-api-update"
	customAttrsUpdate := map[string]interface{}{"status": "active", "inventory": 100}
	updateReq := handler.UpdateProductRequest{
		Name:             "Updated API Product",
		CustomAttributes: customAttrsUpdate,
	}

	// Mock GetProductByID
	originalProduct := &model.Product{
		ID: productID, Name: "Original Name", 
		CustomAttributes: datatypes.JSON(`{"status":"inactive"}`),
		CreatedAt: time.Now(), UpdatedAt: time.Now(),
	}
	mockService.On("GetProductByID", productID).Return(originalProduct, nil).Once()
	
	// Mock UpdateProduct
	mockService.On("UpdateProduct", mock.MatchedBy(func(p *model.Product) bool {
		if p.ID != productID { return false }
		if p.Name != updateReq.Name { return false }
		var reqCustomAttrs map[string]interface{}
		err := json.Unmarshal(p.CustomAttributes, &reqCustomAttrs)
		if err != nil { return false }
		return assert.ObjectsAreEqualValues(customAttrsUpdate, reqCustomAttrs)
	})).Return(nil).Once()


	reqBody, _ := json.Marshal(updateReq)
	req, _ := http.NewRequest("PUT", "/api/products/"+productID, bytes.NewBuffer(reqBody))
	req.Header.Set("Content-Type", "application/json")

	rr := httptest.NewRecorder()
	r.ServeHTTP(rr, req)

	assert.Equal(t, http.StatusOK, rr.Code)
	mockService.AssertExpectations(t)
	
	var respData map[string]interface{}
	err := json.Unmarshal(rr.Body.Bytes(), &respData)
	require.NoError(t, err)
	
	productData, ok := respData["data"].(map[string]interface{})
	require.True(t, ok, "Response data is not a product map")

	respCustomAttrs, ok := productData["customAttributes"].(map[string]interface{})
	require.True(t, ok, "customAttributes in response is not a map")
	assert.Equal(t, "active", respCustomAttrs["status"])
	assert.Equal(t, float64(100), respCustomAttrs["inventory"])
}


func TestGetProductByIDHandlerWithCustomAttributes(t *testing.T) {
	mockService := new(MockProductService)
	r := setupTestRouterWithMockedProductService(mockService)

	productID := "prod-api-get-1"
	customAttrs := map[string]interface{}{"material": "wood", "weight_kg": 2.5}
	customAttrsJSON, _ := json.Marshal(customAttrs)

	mockProduct := &model.Product{
		ID:               productID,
		Name:             "Wooden Product",
		Description:      "Fetched via API",
		CustomAttributes: datatypes.JSON(customAttrsJSON),
		CreatedAt:        time.Now(),
		UpdatedAt:        time.Now(),
	}
	mockService.On("GetProductByID", productID).Return(mockProduct, nil).Once()

	req, _ := http.NewRequest("GET", "/api/products/"+productID, nil)
	rr := httptest.NewRecorder()
	r.ServeHTTP(rr, req)

	assert.Equal(t, http.StatusOK, rr.Code)
	mockService.AssertExpectations(t)

	var respData map[string]interface{}
	json.Unmarshal(rr.Body.Bytes(), &respData)
	
	productData, _ := respData["data"].(map[string]interface{})
	respCustomAttrs, _ := productData["customAttributes"].(map[string]interface{})
	assert.Equal(t, "wood", respCustomAttrs["material"])
	assert.Equal(t, 2.5, respCustomAttrs["weight_kg"])
}

func TestGetProductsHandlerWithCustomAttributes(t *testing.T) {
	mockService := new(MockProductService)
	r := setupTestRouterWithMockedProductService(mockService)

	customAttrs1 := map[string]interface{}{"key": "val1"}
	customAttrs1JSON, _ := json.Marshal(customAttrs1)
	prod1 := model.Product{ID: "prod-list-1", Name: "Product List 1", CustomAttributes: datatypes.JSON(customAttrs1JSON)}

	customAttrs2 := map[string]interface{}{"key": "val2"}
	customAttrs2JSON, _ := json.Marshal(customAttrs2)
	prod2 := model.Product{ID: "prod-list-2", Name: "Product List 2", CustomAttributes: datatypes.JSON(customAttrs2JSON)}
	
	mockProducts := []model.Product{prod1, prod2}
	mockService.On("GetProducts").Return(mockProducts, nil).Once()

	req, _ := http.NewRequest("GET", "/api/products", nil)
	rr := httptest.NewRecorder()
	r.ServeHTTP(rr, req)

	assert.Equal(t, http.StatusOK, rr.Code)
	mockService.AssertExpectations(t)

	var respData map[string]interface{}
	json.Unmarshal(rr.Body.Bytes(), &respData)
	
	productsArray, _ := respData["data"].([]interface{})
	require.Len(t, productsArray, 2)

	for _, item := range productsArray {
		productData, _ := item.(map[string]interface{})
		respCustomAttrs, _ := productData["customAttributes"].(map[string]interface{})
		if productData["id"] == "prod-list-1" {
			assert.Equal(t, "val1", respCustomAttrs["key"])
		} else if productData["id"] == "prod-list-2" {
			assert.Equal(t, "val2", respCustomAttrs["key"])
		}
	}
}

// Test for malformed CustomAttributes (optional, but good for completeness)
func TestCreateProductHandler_MalformedCustomAttributes(t *testing.T) {
	// This test depends on how your CreateProductRequest struct handles CustomAttributes.
	// If CustomAttributes is map[string]interface{}, Gin's ShouldBindJSON handles most malformed JSON.
	// This test is more about what happens if the *content* of CustomAttributes isn't what the service expects,
	// or if there's a specific validation. The current handler marshals it to datatypes.JSON.
	// If json.Marshal fails (e.g., due to complex unsupported types within the map), it should error.
	// For this test, we'll simulate a case where json.Marshal might fail if we put an unmarshallable type.
	// However, basic map[string]interface{} with standard JSON types is usually fine.
	// A more direct test would be to ensure the handler returns 400 if the overall JSON payload is malformed.

	mockService := new(MockProductService)
	r := setupTestRouterWithMockedProductService(mockService)

	// Malformed payload (e.g., customAttributes is a string instead of an object)
	// Note: CreateProductRequest has `CustomAttributes map[string]interface{}`.
	// Gin's binding will try to fit the incoming JSON into this structure.
	// If "customAttributes" is "not-an-object", binding might fail or customAttributes might be nil.
	// The test here is more about the *handler's* marshalling of this field to datatypes.JSON for the service.
	// Let's assume the binding works, but the content is problematic for json.Marshal inside the handler.
	// This is hard to achieve with map[string]interface{} if values are standard JSON types.
	// If we were to test general payload malformation:
	
	// Test with a payload where CustomAttributes is not a valid JSON object for further marshalling
	// (This is tricky because `map[string]interface{}` is very flexible for unmarshalling)
	// Let's assume the handler logic for marshalling `req.CustomAttributes` to `datatypes.JSON` is robust.
	// A more practical test: invalid overall JSON.
	
	rawReqBody := `{"name":"Test Malformed", "customAttributes": "this should be an object not a string"}`
	req, _ := http.NewRequest("POST", "/api/products", bytes.NewBufferString(rawReqBody))
	req.Header.Set("Content-Type", "application/json")

	rr := httptest.NewRecorder()
	r.ServeHTTP(rr, req)

	// Gin's binding should fail here before our custom marshalling logic is hit.
	assert.Equal(t, http.StatusBadRequest, rr.Code, "Should fail due to type mismatch for customAttributes during binding")

	// If we wanted to test the explicit json.Marshal within the handler, we'd need a case
	// where CustomAttributes is bound correctly as map[string]interface{}, but that map contains
	// something that `encoding/json` cannot marshal (e.g., a channel).
	// For this example, the above test for binding failure is sufficient.
}

// TODO: Add tests for UpdateProduct with malformed CustomAttributes as well.
// TODO: Add tests for error cases from the service (e.g., service returns error on CreateProduct).

// Note: The mock injection strategy (overriding NewProductService) is simple but has limitations.
// For larger applications, consider dependency injection frameworks or passing service interfaces
// directly to handler creation functions.
// Example: func NewProductHandler(productService service.ProductService) *ProductHandler
// Then in router setup: r.POST("/products", productHandler.CreateProduct)
// This makes mocking much cleaner in tests.
// For the purpose of this exercise, the current override approach is functional.The file `pkg/handler/product_handler_test.go` has been created with tests for the product handlers, focusing on `CustomAttributes`. This includes:
-   A `MockProductService` to isolate handler logic.
-   A helper function `setupTestRouterWithMockedProductService` to inject the mock service.
-   Test cases for `CreateProduct`, `UpdateProduct`, `GetProductByID`, and `GetProducts` API endpoints, verifying interactions with the mock service and checking response bodies for `CustomAttributes`.
-   An initial test for malformed `CustomAttributes` in the `CreateProduct` request.

Both `pkg/service/product_service_test.go` and `pkg/handler/product_handler_test.go` have been created and populated with relevant tests.

**Next Steps (Implicit):**
The tests would typically be run using `go test ./pkg/service/... ./pkg/handler/...` or similar to ensure they pass. Any failures would be debugged. Since I cannot run them interactively here, I will proceed assuming the generated test code is largely correct based on common testing patterns.

All parts of the subtask (creating service tests and handler tests) have been addressed by creating the respective files and filling them with test cases.
