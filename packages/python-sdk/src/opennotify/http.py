"""HTTP client for OpenNotify Python SDK."""

from __future__ import annotations

from typing import Any

import httpx

from .errors import OpenNotifyError


class HttpClient:
    """Synchronous HTTP client for OpenNotify API.

    This client handles all HTTP communication with the OpenNotify API,
    including authentication, error handling, and response parsing.
    """

    def __init__(
        self,
        base_url: str,
        api_key: str,
        timeout: float,
    ) -> None:
        """Initialize the HTTP client.

        Args:
            base_url: Base URL for the API (without trailing slash).
            api_key: API key for authentication.
            timeout: Request timeout in seconds.
        """
        # Remove trailing slash
        self._base_url = base_url.rstrip("/")
        self._timeout = timeout

        self._client = httpx.Client(
            base_url=self._base_url,
            headers={
                "Content-Type": "application/json",
                "X-API-Key": api_key,
            },
            timeout=timeout,
        )

    def get(self, path: str, params: dict[str, Any] | None = None) -> Any:
        """Make a GET request.

        Args:
            path: API endpoint path.
            params: Query parameters.

        Returns:
            Parsed JSON response data.

        Raises:
            OpenNotifyError: If the request fails.
        """
        return self._request("GET", path, params=params)

    def post(self, path: str, json: dict[str, Any] | None = None) -> Any:
        """Make a POST request.

        Args:
            path: API endpoint path.
            json: Request body as JSON.

        Returns:
            Parsed JSON response data.

        Raises:
            OpenNotifyError: If the request fails.
        """
        return self._request("POST", path, json=json)

    def put(self, path: str, json: dict[str, Any] | None = None) -> Any:
        """Make a PUT request.

        Args:
            path: API endpoint path.
            json: Request body as JSON.

        Returns:
            Parsed JSON response data.

        Raises:
            OpenNotifyError: If the request fails.
        """
        return self._request("PUT", path, json=json)

    def delete(self, path: str) -> Any:
        """Make a DELETE request.

        Args:
            path: API endpoint path.

        Returns:
            Parsed JSON response data.

        Raises:
            OpenNotifyError: If the request fails.
        """
        return self._request("DELETE", path)

    def _request(
        self,
        method: str,
        path: str,
        params: dict[str, Any] | None = None,
        json: dict[str, Any] | None = None,
    ) -> Any:
        """Make an HTTP request.

        Args:
            method: HTTP method (GET, POST, PUT, DELETE).
            path: API endpoint path.
            params: Query parameters.
            json: Request body as JSON.

        Returns:
            Parsed JSON response data.

        Raises:
            OpenNotifyError: If the request fails.
        """
        try:
            response = self._client.request(
                method=method,
                url=path,
                params=params,
                json=json,
            )
        except httpx.TimeoutException as e:
            raise OpenNotifyError.timeout_error(self._timeout) from e
        except httpx.RequestError as e:
            raise OpenNotifyError.network_error(e) from e

        return self._handle_response(response)

    def _handle_response(self, response: httpx.Response) -> Any:
        """Handle API response.

        Args:
            response: HTTP response object.

        Returns:
            Parsed JSON response data.

        Raises:
            OpenNotifyError: If the response indicates an error.
        """
        try:
            data = response.json()
        except ValueError as e:
            if not response.is_success:
                raise OpenNotifyError.from_response(
                    response.status_code,
                    f"HTTP {response.status_code}",
                ) from e
            return None

        # Check HTTP status first
        if not response.is_success:
            error_message = data.get("error", {}).get("message") if isinstance(data, dict) else None
            raise OpenNotifyError.from_response(response.status_code, error_message)

        # Check API success flag
        if isinstance(data, dict):
            if data.get("success") is False:
                error_message = data.get("error", {}).get("message", "Unknown error")
                raise OpenNotifyError(
                    message=error_message,
                    code="UNKNOWN_ERROR",
                    status_code=response.status_code,
                    api_message=error_message,
                )
            # Return data field if present
            return data.get("data", data)

        return data

    def close(self) -> None:
        """Close the HTTP client and release resources."""
        self._client.close()

    def __enter__(self) -> HttpClient:
        """Enter context manager."""
        return self

    def __exit__(self, *args: object) -> None:
        """Exit context manager."""
        self.close()


class AsyncHttpClient:
    """Asynchronous HTTP client for OpenNotify API.

    This client provides async/await support for all HTTP operations.
    """

    def __init__(
        self,
        base_url: str,
        api_key: str,
        timeout: float,
    ) -> None:
        """Initialize the async HTTP client.

        Args:
            base_url: Base URL for the API (without trailing slash).
            api_key: API key for authentication.
            timeout: Request timeout in seconds.
        """
        # Remove trailing slash
        self._base_url = base_url.rstrip("/")
        self._timeout = timeout

        self._client = httpx.AsyncClient(
            base_url=self._base_url,
            headers={
                "Content-Type": "application/json",
                "X-API-Key": api_key,
            },
            timeout=timeout,
        )

    async def get(self, path: str, params: dict[str, Any] | None = None) -> Any:
        """Make a GET request.

        Args:
            path: API endpoint path.
            params: Query parameters.

        Returns:
            Parsed JSON response data.

        Raises:
            OpenNotifyError: If the request fails.
        """
        return await self._request("GET", path, params=params)

    async def post(self, path: str, json: dict[str, Any] | None = None) -> Any:
        """Make a POST request.

        Args:
            path: API endpoint path.
            json: Request body as JSON.

        Returns:
            Parsed JSON response data.

        Raises:
            OpenNotifyError: If the request fails.
        """
        return await self._request("POST", path, json=json)

    async def put(self, path: str, json: dict[str, Any] | None = None) -> Any:
        """Make a PUT request.

        Args:
            path: API endpoint path.
            json: Request body as JSON.

        Returns:
            Parsed JSON response data.

        Raises:
            OpenNotifyError: If the request fails.
        """
        return await self._request("PUT", path, json=json)

    async def delete(self, path: str) -> Any:
        """Make a DELETE request.

        Args:
            path: API endpoint path.

        Returns:
            Parsed JSON response data.

        Raises:
            OpenNotifyError: If the request fails.
        """
        return await self._request("DELETE", path)

    async def _request(
        self,
        method: str,
        path: str,
        params: dict[str, Any] | None = None,
        json: dict[str, Any] | None = None,
    ) -> Any:
        """Make an HTTP request.

        Args:
            method: HTTP method (GET, POST, PUT, DELETE).
            path: API endpoint path.
            params: Query parameters.
            json: Request body as JSON.

        Returns:
            Parsed JSON response data.

        Raises:
            OpenNotifyError: If the request fails.
        """
        try:
            response = await self._client.request(
                method=method,
                url=path,
                params=params,
                json=json,
            )
        except httpx.TimeoutException as e:
            raise OpenNotifyError.timeout_error(self._timeout) from e
        except httpx.RequestError as e:
            raise OpenNotifyError.network_error(e) from e

        return self._handle_response(response)

    def _handle_response(self, response: httpx.Response) -> Any:
        """Handle API response.

        Args:
            response: HTTP response object.

        Returns:
            Parsed JSON response data.

        Raises:
            OpenNotifyError: If the response indicates an error.
        """
        try:
            data = response.json()
        except ValueError as e:
            if not response.is_success:
                raise OpenNotifyError.from_response(
                    response.status_code,
                    f"HTTP {response.status_code}",
                ) from e
            return None

        # Check HTTP status first
        if not response.is_success:
            error_message = data.get("error", {}).get("message") if isinstance(data, dict) else None
            raise OpenNotifyError.from_response(response.status_code, error_message)

        # Check API success flag
        if isinstance(data, dict):
            if data.get("success") is False:
                error_message = data.get("error", {}).get("message", "Unknown error")
                raise OpenNotifyError(
                    message=error_message,
                    code="UNKNOWN_ERROR",
                    status_code=response.status_code,
                    api_message=error_message,
                )
            # Return data field if present
            return data.get("data", data)

        return data

    async def close(self) -> None:
        """Close the HTTP client and release resources."""
        await self._client.aclose()

    async def __aenter__(self) -> AsyncHttpClient:
        """Enter async context manager."""
        return self

    async def __aexit__(self, *args: object) -> None:
        """Exit async context manager."""
        await self.close()
