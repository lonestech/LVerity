package router_test

import (
	"LVerity/pkg/router" // Import the router package to test
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"strings"
	"testing"

	"github.com/gin-gonic/gin" // For gin.SetMode

	_ "LVerity/docs" // This import is crucial: it runs the init() in docs/docs.go
)

// TestSwaggerDocsExist checks if swagger.json and swagger.yaml files are generated.
func TestSwaggerDocsExist(t *testing.T) {
	// Determine the project root directory to correctly locate the 'docs' folder.
	// This logic assumes the tests are run from a context where '../..' is the project root.
	// Adjust if your test execution environment is different.
	// A more robust way might be to use build tags or environment variables if needed.
	projectRoot, err := filepath.Abs("../..")
	if err != nil {
		t.Fatalf("Failed to get project root: %v", err)
	}

	docFiles := []string{
		filepath.Join(projectRoot, "docs", "swagger.json"),
		filepath.Join(projectRoot, "docs", "swagger.yaml"),
	}

	for _, filePath := range docFiles {
		if _, err := os.Stat(filePath); os.IsNotExist(err) {
			t.Errorf("Swagger documentation file not found: %s", filePath)
		} else if err != nil {
			t.Errorf("Error checking file %s: %v", filePath, err)
		}
	}
}

// TestSwaggerUIAccessible checks if the /swagger/index.html endpoint is accessible.
func TestSwaggerUIAccessible(t *testing.T) {
	gin.SetMode(gin.TestMode)
	r := router.SetupRouter()

	// Create a new HTTP request
	req, err := http.NewRequest("GET", "/swagger/index.html", nil)
	if err != nil {
		t.Fatalf("Failed to create request: %v", err)
	}

	// Record the response
	rr := httptest.NewRecorder()
	r.ServeHTTP(rr, req)

	// Check the status code
	if status := rr.Code; status != http.StatusOK {
		t.Errorf("Handler returned wrong status code: got %v want %v",
			status, http.StatusOK)
	}

	// Optionally, check if the response body contains expected text
	// This confirms that not just any 200 is returned, but specifically the Swagger UI page.
	expectedBodyContent := "Swagger UI"
	if !strings.Contains(rr.Body.String(), expectedBodyContent) {
		// Adding more debug information
		t.Logf("Response body: %s", rr.Body.String())
		t.Errorf("Handler returned unexpected body: got body that does not contain %q", expectedBodyContent)
	}
}

// TestSwaggerUIAccessibleRedirects checks behavior for /swagger/ and /swagger
func TestSwaggerUIAccessibleRedirects(t *testing.T) {
	gin.SetMode(gin.TestMode)
	r := router.SetupRouter()

	tests := []struct {
		name             string
		path             string
		expectedStatus   int
		expectedLocation string // For redirects
		expectedBodyPart string // For direct serves
	}{
		{
			name:             "Access /swagger/",
			path:             "/swagger/",
			expectedStatus:   http.StatusOK,
			expectedBodyPart: "Swagger UI",
		},
		{
			name:             "Access /swagger",
			path:             "/swagger",
			expectedStatus:   http.StatusMovedPermanently, // Expect redirect to /swagger/
			expectedLocation: "/swagger/",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			req, err := http.NewRequest("GET", tt.path, nil)
			if err != nil {
				t.Fatalf("Failed to create request for %s: %v", tt.path, err)
			}

			rr := httptest.NewRecorder()
			r.ServeHTTP(rr, req)

			if status := rr.Code; status != tt.expectedStatus {
				t.Errorf("Handler for %s returned wrong status code: got %v want %v. Body: %s",
					tt.path, status, tt.expectedStatus, rr.Body.String())
			}

			if tt.expectedStatus == http.StatusMovedPermanently {
				location := rr.Header().Get("Location")
				if location != tt.expectedLocation {
					t.Errorf("Handler for %s redirected to %s, want %s",
						tt.path, location, tt.expectedLocation)
				}
			}

			if tt.expectedBodyPart != "" {
				if !strings.Contains(rr.Body.String(), tt.expectedBodyPart) {
					t.Errorf("Handler for %s returned unexpected body: got \n%s\n want body containing %q",
						tt.path, rr.Body.String(), tt.expectedBodyPart)
				}
			}
		})
	}
}
