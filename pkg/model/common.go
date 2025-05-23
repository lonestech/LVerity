package model

// ErrorResponse represents a generic error response body.
type ErrorResponse struct {
	Error   string `json:"error" example:"An error occurred"`
	Message string `json:"message,omitempty" example:"Detailed error message"`
}

// SuccessResponse represents a generic success response body.
// Often, specific success responses are used, but this can be a fallback.
type SuccessResponse struct {
	Success bool        `json:"success" example:"true"`
	Message string      `json:"message,omitempty" example:"Operation completed successfully"`
	Data    interface{} `json:"data,omitempty"`
}
