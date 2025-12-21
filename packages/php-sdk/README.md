# OpenNotify PHP SDK

PHP SDK for [OpenNotify](https://opennotify.dev) — Unified Notification API for Central Asia.

Send SMS, Telegram, Email, Push, and WhatsApp notifications through a single API.

## Requirements

- PHP 8.0 or higher
- Guzzle 7.0 or higher

## Installation

```bash
composer require opennotify/opennotify-php
```

## Quick Start

```php
<?php

use OpenNotify\OpenNotify;
use OpenNotify\OpenNotifyException;

// Create client
$client = new OpenNotify('sk_your_api_key');

// Send SMS
$result = $client->send([
    'channel' => 'sms',
    'provider' => 'eskiz',
    'recipient' => '+998901234567',
    'message' => 'Your verification code: 123456',
]);

echo "Notification ID: " . $result['notification_id'];

// Check delivery status
$status = $client->getStatus($result['notification_id']);
echo "Status: " . $status['status'];
```

## Channels & Providers

| Channel | Providers | Recipient Format |
|---------|-----------|------------------|
| SMS | `eskiz`, `playmobile`, `getsms` | Phone: `+998901234567` |
| Telegram | `telegram_bot` | Chat ID: `123456789` |
| Email | `smtp`, `sendgrid`, `mailgun` | Email: `user@example.com` |
| Push | `fcm`, `apns` | Device token |
| WhatsApp | `whatsapp_business` | Phone: `+998901234567` |

## API Reference

### Constructor

```php
$client = new OpenNotify(
    apiKey: 'sk_your_api_key',
    baseUrl: 'https://api.opennotify.dev/api/v1', // optional
    timeout: 30.0 // optional, in seconds
);
```

### Methods

#### `send(array $options): array`

Send a notification to any channel.

```php
$result = $client->send([
    'channel' => 'sms',           // Required: sms, telegram, email, push, whatsapp
    'provider' => 'eskiz',        // Required: provider for the channel
    'recipient' => '+998901234567', // Required: recipient identifier
    'message' => 'Hello!',        // Required: message text
    'subject' => 'Optional',      // Optional: email subject
    'metadata' => [...],          // Optional: custom metadata
]);
// Returns: ['notification_id' => 'notif_abc123']
```

#### `getNotification(string $id): array`

Get full notification details.

```php
$notification = $client->getNotification('notif_abc123');
// Returns:
// [
//     'id' => 'notif_abc123',
//     'status' => 'delivered',
//     'channel' => 'sms',
//     'provider' => 'eskiz',
//     'recipient' => '+998901234567',
//     'payload' => ['text' => 'Hello!', 'subject' => null],
//     'created_at' => '2024-01-15T10:30:00Z',
//     'sent_at' => '2024-01-15T10:30:01Z',
//     'delivered_at' => '2024-01-15T10:30:05Z',
// ]
```

#### `getStatus(string $id): array`

Get delivery status only.

```php
$status = $client->getStatus('notif_abc123');
// Returns: ['status' => 'delivered']

// Possible statuses: pending, sent, delivered, failed
```

#### `listNotifications(int $page = 1, int $limit = 20): array`

List notifications with pagination.

```php
$result = $client->listNotifications(page: 1, limit: 20);
// Returns:
// [
//     'notifications' => [...],
//     'total' => 150,
//     'page' => 1,
//     'limit' => 20,
// ]
```

## Error Handling

```php
use OpenNotify\OpenNotify;
use OpenNotify\OpenNotifyException;

$client = new OpenNotify('sk_your_api_key');

try {
    $result = $client->send([...]);
} catch (OpenNotifyException $e) {
    echo "Error code: " . $e->errorCode . "\n";
    echo "Status code: " . $e->statusCode . "\n";
    echo "Message: " . $e->apiMessage . "\n";

    // Check if error is retryable
    if ($e->isRetryable()) {
        echo "This error is transient, you can retry\n";
    }

    // Handle specific errors
    if ($e->errorCode === 'AUTHENTICATION_ERROR') {
        echo "Invalid API key\n";
    } elseif ($e->errorCode === 'RATE_LIMIT') {
        echo "Rate limited, slow down\n";
        sleep(60);
    }
}
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

## Type Enums (PHP 8.1+)

```php
use OpenNotify\Types\Channel;
use OpenNotify\Types\Provider;
use OpenNotify\Types\NotificationStatus;

// Use enums for type safety
$channel = Channel::SMS;
$provider = Provider::ESKIZ;
$status = NotificationStatus::DELIVERED;

// Get recipient field for channel
$field = Channel::EMAIL->getRecipientField(); // 'email'

// Check if status is final
$isFinal = NotificationStatus::DELIVERED->isFinal(); // true
```

## License

MIT

## Links

- [Documentation](https://docs.opennotify.dev/sdks/php)
- [API Reference](https://docs.opennotify.dev/api)
- [GitHub](https://github.com/opennotify/opennotify)
- [OpenNotify Website](https://opennotify.dev)
