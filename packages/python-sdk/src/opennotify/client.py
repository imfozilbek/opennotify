"""OpenNotify client for Python.

This module provides the main client classes for interacting with the OpenNotify API.
"""

from __future__ import annotations

from typing import Any

from .http import AsyncHttpClient, HttpClient
from .types import (
    Channel,
    Notification,
    NotificationList,
    NotificationStatusResponse,
    SendNotificationOptions,
    SendNotificationResult,
)

# Default configuration
DEFAULT_BASE_URL = "https://api.opennotify.dev/api/v1"
DEFAULT_TIMEOUT = 30.0


def _build_recipient(channel: Channel, recipient: str) -> dict[str, str]:
    """Build recipient object based on channel type.

    Args:
        channel: Notification channel (sms, telegram, email, push, whatsapp).
        recipient: Recipient identifier (phone, email, chat ID, or device token).

    Returns:
        Dictionary with the appropriate recipient field.
    """
    if channel in ("sms", "whatsapp"):
        return {"phone": recipient}
    if channel == "email":
        return {"email": recipient}
    if channel == "telegram":
        return {"telegramChatId": recipient}
    if channel == "push":
        return {"deviceToken": recipient}
    # Default fallback
    return {"phone": recipient}


def _normalize_notification(data: dict[str, Any]) -> Notification:
    """Normalize notification response from API.

    Args:
        data: Raw notification data from API.

    Returns:
        Normalized Notification object with snake_case keys.
    """
    payload: dict[str, Any] = {"text": data.get("payload", {}).get("text", "")}
    if data.get("payload", {}).get("subject"):
        payload["subject"] = data["payload"]["subject"]

    result: dict[str, Any] = {
        "id": data["id"],
        "status": data["status"].lower(),
        "channel": data["channel"].lower(),
        "provider": data["provider"].lower(),
        "recipient": data.get("recipient", ""),
        "payload": payload,
        "created_at": data.get("createdAt", ""),
    }

    if data.get("sentAt"):
        result["sent_at"] = data["sentAt"]
    if data.get("deliveredAt"):
        result["delivered_at"] = data["deliveredAt"]

    return result  # type: ignore[return-value]


class OpenNotify:
    """Synchronous OpenNotify client.

    This client provides methods to send notifications and manage notification
    delivery through the OpenNotify API.

    Example:
        ```python
        from opennotify import OpenNotify

        # Create client
        client = OpenNotify(api_key="sk_your_api_key")

        # Send notification
        result = client.send({
            "channel": "sms",
            "provider": "eskiz",
            "recipient": "+998901234567",
            "message": "Hello from OpenNotify!"
        })

        print(f"Notification ID: {result['notification_id']}")

        # Check delivery status
        status = client.get_status(result["notification_id"])
        print(f"Status: {status['status']}")

        # Clean up
        client.close()
        ```

    Using context manager:
        ```python
        with OpenNotify(api_key="sk_your_api_key") as client:
            result = client.send({...})
        ```
    """

    def __init__(
        self,
        api_key: str,
        *,
        base_url: str = DEFAULT_BASE_URL,
        timeout: float = DEFAULT_TIMEOUT,
    ) -> None:
        """Initialize the OpenNotify client.

        Args:
            api_key: Your OpenNotify API key.
            base_url: Base URL for the API. Defaults to production API.
            timeout: Request timeout in seconds. Defaults to 30 seconds.

        Raises:
            ValueError: If api_key is empty.
        """
        if not api_key:
            raise ValueError("api_key is required")

        self._http = HttpClient(base_url, api_key, timeout)

    def send(self, options: SendNotificationOptions) -> SendNotificationResult:
        """Send a notification.

        Args:
            options: Notification options including channel, provider, recipient, and message.

        Returns:
            Result containing the notification_id.

        Raises:
            OpenNotifyError: If the request fails.

        Example:
            ```python
            result = client.send({
                "channel": "telegram",
                "provider": "telegram_bot",
                "recipient": "123456789",
                "message": "Hello!"
            })
            ```
        """
        channel = options["channel"]
        recipient = _build_recipient(channel, options["recipient"])

        payload: dict[str, Any] = {"text": options["message"]}
        if "subject" in options:
            payload["subject"] = options["subject"]
        if "metadata" in options:
            payload["metadata"] = options["metadata"]

        data = self._http.post(
            "/notifications/send",
            json={
                "provider": options["provider"].upper(),
                "recipient": recipient,
                "payload": payload,
            },
        )

        return {"notification_id": data["notificationId"]}

    def get_notification(self, notification_id: str) -> Notification:
        """Get notification details by ID.

        Args:
            notification_id: The notification ID to retrieve.

        Returns:
            Notification object with full details.

        Raises:
            OpenNotifyError: If the notification is not found or request fails.

        Example:
            ```python
            notification = client.get_notification("notif_abc123")
            print(f"Status: {notification['status']}")
            ```
        """
        data = self._http.get(f"/notifications/{notification_id}")
        return _normalize_notification(data)

    def get_status(self, notification_id: str) -> NotificationStatusResponse:
        """Get the delivery status of a notification.

        Args:
            notification_id: The notification ID to check.

        Returns:
            Status response containing the current status.

        Raises:
            OpenNotifyError: If the notification is not found or request fails.

        Example:
            ```python
            status = client.get_status("notif_abc123")
            if status["status"] == "delivered":
                print("Message delivered!")
            ```
        """
        data = self._http.get(f"/notifications/{notification_id}/status")
        return {"status": data["status"].lower()}

    def list_notifications(
        self,
        *,
        page: int = 1,
        limit: int = 20,
    ) -> NotificationList:
        """List notifications with pagination.

        Args:
            page: Page number (1-indexed). Defaults to 1.
            limit: Number of items per page. Defaults to 20.

        Returns:
            Paginated list of notifications.

        Raises:
            OpenNotifyError: If the request fails.

        Example:
            ```python
            result = client.list_notifications(page=1, limit=10)
            for notif in result["notifications"]:
                print(f"{notif['id']}: {notif['status']}")
            ```
        """
        data = self._http.get(
            "/notifications",
            params={"page": page, "limit": limit},
        )

        return {
            "notifications": [_normalize_notification(n) for n in data.get("notifications", [])],
            "total": data.get("total", 0),
            "page": data.get("page", page),
            "limit": data.get("limit", limit),
        }

    def close(self) -> None:
        """Close the client and release resources.

        Always call this method when done with the client, or use a context manager.
        """
        self._http.close()

    def __enter__(self) -> OpenNotify:
        """Enter context manager."""
        return self

    def __exit__(self, *args: object) -> None:
        """Exit context manager."""
        self.close()


class AsyncOpenNotify:
    """Asynchronous OpenNotify client.

    This client provides async/await support for all notification operations.

    Example:
        ```python
        import asyncio
        from opennotify import AsyncOpenNotify

        async def main():
            async with AsyncOpenNotify(api_key="sk_your_api_key") as client:
                result = await client.send({
                    "channel": "sms",
                    "provider": "eskiz",
                    "recipient": "+998901234567",
                    "message": "Hello from async OpenNotify!"
                })
                print(f"Notification ID: {result['notification_id']}")

        asyncio.run(main())
        ```
    """

    def __init__(
        self,
        api_key: str,
        *,
        base_url: str = DEFAULT_BASE_URL,
        timeout: float = DEFAULT_TIMEOUT,
    ) -> None:
        """Initialize the async OpenNotify client.

        Args:
            api_key: Your OpenNotify API key.
            base_url: Base URL for the API. Defaults to production API.
            timeout: Request timeout in seconds. Defaults to 30 seconds.

        Raises:
            ValueError: If api_key is empty.
        """
        if not api_key:
            raise ValueError("api_key is required")

        self._http = AsyncHttpClient(base_url, api_key, timeout)

    async def send(self, options: SendNotificationOptions) -> SendNotificationResult:
        """Send a notification.

        Args:
            options: Notification options including channel, provider, recipient, and message.

        Returns:
            Result containing the notification_id.

        Raises:
            OpenNotifyError: If the request fails.
        """
        channel = options["channel"]
        recipient = _build_recipient(channel, options["recipient"])

        payload: dict[str, Any] = {"text": options["message"]}
        if "subject" in options:
            payload["subject"] = options["subject"]
        if "metadata" in options:
            payload["metadata"] = options["metadata"]

        data = await self._http.post(
            "/notifications/send",
            json={
                "provider": options["provider"].upper(),
                "recipient": recipient,
                "payload": payload,
            },
        )

        return {"notification_id": data["notificationId"]}

    async def get_notification(self, notification_id: str) -> Notification:
        """Get notification details by ID.

        Args:
            notification_id: The notification ID to retrieve.

        Returns:
            Notification object with full details.

        Raises:
            OpenNotifyError: If the notification is not found or request fails.
        """
        data = await self._http.get(f"/notifications/{notification_id}")
        return _normalize_notification(data)

    async def get_status(self, notification_id: str) -> NotificationStatusResponse:
        """Get the delivery status of a notification.

        Args:
            notification_id: The notification ID to check.

        Returns:
            Status response containing the current status.

        Raises:
            OpenNotifyError: If the notification is not found or request fails.
        """
        data = await self._http.get(f"/notifications/{notification_id}/status")
        return {"status": data["status"].lower()}

    async def list_notifications(
        self,
        *,
        page: int = 1,
        limit: int = 20,
    ) -> NotificationList:
        """List notifications with pagination.

        Args:
            page: Page number (1-indexed). Defaults to 1.
            limit: Number of items per page. Defaults to 20.

        Returns:
            Paginated list of notifications.

        Raises:
            OpenNotifyError: If the request fails.
        """
        data = await self._http.get(
            "/notifications",
            params={"page": page, "limit": limit},
        )

        return {
            "notifications": [_normalize_notification(n) for n in data.get("notifications", [])],
            "total": data.get("total", 0),
            "page": data.get("page", page),
            "limit": data.get("limit", limit),
        }

    async def close(self) -> None:
        """Close the client and release resources.

        Always call this method when done with the client, or use an async context manager.
        """
        await self._http.close()

    async def __aenter__(self) -> AsyncOpenNotify:
        """Enter async context manager."""
        return self

    async def __aexit__(self, *args: object) -> None:
        """Exit async context manager."""
        await self.close()
