# OpenNotify Go SDK

Official Go SDK for OpenNotify — unified notification API for SMS, Telegram, Email, Push, and WhatsApp.

## Installation

```bash
go get github.com/opennotify/opennotify-go
```

## Quick Start

```go
package main

import (
    "context"
    "fmt"
    "log"

    opennotify "github.com/opennotify/opennotify-go"
)

func main() {
    // Create client
    client, err := opennotify.New("sk_your_api_key")
    if err != nil {
        log.Fatal(err)
    }

    // Send SMS
    result, err := client.Send(context.Background(), opennotify.SendOptions{
        Channel:   opennotify.ChannelSMS,
        Provider:  opennotify.ProviderEskiz,
        Recipient: "+998901234567",
        Message:   "Hello from OpenNotify!",
    })
    if err != nil {
        log.Fatal(err)
    }

    fmt.Println("Notification ID:", result.NotificationID)
}
```

## Usage

### Creating a Client

```go
// Basic usage
client, err := opennotify.New("sk_your_api_key")

// With custom options
client, err := opennotify.New("sk_your_api_key", opennotify.Options{
    BaseURL: "https://api.opennotify.dev/api/v1",
    Timeout: 60 * time.Second,
})
```

### Sending Notifications

#### SMS

```go
result, err := client.Send(ctx, opennotify.SendOptions{
    Channel:   opennotify.ChannelSMS,
    Provider:  opennotify.ProviderEskiz,  // or ProviderPlayMobile, ProviderGetSMS
    Recipient: "+998901234567",
    Message:   "Your verification code is 1234",
})
```

#### Telegram

```go
result, err := client.Send(ctx, opennotify.SendOptions{
    Channel:   opennotify.ChannelTelegram,
    Provider:  opennotify.ProviderTelegramBot,
    Recipient: "123456789",  // Telegram chat ID
    Message:   "Hello from OpenNotify!",
})
```

#### Email

```go
result, err := client.Send(ctx, opennotify.SendOptions{
    Channel:   opennotify.ChannelEmail,
    Provider:  opennotify.ProviderSendGrid,  // or ProviderSMTP, ProviderMailgun
    Recipient: "user@example.com",
    Subject:   "Welcome!",
    Message:   "Thank you for signing up.",
})
```

#### Push Notification

```go
result, err := client.Send(ctx, opennotify.SendOptions{
    Channel:   opennotify.ChannelPush,
    Provider:  opennotify.ProviderFCM,  // or ProviderAPNs
    Recipient: "device_token_here",
    Message:   "You have a new message",
})
```

#### WhatsApp

```go
result, err := client.Send(ctx, opennotify.SendOptions{
    Channel:   opennotify.ChannelWhatsApp,
    Provider:  opennotify.ProviderWhatsAppBusiness,
    Recipient: "+998901234567",
    Message:   "Hello from OpenNotify!",
})
```

### Getting Notification Status

```go
// Get full notification details
notification, err := client.GetNotification(ctx, "notif_123")
if err != nil {
    log.Fatal(err)
}
fmt.Println("Status:", notification.Status)
fmt.Println("Channel:", notification.Channel)

// Get just the status
status, err := client.GetStatus(ctx, "notif_123")
if err != nil {
    log.Fatal(err)
}

switch status.Status {
case opennotify.StatusDelivered:
    fmt.Println("Message delivered!")
case opennotify.StatusFailed:
    fmt.Println("Delivery failed")
case opennotify.StatusPending:
    fmt.Println("Still pending...")
}
```

### Listing Notifications

```go
// Get first page
list, err := client.ListNotifications(ctx, nil)
if err != nil {
    log.Fatal(err)
}

fmt.Printf("Total: %d notifications\n", list.Total)
for _, n := range list.Notifications {
    fmt.Printf("  %s: %s (%s)\n", n.ID, n.Status, n.Channel)
}

// Get specific page with custom limit
list, err = client.ListNotifications(ctx, &opennotify.ListOptions{
    Page:  2,
    Limit: 50,
})
```

### Error Handling

```go
result, err := client.Send(ctx, opennotify.SendOptions{
    Channel:   opennotify.ChannelSMS,
    Provider:  opennotify.ProviderEskiz,
    Recipient: "+998901234567",
    Message:   "Hello!",
})

if err != nil {
    // Check if it's an API error
    if apiErr, ok := opennotify.IsAPIError(err); ok {
        fmt.Printf("API Error: %s (status %d)\n", apiErr.Message, apiErr.StatusCode)

        if apiErr.IsUnauthorized() {
            fmt.Println("Invalid API key")
        } else if apiErr.IsRateLimited() {
            fmt.Println("Rate limited, try again later")
        } else if apiErr.IsNotFound() {
            fmt.Println("Resource not found")
        }
    } else {
        // Network or other error
        fmt.Printf("Error: %v\n", err)
    }
    return
}

fmt.Println("Success:", result.NotificationID)
```

### Context Support

All methods support context for cancellation and timeouts:

```go
// With timeout
ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
defer cancel()

result, err := client.Send(ctx, opennotify.SendOptions{
    Channel:   opennotify.ChannelSMS,
    Provider:  opennotify.ProviderEskiz,
    Recipient: "+998901234567",
    Message:   "Hello!",
})

// Handle context cancellation
if err != nil {
    if ctx.Err() == context.DeadlineExceeded {
        fmt.Println("Request timed out")
    } else if ctx.Err() == context.Canceled {
        fmt.Println("Request was canceled")
    }
}
```

## Channels and Providers

| Channel | Providers |
|---------|-----------|
| `sms` | `eskiz`, `playmobile`, `getsms` |
| `telegram` | `telegram_bot` |
| `email` | `smtp`, `sendgrid`, `mailgun` |
| `push` | `fcm`, `apns` |
| `whatsapp` | `whatsapp_business` |

## Notification Statuses

| Status | Description |
|--------|-------------|
| `pending` | Notification is queued |
| `sent` | Sent to provider |
| `delivered` | Confirmed delivery |
| `failed` | Delivery failed |

## Requirements

- Go 1.21 or later

## License

MIT License
