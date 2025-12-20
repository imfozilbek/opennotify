# OpenNotify Python SDK

Python SDK for [OpenNotify](https://opennotify.dev) — Unified Notification API for Central Asia.

Send SMS, Telegram, Email, Push, and WhatsApp notifications through a single API.

## Installation

```bash
pip install opennotify
```

## Quick Start

### Synchronous Usage

```python
from opennotify import OpenNotify

# Create client
client = OpenNotify(api_key="sk_your_api_key")

# Send SMS
result = client.send({
    "channel": "sms",
    "provider": "eskiz",
    "recipient": "+998901234567",
    "message": "Your verification code: 123456"
})

print(f"Notification ID: {result['notification_id']}")

# Check delivery status
status = client.get_status(result["notification_id"])
print(f"Status: {status['status']}")

# Don't forget to close the client
client.close()
```

### Using Context Manager

```python
from opennotify import OpenNotify

with OpenNotify(api_key="sk_your_api_key") as client:
    result = client.send({
        "channel": "telegram",
        "provider": "telegram_bot",
        "recipient": "123456789",  # Telegram chat ID
        "message": "Hello from OpenNotify!"
    })
```

### Async Usage

```python
import asyncio
from opennotify import AsyncOpenNotify

async def main():
    async with AsyncOpenNotify(api_key="sk_your_api_key") as client:
        result = await client.send({
            "channel": "email",
            "provider": "sendgrid",
            "recipient": "user@example.com",
            "message": "Welcome to our service!",
            "subject": "Welcome!"
        })
        print(f"Notification ID: {result['notification_id']}")

asyncio.run(main())
```

## Channels & Providers

| Channel | Providers | Recipient Format |
|---------|-----------|------------------|
| SMS | `eskiz`, `playmobile`, `getsms` | Phone number: `+998901234567` |
| Telegram | `telegram_bot` | Chat ID: `123456789` |
| Email | `smtp`, `sendgrid`, `mailgun` | Email: `user@example.com` |
| Push | `fcm`, `apns` | Device token |
| WhatsApp | `whatsapp_business` | Phone number: `+998901234567` |

## API Reference

### OpenNotify / AsyncOpenNotify

#### Constructor

```python
OpenNotify(
    api_key: str,
    *,
    base_url: str = "https://api.opennotify.dev/api/v1",
    timeout: float = 30.0
)
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `api_key` | `str` | Required | Your OpenNotify API key |
| `base_url` | `str` | Production URL | API base URL |
| `timeout` | `float` | `30.0` | Request timeout in seconds |

#### Methods

##### `send(options) -> SendNotificationResult`

Send a notification to any channel.

```python
result = client.send({
    "channel": "sms",           # Required: sms, telegram, email, push, whatsapp
    "provider": "eskiz",        # Required: provider for the channel
    "recipient": "+998901234567", # Required: recipient identifier
    "message": "Hello!",        # Required: message text
    "subject": "...",           # Optional: email subject
    "metadata": {...}           # Optional: custom metadata
})
# Returns: {"notification_id": "notif_abc123"}
```

##### `get_notification(id) -> Notification`

Get full notification details.

```python
notification = client.get_notification("notif_abc123")
# Returns:
# {
#     "id": "notif_abc123",
#     "status": "delivered",
#     "channel": "sms",
#     "provider": "eskiz",
#     "recipient": "+998901234567",
#     "payload": {"text": "Hello!", "subject": None},
#     "created_at": "2024-01-15T10:30:00Z",
#     "sent_at": "2024-01-15T10:30:01Z",
#     "delivered_at": "2024-01-15T10:30:05Z"
# }
```

##### `get_status(id) -> NotificationStatusResponse`

Get delivery status only.

```python
status = client.get_status("notif_abc123")
# Returns: {"status": "delivered"}

# Possible statuses: pending, sent, delivered, failed
```

##### `list_notifications(page, limit) -> NotificationList`

List notifications with pagination.

```python
result = client.list_notifications(page=1, limit=20)
# Returns:
# {
#     "notifications": [...],
#     "total": 150,
#     "page": 1,
#     "limit": 20
# }
```

##### `close()`

Close the client and release resources. Always call this when done, or use a context manager.

## Error Handling

```python
from opennotify import OpenNotify, OpenNotifyError

client = OpenNotify(api_key="sk_your_api_key")

try:
    result = client.send({...})
except OpenNotifyError as e:
    print(f"Error code: {e.code}")
    print(f"Status code: {e.status_code}")
    print(f"Message: {e.api_message}")

    # Check if error is retryable
    if e.is_retryable():
        print("This error is transient, you can retry")

    # Handle specific errors
    if e.code == "AUTHENTICATION_ERROR":
        print("Invalid API key")
    elif e.code == "RATE_LIMIT":
        print("Rate limited, slow down")
    elif e.code == "VALIDATION_ERROR":
        print("Invalid request parameters")
finally:
    client.close()
```

### Error Codes

| Code | Description | Retryable |
|------|-------------|-----------|
| `AUTHENTICATION_ERROR` | Invalid or expired API key | No |
| `VALIDATION_ERROR` | Invalid request parameters | No |
| `NOT_FOUND` | Resource not found | No |
| `RATE_LIMIT` | Too many requests | Yes |
| `NETWORK_ERROR` | Network connectivity issue | Yes |
| `TIMEOUT_ERROR` | Request timed out | Yes |
| `SERVER_ERROR` | Server error (5xx) | Yes |
| `UNKNOWN_ERROR` | Unexpected error | No |

## Type Hints

The SDK is fully typed. Your IDE will provide autocomplete and type checking:

```python
from opennotify import (
    OpenNotify,
    SendNotificationOptions,
    Notification,
    Channel,
    Provider,
)

options: SendNotificationOptions = {
    "channel": "sms",  # IDE autocomplete: sms, telegram, email, push, whatsapp
    "provider": "eskiz",  # IDE autocomplete: eskiz, playmobile, etc.
    "recipient": "+998901234567",
    "message": "Hello!"
}

notification: Notification = client.get_notification("id")
```

## Requirements

- Python 3.9+
- httpx >= 0.27.0

## License

MIT

## Links

- [Documentation](https://docs.opennotify.dev/sdks/python)
- [API Reference](https://docs.opennotify.dev/api)
- [GitHub](https://github.com/opennotify/opennotify)
- [OpenNotify Website](https://opennotify.dev)
