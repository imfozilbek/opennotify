"""Error handling for OpenNotify Python SDK."""

from __future__ import annotations

from typing import Literal

# Error code types
OpenNotifyErrorCode = Literal[
    "NETWORK_ERROR",
    "TIMEOUT_ERROR",
    "AUTHENTICATION_ERROR",
    "VALIDATION_ERROR",
    "NOT_FOUND",
    "RATE_LIMIT",
    "SERVER_ERROR",
    "UNKNOWN_ERROR",
]

# Retryable error codes
_RETRYABLE_CODES: frozenset[OpenNotifyErrorCode] = frozenset(
    {"NETWORK_ERROR", "TIMEOUT_ERROR", "RATE_LIMIT", "SERVER_ERROR"}
)


class OpenNotifyError(Exception):
    """Base exception for OpenNotify SDK errors.

    Attributes:
        code: Error code for programmatic handling.
        status_code: HTTP status code if applicable.
        api_message: Original error message from the API.
        cause: Underlying exception if any.

    Example:
        ```python
        try:
            client.send({...})
        except OpenNotifyError as e:
            if e.code == "RATE_LIMIT":
                time.sleep(60)
                # retry
            elif e.is_retryable():
                # retry with backoff
            else:
                # handle permanent error
                print(f"Error: {e.api_message}")
        ```
    """

    def __init__(
        self,
        message: str,
        code: OpenNotifyErrorCode = "UNKNOWN_ERROR",
        status_code: int | None = None,
        api_message: str | None = None,
        cause: Exception | None = None,
    ) -> None:
        """Initialize OpenNotifyError.

        Args:
            message: Human-readable error message.
            code: Error code for programmatic handling.
            status_code: HTTP status code if applicable.
            api_message: Original error message from the API.
            cause: Underlying exception if any.
        """
        super().__init__(message)
        self.code = code
        self.status_code = status_code
        self.api_message = api_message
        self.cause = cause

    def is_retryable(self) -> bool:
        """Check if this error is retryable.

        Returns:
            True if the error is transient and the request can be retried.
            Retryable errors: NETWORK_ERROR, TIMEOUT_ERROR, RATE_LIMIT, SERVER_ERROR.
        """
        return self.code in _RETRYABLE_CODES

    @classmethod
    def from_response(
        cls,
        status_code: int,
        message: str | None = None,
    ) -> OpenNotifyError:
        """Create an error from an HTTP response.

        Args:
            status_code: HTTP status code.
            message: Error message from the response.

        Returns:
            OpenNotifyError with appropriate error code.
        """
        code = cls._status_to_code(status_code)
        default_message = cls._default_message(code)

        return cls(
            message=message or default_message,
            code=code,
            status_code=status_code,
            api_message=message,
        )

    @classmethod
    def network_error(cls, cause: Exception | None = None) -> OpenNotifyError:
        """Create a network error.

        Args:
            cause: Underlying exception that caused the network error.

        Returns:
            OpenNotifyError with NETWORK_ERROR code.
        """
        message = "Network error occurred"
        if cause:
            message = f"Network error: {cause}"

        return cls(
            message=message,
            code="NETWORK_ERROR",
            cause=cause,
        )

    @classmethod
    def timeout_error(cls, timeout_seconds: float) -> OpenNotifyError:
        """Create a timeout error.

        Args:
            timeout_seconds: Timeout duration that was exceeded.

        Returns:
            OpenNotifyError with TIMEOUT_ERROR code.
        """
        return cls(
            message=f"Request timed out after {timeout_seconds} seconds",
            code="TIMEOUT_ERROR",
        )

    @staticmethod
    def _status_to_code(status_code: int) -> OpenNotifyErrorCode:
        """Map HTTP status code to error code.

        Args:
            status_code: HTTP status code.

        Returns:
            Corresponding OpenNotifyErrorCode.
        """
        if status_code == 401 or status_code == 403:
            return "AUTHENTICATION_ERROR"
        if status_code == 404:
            return "NOT_FOUND"
        if status_code == 400 or status_code == 422:
            return "VALIDATION_ERROR"
        if status_code == 429:
            return "RATE_LIMIT"
        if status_code >= 500:
            return "SERVER_ERROR"
        return "UNKNOWN_ERROR"

    @staticmethod
    def _default_message(code: OpenNotifyErrorCode) -> str:
        """Get default message for error code.

        Args:
            code: Error code.

        Returns:
            Default error message.
        """
        messages: dict[OpenNotifyErrorCode, str] = {
            "NETWORK_ERROR": "Network error occurred",
            "TIMEOUT_ERROR": "Request timed out",
            "AUTHENTICATION_ERROR": "Authentication failed. Check your API key.",
            "VALIDATION_ERROR": "Invalid request parameters",
            "NOT_FOUND": "Resource not found",
            "RATE_LIMIT": "Rate limit exceeded. Please slow down.",
            "SERVER_ERROR": "Server error occurred. Please try again.",
            "UNKNOWN_ERROR": "An unknown error occurred",
        }
        return messages.get(code, "An unknown error occurred")

    def __repr__(self) -> str:
        """Return string representation of the error."""
        return (
            f"OpenNotifyError(code={self.code!r}, "
            f"status_code={self.status_code}, "
            f"message={self.api_message!r})"
        )
