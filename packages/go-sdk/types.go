package opennotify

import "time"

// Channel represents notification delivery channels.
type Channel string

const (
    ChannelSMS      Channel = "sms"
    ChannelTelegram Channel = "telegram"
    ChannelEmail    Channel = "email"
    ChannelPush     Channel = "push"
    ChannelWhatsApp Channel = "whatsapp"
)

// Provider represents notification providers.
type Provider string

const (
    ProviderEskiz           Provider = "eskiz"
    ProviderPlayMobile      Provider = "playmobile"
    ProviderGetSMS          Provider = "getsms"
    ProviderTelegramBot     Provider = "telegram_bot"
    ProviderSMTP            Provider = "smtp"
    ProviderSendGrid        Provider = "sendgrid"
    ProviderMailgun         Provider = "mailgun"
    ProviderFCM             Provider = "fcm"
    ProviderAPNs            Provider = "apns"
    ProviderWhatsAppBusiness Provider = "whatsapp_business"
)

// NotificationStatus represents the delivery status of a notification.
type NotificationStatus string

const (
    StatusPending   NotificationStatus = "pending"
    StatusSent      NotificationStatus = "sent"
    StatusDelivered NotificationStatus = "delivered"
    StatusFailed    NotificationStatus = "failed"
)

// SendOptions contains options for sending a notification.
type SendOptions struct {
    // Channel is the delivery channel (sms, telegram, email, push, whatsapp).
    Channel Channel `json:"channel"`

    // Provider is the notification provider (eskiz, telegram_bot, sendgrid, etc.).
    Provider Provider `json:"provider"`

    // Recipient is the recipient identifier (phone, email, chat ID, device token).
    Recipient string `json:"recipient"`

    // Message is the notification text content.
    Message string `json:"message"`

    // Subject is optional email subject (for email channel).
    Subject string `json:"subject,omitempty"`

    // Metadata is optional custom metadata.
    Metadata map[string]any `json:"metadata,omitempty"`
}

// SendResult contains the result of sending a notification.
type SendResult struct {
    // NotificationID is the unique identifier of the created notification.
    NotificationID string `json:"notificationId"`
}

// Notification represents a notification object.
type Notification struct {
    // ID is the unique identifier.
    ID string `json:"id"`

    // Status is the current delivery status.
    Status NotificationStatus `json:"status"`

    // Channel is the delivery channel.
    Channel Channel `json:"channel"`

    // Provider is the notification provider.
    Provider Provider `json:"provider"`

    // Recipient is the recipient identifier.
    Recipient string `json:"recipient"`

    // Payload contains the notification content.
    Payload NotificationPayload `json:"payload"`

    // CreatedAt is when the notification was created.
    CreatedAt time.Time `json:"createdAt"`

    // SentAt is when the notification was sent (optional).
    SentAt *time.Time `json:"sentAt,omitempty"`

    // DeliveredAt is when the notification was delivered (optional).
    DeliveredAt *time.Time `json:"deliveredAt,omitempty"`
}

// NotificationPayload contains the notification content.
type NotificationPayload struct {
    // Text is the message content.
    Text string `json:"text"`

    // Subject is the email subject (optional).
    Subject string `json:"subject,omitempty"`

    // Metadata is custom metadata (optional).
    Metadata map[string]any `json:"metadata,omitempty"`
}

// StatusResponse contains the status check result.
type StatusResponse struct {
    // Status is the current delivery status.
    Status NotificationStatus `json:"status"`
}

// NotificationList contains a paginated list of notifications.
type NotificationList struct {
    // Notifications is the list of notifications.
    Notifications []Notification `json:"notifications"`

    // Total is the total number of notifications.
    Total int `json:"total"`

    // Page is the current page number.
    Page int `json:"page"`

    // Limit is the number of items per page.
    Limit int `json:"limit"`
}

// ListOptions contains options for listing notifications.
type ListOptions struct {
    // Page is the page number (1-indexed).
    Page int `json:"page,omitempty"`

    // Limit is the number of items per page.
    Limit int `json:"limit,omitempty"`
}

// recipientRequest is the internal recipient format for API requests.
type recipientRequest struct {
    Phone          string `json:"phone,omitempty"`
    Email          string `json:"email,omitempty"`
    TelegramChatID string `json:"telegramChatId,omitempty"`
    DeviceToken    string `json:"deviceToken,omitempty"`
}

// sendRequest is the internal request format for sending notifications.
type sendRequest struct {
    Channel   Channel          `json:"channel"`
    Provider  Provider         `json:"provider"`
    Recipient recipientRequest `json:"recipient"`
    Payload   payloadRequest   `json:"payload"`
}

// payloadRequest is the internal payload format for API requests.
type payloadRequest struct {
    Text     string         `json:"text"`
    Subject  string         `json:"subject,omitempty"`
    Metadata map[string]any `json:"metadata,omitempty"`
}
