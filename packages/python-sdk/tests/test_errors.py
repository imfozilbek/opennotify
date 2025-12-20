"""Tests for OpenNotify error handling."""

from opennotify import OpenNotifyError


class TestOpenNotifyError:
    """Tests for OpenNotifyError class."""

    def test_create_error_with_defaults(self) -> None:
        """Test creating error with default values."""
        error = OpenNotifyError("Something went wrong")

        assert str(error) == "Something went wrong"
        assert error.code == "UNKNOWN_ERROR"
        assert error.status_code is None
        assert error.api_message is None
        assert error.cause is None

    def test_create_error_with_all_fields(self) -> None:
        """Test creating error with all fields."""
        cause = ValueError("underlying error")
        error = OpenNotifyError(
            message="Auth failed",
            code="AUTHENTICATION_ERROR",
            status_code=401,
            api_message="Invalid API key",
            cause=cause,
        )

        assert str(error) == "Auth failed"
        assert error.code == "AUTHENTICATION_ERROR"
        assert error.status_code == 401
        assert error.api_message == "Invalid API key"
        assert error.cause is cause

    def test_is_retryable_for_retryable_errors(self) -> None:
        """Test is_retryable returns True for retryable errors."""
        retryable_codes = ["NETWORK_ERROR", "TIMEOUT_ERROR", "RATE_LIMIT", "SERVER_ERROR"]

        for code in retryable_codes:
            error = OpenNotifyError("error", code=code)  # type: ignore[arg-type]
            assert error.is_retryable() is True, f"{code} should be retryable"

    def test_is_retryable_for_non_retryable_errors(self) -> None:
        """Test is_retryable returns False for non-retryable errors."""
        non_retryable_codes = [
            "AUTHENTICATION_ERROR",
            "VALIDATION_ERROR",
            "NOT_FOUND",
            "UNKNOWN_ERROR",
        ]

        for code in non_retryable_codes:
            error = OpenNotifyError("error", code=code)  # type: ignore[arg-type]
            assert error.is_retryable() is False, f"{code} should not be retryable"

    def test_from_response_401(self) -> None:
        """Test from_response maps 401 to AUTHENTICATION_ERROR."""
        error = OpenNotifyError.from_response(401, "Unauthorized")

        assert error.code == "AUTHENTICATION_ERROR"
        assert error.status_code == 401
        assert error.api_message == "Unauthorized"

    def test_from_response_403(self) -> None:
        """Test from_response maps 403 to AUTHENTICATION_ERROR."""
        error = OpenNotifyError.from_response(403, "Forbidden")

        assert error.code == "AUTHENTICATION_ERROR"
        assert error.status_code == 403

    def test_from_response_404(self) -> None:
        """Test from_response maps 404 to NOT_FOUND."""
        error = OpenNotifyError.from_response(404, "Not found")

        assert error.code == "NOT_FOUND"
        assert error.status_code == 404

    def test_from_response_400(self) -> None:
        """Test from_response maps 400 to VALIDATION_ERROR."""
        error = OpenNotifyError.from_response(400, "Bad request")

        assert error.code == "VALIDATION_ERROR"
        assert error.status_code == 400

    def test_from_response_422(self) -> None:
        """Test from_response maps 422 to VALIDATION_ERROR."""
        error = OpenNotifyError.from_response(422, "Unprocessable entity")

        assert error.code == "VALIDATION_ERROR"
        assert error.status_code == 422

    def test_from_response_429(self) -> None:
        """Test from_response maps 429 to RATE_LIMIT."""
        error = OpenNotifyError.from_response(429, "Too many requests")

        assert error.code == "RATE_LIMIT"
        assert error.status_code == 429

    def test_from_response_500(self) -> None:
        """Test from_response maps 500 to SERVER_ERROR."""
        error = OpenNotifyError.from_response(500, "Internal server error")

        assert error.code == "SERVER_ERROR"
        assert error.status_code == 500

    def test_from_response_503(self) -> None:
        """Test from_response maps 503 to SERVER_ERROR."""
        error = OpenNotifyError.from_response(503, "Service unavailable")

        assert error.code == "SERVER_ERROR"
        assert error.status_code == 503

    def test_from_response_unknown_status(self) -> None:
        """Test from_response maps unknown status to UNKNOWN_ERROR."""
        error = OpenNotifyError.from_response(418, "I'm a teapot")

        assert error.code == "UNKNOWN_ERROR"
        assert error.status_code == 418

    def test_from_response_default_message(self) -> None:
        """Test from_response uses default message when none provided."""
        error = OpenNotifyError.from_response(401)

        assert error.code == "AUTHENTICATION_ERROR"
        assert "Authentication failed" in str(error)

    def test_network_error(self) -> None:
        """Test network_error factory method."""
        error = OpenNotifyError.network_error()

        assert error.code == "NETWORK_ERROR"
        assert "Network error" in str(error)
        assert error.cause is None

    def test_network_error_with_cause(self) -> None:
        """Test network_error with underlying exception."""
        cause = ConnectionError("Connection refused")
        error = OpenNotifyError.network_error(cause)

        assert error.code == "NETWORK_ERROR"
        assert error.cause is cause
        assert "Connection refused" in str(error)

    def test_timeout_error(self) -> None:
        """Test timeout_error factory method."""
        error = OpenNotifyError.timeout_error(30.0)

        assert error.code == "TIMEOUT_ERROR"
        assert "30" in str(error)
        assert "timed out" in str(error)

    def test_repr(self) -> None:
        """Test string representation."""
        error = OpenNotifyError(
            message="Test error",
            code="VALIDATION_ERROR",
            status_code=400,
            api_message="Invalid field",
        )

        repr_str = repr(error)
        assert "OpenNotifyError" in repr_str
        assert "VALIDATION_ERROR" in repr_str
        assert "400" in repr_str
        assert "Invalid field" in repr_str
