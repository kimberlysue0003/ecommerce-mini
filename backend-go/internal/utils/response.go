package utils

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// SuccessResponse represents a successful API response
type SuccessResponse struct {
	Success bool        `json:"success"`
	Data    interface{} `json:"data,omitempty"`
	Message string      `json:"message,omitempty"`
}

// ErrorResponse represents an error API response
type ErrorResponse struct {
	Success bool   `json:"success"`
	Error   string `json:"error"`
	Message string `json:"message,omitempty"`
}

// PaginationMeta represents pagination metadata
type PaginationMeta struct {
	Total       int64 `json:"total"`
	Page        int   `json:"page"`
	Limit       int   `json:"limit"`
	TotalPages  int   `json:"totalPages"`
	HasNext     bool  `json:"hasNext"`
	HasPrevious bool  `json:"hasPrevious"`
}

// PaginatedResponse represents a paginated API response
type PaginatedResponse struct {
	Success    bool           `json:"success"`
	Data       interface{}    `json:"data"`
	Pagination PaginationMeta `json:"pagination"`
}

// RespondJSON sends a JSON response
func RespondJSON(c *gin.Context, statusCode int, data interface{}) {
	c.JSON(statusCode, data)
}

// RespondSuccess sends a success response
func RespondSuccess(c *gin.Context, data interface{}, message ...string) {
	msg := ""
	if len(message) > 0 {
		msg = message[0]
	}

	response := SuccessResponse{
		Success: true,
		Data:    data,
		Message: msg,
	}
	c.JSON(http.StatusOK, response)
}

// RespondCreated sends a 201 Created response
func RespondCreated(c *gin.Context, data interface{}, message ...string) {
	msg := ""
	if len(message) > 0 {
		msg = message[0]
	}

	response := SuccessResponse{
		Success: true,
		Data:    data,
		Message: msg,
	}
	c.JSON(http.StatusCreated, response)
}

// RespondError sends an error response
func RespondError(c *gin.Context, statusCode int, err error, message ...string) {
	msg := ""
	if len(message) > 0 {
		msg = message[0]
	}

	response := ErrorResponse{
		Success: false,
		Error:   err.Error(),
		Message: msg,
	}
	c.JSON(statusCode, response)
}

// RespondBadRequest sends a 400 Bad Request response
func RespondBadRequest(c *gin.Context, err error, message ...string) {
	RespondError(c, http.StatusBadRequest, err, message...)
}

// RespondUnauthorized sends a 401 Unauthorized response
func RespondUnauthorized(c *gin.Context, err error, message ...string) {
	RespondError(c, http.StatusUnauthorized, err, message...)
}

// RespondForbidden sends a 403 Forbidden response
func RespondForbidden(c *gin.Context, err error, message ...string) {
	RespondError(c, http.StatusForbidden, err, message...)
}

// RespondNotFound sends a 404 Not Found response
func RespondNotFound(c *gin.Context, err error, message ...string) {
	RespondError(c, http.StatusNotFound, err, message...)
}

// RespondInternalError sends a 500 Internal Server Error response
func RespondInternalError(c *gin.Context, err error, message ...string) {
	RespondError(c, http.StatusInternalServerError, err, message...)
}

// RespondPaginated sends a paginated response
func RespondPaginated(c *gin.Context, data interface{}, pagination PaginationMeta) {
	response := PaginatedResponse{
		Success:    true,
		Data:       data,
		Pagination: pagination,
	}
	c.JSON(http.StatusOK, response)
}
