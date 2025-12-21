// Package opennotify provides a Go client for the OpenNotify API.
//
// OpenNotify is a unified notification API for sending messages via
// SMS, Telegram, Email, Push, and WhatsApp channels.
//
// Example usage:
//
//	client, err := opennotify.New("sk_your_api_key")
//	if err != nil {
//	    log.Fatal(err)
//	}
//
//	result, err := client.Send(context.Background(), opennotify.SendOptions{
//	    Channel:   opennotify.ChannelSMS,
//	    Provider:  opennotify.ProviderEskiz,
//	    Recipient: "+998901234567",
//	    Message:   "Hello from OpenNotify!",
//	})
//	if err != nil {
//	    log.Fatal(err)
//	}
//
//	fmt.Println("Notification ID:", result.NotificationID)
package opennotify

import (
    "context"
    "encoding/json"
    "fmt"
    "strconv"
    "time"
)

// Client is the OpenNotify API client.
type Client struct {
    http *httpClient
}

// Options contains client configuration options.
type Options struct {
    // BaseURL is the API base URL (optional, defaults to https://api.opennotify.dev/api/v1).
    BaseURL string

    // Timeout is the HTTP request timeout (optional, defaults to 30 seconds).
    Timeout time.Duration
}

// New creates a new OpenNotify client.
//
// Example:
//
//	client, err := opennotify.New("sk_your_api_key")
func New(apiKey string, opts ...Options) (*Client, error) {
    if apiKey == "" {
        return nil, ErrAPIKeyRequired
    }

    var opt Options
    if len(opts) > 0 {
        opt = opts[0]
    }

    return &Client{
        http: newHTTPClient(opt.BaseURL, apiKey, opt.Timeout),
    }, nil
}

// Send sends a notification.
//
// Example:
//
//	// Send SMS
//	result, err := client.Send(ctx, opennotify.SendOptions{
//	    Channel:   opennotify.ChannelSMS,
//	    Provider:  opennotify.ProviderEskiz,
//	    Recipient: "+998901234567",
//	    Message:   "Your code is 1234",
//	})
//
//	// Send Telegram message
//	result, err := client.Send(ctx, opennotify.SendOptions{
//	    Channel:   opennotify.ChannelTelegram,
//	    Provider:  opennotify.ProviderTelegramBot,
//	    Recipient: "123456789",
//	    Message:   "Hello from OpenNotify!",
//	})
//
//	// Send Email
//	result, err := client.Send(ctx, opennotify.SendOptions{
//	    Channel:   opennotify.ChannelEmail,
//	    Provider:  opennotify.ProviderSendGrid,
//	    Recipient: "user@example.com",
//	    Subject:   "Welcome!",
//	    Message:   "Thank you for signing up.",
//	})
func (c *Client) Send(ctx context.Context, opts SendOptions) (*SendResult, error) {
    if opts.Channel == "" {
        return nil, ErrChannelRequired
    }
    if opts.Provider == "" {
        return nil, ErrProviderRequired
    }
    if opts.Recipient == "" {
        return nil, ErrRecipientRequired
    }
    if opts.Message == "" {
        return nil, ErrMessageRequired
    }

    req := sendRequest{
        Channel:   opts.Channel,
        Provider:  opts.Provider,
        Recipient: buildRecipient(opts.Channel, opts.Recipient),
        Payload: payloadRequest{
            Text:     opts.Message,
            Subject:  opts.Subject,
            Metadata: opts.Metadata,
        },
    }

    body, err := c.http.post(ctx, "/notifications/send", req)
    if err != nil {
        return nil, err
    }

    var result SendResult
    if err := json.Unmarshal(body, &result); err != nil {
        return nil, fmt.Errorf("failed to parse response: %w", err)
    }

    return &result, nil
}

// GetNotification retrieves a notification by ID.
//
// Example:
//
//	notification, err := client.GetNotification(ctx, "notif_123")
//	if err != nil {
//	    log.Fatal(err)
//	}
//	fmt.Println("Status:", notification.Status)
func (c *Client) GetNotification(ctx context.Context, id string) (*Notification, error) {
    if id == "" {
        return nil, ErrNotificationIDRequired
    }

    body, err := c.http.get(ctx, "/notifications/"+id, nil)
    if err != nil {
        return nil, err
    }

    var notification Notification
    if err := json.Unmarshal(body, &notification); err != nil {
        return nil, fmt.Errorf("failed to parse response: %w", err)
    }

    return &notification, nil
}

// GetStatus retrieves the delivery status of a notification.
//
// Example:
//
//	status, err := client.GetStatus(ctx, "notif_123")
//	if err != nil {
//	    log.Fatal(err)
//	}
//
//	if status.Status == opennotify.StatusDelivered {
//	    fmt.Println("Message delivered!")
//	}
func (c *Client) GetStatus(ctx context.Context, id string) (*StatusResponse, error) {
    if id == "" {
        return nil, ErrNotificationIDRequired
    }

    body, err := c.http.get(ctx, "/notifications/"+id+"/status", nil)
    if err != nil {
        return nil, err
    }

    var status StatusResponse
    if err := json.Unmarshal(body, &status); err != nil {
        return nil, fmt.Errorf("failed to parse response: %w", err)
    }

    return &status, nil
}

// ListNotifications retrieves a paginated list of notifications.
//
// Example:
//
//	// Get first page with default limit
//	list, err := client.ListNotifications(ctx, nil)
//
//	// Get specific page
//	list, err := client.ListNotifications(ctx, &opennotify.ListOptions{
//	    Page:  2,
//	    Limit: 50,
//	})
//
//	for _, n := range list.Notifications {
//	    fmt.Printf("%s: %s\n", n.ID, n.Status)
//	}
func (c *Client) ListNotifications(ctx context.Context, opts *ListOptions) (*NotificationList, error) {
    query := make(map[string]string)

    if opts != nil {
        if opts.Page > 0 {
            query["page"] = strconv.Itoa(opts.Page)
        }
        if opts.Limit > 0 {
            query["limit"] = strconv.Itoa(opts.Limit)
        }
    }

    body, err := c.http.get(ctx, "/notifications", query)
    if err != nil {
        return nil, err
    }

    var list NotificationList
    if err := json.Unmarshal(body, &list); err != nil {
        return nil, fmt.Errorf("failed to parse response: %w", err)
    }

    return &list, nil
}

// buildRecipient creates the recipient object based on channel type.
func buildRecipient(channel Channel, recipient string) recipientRequest {
    switch channel {
    case ChannelSMS, ChannelWhatsApp:
        return recipientRequest{Phone: recipient}
    case ChannelEmail:
        return recipientRequest{Email: recipient}
    case ChannelTelegram:
        return recipientRequest{TelegramChatID: recipient}
    case ChannelPush:
        return recipientRequest{DeviceToken: recipient}
    default:
        return recipientRequest{Phone: recipient}
    }
}
