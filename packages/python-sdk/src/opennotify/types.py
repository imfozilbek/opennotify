"""Type definitions for OpenNotify Python SDK."""

from __future__ import annotations

from typing import Any, Literal

from typing_extensions import NotRequired, TypedDict

# Channel types
Channel = Literal["sms", "telegram", "email", "push", "whatsapp"]

# Provider types
Provider = Literal[
    "eskiz",
    "playmobile",
    "getsms",
    "telegram_bot",
    "smtp",
    "sendgrid",
    "mailgun",
    "fcm",
    "apns",
    "whatsapp_business",
]

# Notification status
NotificationStatus = Literal["pending", "sent", "delivered", "failed"]


class NotificationPayload(TypedDict):
    """Notification message payload."""

    text: str
    subject: NotRequired[str]


class SendNotificationOptions(TypedDict):
    """Options for sending a notification."""

    channel: Channel
    provider: Provider
    recipient: str
    message: str
    subject: NotRequired[str]
    metadata: NotRequired[dict[str, Any]]


class SendNotificationResult(TypedDict):
    """Result of sending a notification."""

    notification_id: str


class Notification(TypedDict):
    """Notification object."""

    id: str
    status: NotificationStatus
    channel: Channel
    provider: Provider
    recipient: str
    payload: NotificationPayload
    created_at: str
    sent_at: NotRequired[str]
    delivered_at: NotRequired[str]


class NotificationStatusResponse(TypedDict):
    """Response for notification status check."""

    status: NotificationStatus


class NotificationList(TypedDict):
    """Paginated list of notifications."""

    notifications: list[Notification]
    total: int
    page: int
    limit: int


class PaginationOptions(TypedDict, total=False):
    """Pagination options for list queries."""

    page: int
    limit: int


class OpenNotifyOptions(TypedDict, total=False):
    """Options for OpenNotify client initialization."""

    api_key: str
    base_url: str
    timeout: float
