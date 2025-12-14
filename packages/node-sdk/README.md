# @opennotify/node-sdk

Node.js SDK for [OpenNotify](https://opennotify.dev) - Unified notification API for SMS, Telegram, Email, Push, and WhatsApp.

## Installation

```bash
npm install @opennotify/node-sdk
# or
pnpm add @opennotify/node-sdk
# or
yarn add @opennotify/node-sdk
```

## Quick Start

```typescript
import { OpenNotify } from "@opennotify/node-sdk"

const client = new OpenNotify({
    apiKey: "your-api-key",
})

// Send SMS
const { notificationId } = await client.send({
    channel: "sms",
    provider: "eskiz",
    recipient: "+998901234567",
    message: "Your verification code is 1234",
})

// Check delivery status
const { status } = await client.getStatus(notificationId)
console.log(status) // "pending" | "sent" | "delivered" | "failed"
```

## Channels & Providers

| Channel | Providers |
|---------|-----------|
| SMS | `eskiz`, `playmobile`, `getsms` |
| Telegram | `telegram_bot` |
| Email | `smtp`, `sendgrid`, `mailgun` |
| Push | `fcm`, `apns` |
| WhatsApp | `whatsapp_business` |

## API Reference

### Constructor

```typescript
new OpenNotify(options: OpenNotifyOptions)
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `apiKey` | `string` | *required* | Your API key from dashboard |
| `baseUrl` | `string` | `https://api.opennotify.dev/api/v1` | API base URL |
| `timeout` | `number` | `30000` | Request timeout in ms |

### Methods

#### `send(options)`

Send a notification.

```typescript
const result = await client.send({
    channel: "sms",
    provider: "eskiz",
    recipient: "+998901234567",
    message: "Hello!",
    subject: "Optional subject for email",
    metadata: { orderId: "123" },
})

console.log(result.notificationId)
```

#### `getNotification(id)`

Get notification details.

```typescript
const notification = await client.getNotification("notif_123")

console.log(notification.status)    // "delivered"
console.log(notification.channel)   // "sms"
console.log(notification.sentAt)    // "2025-01-01T12:00:00Z"
```

#### `getStatus(id)`

Get delivery status only.

```typescript
const { status } = await client.getStatus("notif_123")
// status: "pending" | "sent" | "delivered" | "failed"
```

#### `listNotifications(options?)`

List notifications with pagination.

```typescript
const { notifications, total, page, limit } = await client.listNotifications({
    page: 1,
    limit: 20,
})
```

## Examples

### Send SMS via Eskiz

```typescript
await client.send({
    channel: "sms",
    provider: "eskiz",
    recipient: "+998901234567",
    message: "Your OTP code is 1234",
})
```

### Send Telegram Message

```typescript
await client.send({
    channel: "telegram",
    provider: "telegram_bot",
    recipient: "123456789", // Telegram chat ID
    message: "Hello from OpenNotify!",
})
```

### Send Email via SendGrid

```typescript
await client.send({
    channel: "email",
    provider: "sendgrid",
    recipient: "user@example.com",
    subject: "Welcome to Our Service",
    message: "Thank you for signing up!",
})
```

### Send Push Notification (FCM)

```typescript
await client.send({
    channel: "push",
    provider: "fcm",
    recipient: "device-token-here",
    message: "You have a new message",
})
```

## Error Handling

```typescript
import { OpenNotify, OpenNotifyError } from "@opennotify/node-sdk"

try {
    await client.send({ ... })
} catch (error) {
    if (error instanceof OpenNotifyError) {
        console.error("Code:", error.code)
        console.error("Message:", error.message)
        console.error("Status:", error.statusCode)

        // Check if error is retryable
        if (error.isRetryable()) {
            // Retry the request
        }
    }
}
```

### Error Codes

| Code | Description |
|------|-------------|
| `AUTHENTICATION_ERROR` | Invalid or missing API key |
| `VALIDATION_ERROR` | Invalid request parameters |
| `NOT_FOUND` | Resource not found |
| `RATE_LIMIT` | Too many requests |
| `NETWORK_ERROR` | Network connection failed |
| `TIMEOUT_ERROR` | Request timed out |
| `SERVER_ERROR` | Server-side error |

## TypeScript Support

Full TypeScript support with exported types:

```typescript
import type {
    Channel,
    Provider,
    NotificationStatus,
    Notification,
    SendNotificationOptions,
    OpenNotifyOptions,
} from "@opennotify/node-sdk"
```

## Requirements

- Node.js >= 18.0.0

## License

MIT
