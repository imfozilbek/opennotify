"""OpenNotify Python SDK.

Unified Notification API for Central Asia. Send SMS, Telegram, Email,
Push, and WhatsApp notifications through a single API.

Example:
    ```python
    from opennotify import OpenNotify

    client = OpenNotify(api_key="sk_your_api_key")

    result = client.send({
        "channel": "sms",
        "provider": "eskiz",
        "recipient": "+998901234567",
        "message": "Hello from OpenNotify!"
    })

    print(f"Notification ID: {result['notification_id']}")
    client.close()
    ```

Async example:
    ```python
    from opennotify import AsyncOpenNotify

    async with AsyncOpenNotify(api_key="sk_your_api_key") as client:
        result = await client.send({
            "channel": "telegram",
            "provider": "telegram_bot",
            "recipient": "123456789",
            "message": "Hello from async OpenNotify!"
        })
    ```
"""

from __future__ import annotations

from .client import AsyncOpenNotify, OpenNotify
from .errors import OpenNotifyError, OpenNotifyErrorCode
from .types import (
    Channel,
    Notification,
    NotificationList,
    NotificationPayload,
    NotificationStatus,
    NotificationStatusResponse,
    OpenNotifyOptions,
    PaginationOptions,
    Provider,
    SendNotificationOptions,
    SendNotificationResult,
)

__version__ = "0.1.0"

__all__ = [
    # Version
    "__version__",
    # Clients
    "OpenNotify",
    "AsyncOpenNotify",
    # Errors
    "OpenNotifyError",
    "OpenNotifyErrorCode",
    # Types - Enums
    "Channel",
    "Provider",
    "NotificationStatus",
    # Types - Options
    "OpenNotifyOptions",
    "PaginationOptions",
    "SendNotificationOptions",
    # Types - Results
    "SendNotificationResult",
    "Notification",
    "NotificationPayload",
    "NotificationList",
    "NotificationStatusResponse",
]
