package opennotify

import (
    "errors"
    "fmt"
)

var (
    // ErrAPIKeyRequired is returned when API key is not provided.
    ErrAPIKeyRequired = errors.New("apiKey is required")

    // ErrChannelRequired is returned when channel is not provided.
    ErrChannelRequired = errors.New("channel is required")

    // ErrProviderRequired is returned when provider is not provided.
    ErrProviderRequired = errors.New("provider is required")

    // ErrRecipientRequired is returned when recipient is not provided.
    ErrRecipientRequired = errors.New("recipient is required")

    // ErrMessageRequired is returned when message is not provided.
    ErrMessageRequired = errors.New("message is required")

    // ErrNotificationIDRequired is returned when notification ID is not provided.
    ErrNotificationIDRequired = errors.New("notification ID is required")
)

// APIError represents an error returned by the OpenNotify API.
type APIError struct {
    // StatusCode is the HTTP status code.
    StatusCode int `json:"statusCode"`

    // Message is the error message.
    Message string `json:"message"`

    // Error is the error type/code.
    ErrorType string `json:"error,omitempty"`
}

// Error implements the error interface.
func (e *APIError) Error() string {
    if e.ErrorType != "" {
        return fmt.Sprintf("opennotify: %s (status %d, type: %s)", e.Message, e.StatusCode, e.ErrorType)
    }
    return fmt.Sprintf("opennotify: %s (status %d)", e.Message, e.StatusCode)
}

// IsNotFound returns true if the error is a 404 Not Found error.
func (e *APIError) IsNotFound() bool {
    return e.StatusCode == 404
}

// IsUnauthorized returns true if the error is a 401 Unauthorized error.
func (e *APIError) IsUnauthorized() bool {
    return e.StatusCode == 401
}

// IsForbidden returns true if the error is a 403 Forbidden error.
func (e *APIError) IsForbidden() bool {
    return e.StatusCode == 403
}

// IsRateLimited returns true if the error is a 429 Too Many Requests error.
func (e *APIError) IsRateLimited() bool {
    return e.StatusCode == 429
}

// IsServerError returns true if the error is a 5xx server error.
func (e *APIError) IsServerError() bool {
    return e.StatusCode >= 500 && e.StatusCode < 600
}

// IsAPIError checks if an error is an APIError and returns it.
func IsAPIError(err error) (*APIError, bool) {
    var apiErr *APIError
    if errors.As(err, &apiErr) {
        return apiErr, true
    }
    return nil, false
}
