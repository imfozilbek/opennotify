"""Tests for OpenNotify client."""

import pytest
from pytest_httpx import HTTPXMock

from opennotify import AsyncOpenNotify, OpenNotify, OpenNotifyError


class TestOpenNotifyInit:
    """Tests for OpenNotify initialization."""

    def test_init_with_api_key(self) -> None:
        """Test client initialization with API key."""
        client = OpenNotify(api_key="sk_test_key")
        assert client is not None
        client.close()

    def test_init_without_api_key_raises(self) -> None:
        """Test client initialization without API key raises error."""
        with pytest.raises(ValueError, match="api_key is required"):
            OpenNotify(api_key="")

    def test_init_with_custom_base_url(self) -> None:
        """Test client initialization with custom base URL."""
        client = OpenNotify(
            api_key="sk_test_key",
            base_url="https://custom.api.com/v1",
        )
        assert client is not None
        client.close()

    def test_init_with_custom_timeout(self) -> None:
        """Test client initialization with custom timeout."""
        client = OpenNotify(
            api_key="sk_test_key",
            timeout=60.0,
        )
        assert client is not None
        client.close()

    def test_context_manager(self) -> None:
        """Test client works as context manager."""
        with OpenNotify(api_key="sk_test_key") as client:
            assert client is not None


class TestOpenNotifySend:
    """Tests for OpenNotify.send method."""

    def test_send_sms(self, httpx_mock: HTTPXMock) -> None:
        """Test sending SMS notification."""
        httpx_mock.add_response(
            method="POST",
            url="https://api.opennotify.dev/api/v1/notifications/send",
            json={"success": True, "data": {"notificationId": "notif_123"}},
        )

        with OpenNotify(api_key="sk_test_key") as client:
            result = client.send(
                {
                    "channel": "sms",
                    "provider": "eskiz",
                    "recipient": "+998901234567",
                    "message": "Hello!",
                }
            )

        assert result["notification_id"] == "notif_123"

    def test_send_telegram(self, httpx_mock: HTTPXMock) -> None:
        """Test sending Telegram notification."""
        httpx_mock.add_response(
            method="POST",
            url="https://api.opennotify.dev/api/v1/notifications/send",
            json={"success": True, "data": {"notificationId": "notif_456"}},
        )

        with OpenNotify(api_key="sk_test_key") as client:
            result = client.send(
                {
                    "channel": "telegram",
                    "provider": "telegram_bot",
                    "recipient": "123456789",
                    "message": "Hello from Telegram!",
                }
            )

        assert result["notification_id"] == "notif_456"

    def test_send_email_with_subject(self, httpx_mock: HTTPXMock) -> None:
        """Test sending email with subject."""
        httpx_mock.add_response(
            method="POST",
            url="https://api.opennotify.dev/api/v1/notifications/send",
            json={"success": True, "data": {"notificationId": "notif_789"}},
        )

        with OpenNotify(api_key="sk_test_key") as client:
            result = client.send(
                {
                    "channel": "email",
                    "provider": "sendgrid",
                    "recipient": "user@example.com",
                    "message": "Welcome!",
                    "subject": "Welcome to our service",
                }
            )

        assert result["notification_id"] == "notif_789"

        # Verify request body
        request = httpx_mock.get_request()
        assert request is not None
        import json

        body = json.loads(request.content)
        assert body["recipient"]["email"] == "user@example.com"
        assert body["payload"]["subject"] == "Welcome to our service"

    def test_send_with_metadata(self, httpx_mock: HTTPXMock) -> None:
        """Test sending notification with metadata."""
        httpx_mock.add_response(
            method="POST",
            url="https://api.opennotify.dev/api/v1/notifications/send",
            json={"success": True, "data": {"notificationId": "notif_abc"}},
        )

        with OpenNotify(api_key="sk_test_key") as client:
            result = client.send(
                {
                    "channel": "sms",
                    "provider": "eskiz",
                    "recipient": "+998901234567",
                    "message": "Hello!",
                    "metadata": {"order_id": "12345"},
                }
            )

        assert result["notification_id"] == "notif_abc"

    def test_send_authentication_error(self, httpx_mock: HTTPXMock) -> None:
        """Test handling authentication error."""
        httpx_mock.add_response(
            method="POST",
            url="https://api.opennotify.dev/api/v1/notifications/send",
            status_code=401,
            json={"success": False, "error": {"message": "Invalid API key"}},
        )

        with OpenNotify(api_key="sk_invalid") as client, pytest.raises(OpenNotifyError) as exc_info:
            client.send(
                {
                    "channel": "sms",
                    "provider": "eskiz",
                    "recipient": "+998901234567",
                    "message": "Hello!",
                }
            )

        assert exc_info.value.code == "AUTHENTICATION_ERROR"
        assert exc_info.value.status_code == 401

    def test_send_validation_error(self, httpx_mock: HTTPXMock) -> None:
        """Test handling validation error."""
        httpx_mock.add_response(
            method="POST",
            url="https://api.opennotify.dev/api/v1/notifications/send",
            status_code=400,
            json={"success": False, "error": {"message": "Invalid phone number"}},
        )

        with OpenNotify(api_key="sk_test") as client, pytest.raises(OpenNotifyError) as exc_info:
            client.send(
                {
                    "channel": "sms",
                    "provider": "eskiz",
                    "recipient": "invalid",
                    "message": "Hello!",
                }
            )

        assert exc_info.value.code == "VALIDATION_ERROR"


class TestOpenNotifyGetNotification:
    """Tests for OpenNotify.get_notification method."""

    def test_get_notification(self, httpx_mock: HTTPXMock) -> None:
        """Test getting notification details."""
        httpx_mock.add_response(
            method="GET",
            url="https://api.opennotify.dev/api/v1/notifications/notif_123",
            json={
                "success": True,
                "data": {
                    "id": "notif_123",
                    "status": "DELIVERED",
                    "channel": "SMS",
                    "provider": "ESKIZ",
                    "recipient": "+998901234567",
                    "payload": {"text": "Hello!"},
                    "createdAt": "2024-01-15T10:00:00Z",
                    "sentAt": "2024-01-15T10:00:01Z",
                    "deliveredAt": "2024-01-15T10:00:05Z",
                },
            },
        )

        with OpenNotify(api_key="sk_test") as client:
            notification = client.get_notification("notif_123")

        assert notification["id"] == "notif_123"
        assert notification["status"] == "delivered"  # Lowercase
        assert notification["channel"] == "sms"  # Lowercase
        assert notification["provider"] == "eskiz"  # Lowercase
        assert notification["created_at"] == "2024-01-15T10:00:00Z"

    def test_get_notification_not_found(self, httpx_mock: HTTPXMock) -> None:
        """Test getting non-existent notification."""
        httpx_mock.add_response(
            method="GET",
            url="https://api.opennotify.dev/api/v1/notifications/notif_invalid",
            status_code=404,
            json={"success": False, "error": {"message": "Notification not found"}},
        )

        with OpenNotify(api_key="sk_test") as client, pytest.raises(OpenNotifyError) as exc_info:
            client.get_notification("notif_invalid")

        assert exc_info.value.code == "NOT_FOUND"


class TestOpenNotifyGetStatus:
    """Tests for OpenNotify.get_status method."""

    def test_get_status(self, httpx_mock: HTTPXMock) -> None:
        """Test getting notification status."""
        httpx_mock.add_response(
            method="GET",
            url="https://api.opennotify.dev/api/v1/notifications/notif_123/status",
            json={"success": True, "data": {"status": "DELIVERED"}},
        )

        with OpenNotify(api_key="sk_test") as client:
            status = client.get_status("notif_123")

        assert status["status"] == "delivered"  # Lowercase


class TestOpenNotifyListNotifications:
    """Tests for OpenNotify.list_notifications method."""

    def test_list_notifications(self, httpx_mock: HTTPXMock) -> None:
        """Test listing notifications."""
        httpx_mock.add_response(
            method="GET",
            url="https://api.opennotify.dev/api/v1/notifications?page=1&limit=20",
            json={
                "success": True,
                "data": {
                    "notifications": [
                        {
                            "id": "notif_1",
                            "status": "DELIVERED",
                            "channel": "SMS",
                            "provider": "ESKIZ",
                            "payload": {"text": "Hello 1"},
                            "createdAt": "2024-01-15T10:00:00Z",
                        },
                        {
                            "id": "notif_2",
                            "status": "PENDING",
                            "channel": "TELEGRAM",
                            "provider": "TELEGRAM_BOT",
                            "payload": {"text": "Hello 2"},
                            "createdAt": "2024-01-15T11:00:00Z",
                        },
                    ],
                    "total": 50,
                    "page": 1,
                    "limit": 20,
                },
            },
        )

        with OpenNotify(api_key="sk_test") as client:
            result = client.list_notifications()

        assert len(result["notifications"]) == 2
        assert result["total"] == 50
        assert result["page"] == 1
        assert result["limit"] == 20
        assert result["notifications"][0]["status"] == "delivered"
        assert result["notifications"][1]["channel"] == "telegram"

    def test_list_notifications_with_pagination(self, httpx_mock: HTTPXMock) -> None:
        """Test listing notifications with custom pagination."""
        httpx_mock.add_response(
            method="GET",
            url="https://api.opennotify.dev/api/v1/notifications?page=2&limit=10",
            json={
                "success": True,
                "data": {
                    "notifications": [],
                    "total": 50,
                    "page": 2,
                    "limit": 10,
                },
            },
        )

        with OpenNotify(api_key="sk_test") as client:
            result = client.list_notifications(page=2, limit=10)

        assert result["page"] == 2
        assert result["limit"] == 10


class TestAsyncOpenNotify:
    """Tests for AsyncOpenNotify client."""

    @pytest.mark.asyncio
    async def test_async_send(self, httpx_mock: HTTPXMock) -> None:
        """Test async sending notification."""
        httpx_mock.add_response(
            method="POST",
            url="https://api.opennotify.dev/api/v1/notifications/send",
            json={"success": True, "data": {"notificationId": "notif_async"}},
        )

        async with AsyncOpenNotify(api_key="sk_test") as client:
            result = await client.send(
                {
                    "channel": "sms",
                    "provider": "eskiz",
                    "recipient": "+998901234567",
                    "message": "Async hello!",
                }
            )

        assert result["notification_id"] == "notif_async"

    @pytest.mark.asyncio
    async def test_async_get_status(self, httpx_mock: HTTPXMock) -> None:
        """Test async getting status."""
        httpx_mock.add_response(
            method="GET",
            url="https://api.opennotify.dev/api/v1/notifications/notif_123/status",
            json={"success": True, "data": {"status": "SENT"}},
        )

        async with AsyncOpenNotify(api_key="sk_test") as client:
            status = await client.get_status("notif_123")

        assert status["status"] == "sent"

    @pytest.mark.asyncio
    async def test_async_context_manager(self) -> None:
        """Test async client works as context manager."""
        async with AsyncOpenNotify(api_key="sk_test") as client:
            assert client is not None
