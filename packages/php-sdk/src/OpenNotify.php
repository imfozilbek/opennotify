<?php

declare(strict_types=1);

namespace OpenNotify;

use InvalidArgumentException;
use OpenNotify\Types\Channel;

/**
 * OpenNotify PHP SDK client.
 *
 * Send notifications through SMS, Telegram, Email, Push, and WhatsApp
 * using a single unified API.
 *
 * @example
 * $client = new OpenNotify('sk_your_api_key');
 *
 * $result = $client->send([
 *     'channel' => 'sms',
 *     'provider' => 'eskiz',
 *     'recipient' => '+998901234567',
 *     'message' => 'Hello from OpenNotify!',
 * ]);
 *
 * echo "Notification ID: " . $result['notification_id'];
 */
class OpenNotify
{
    private const DEFAULT_BASE_URL = 'https://api.opennotify.dev/api/v1';
    private const DEFAULT_TIMEOUT = 30.0;

    private HttpClient $http;

    /**
     * Create a new OpenNotify client.
     *
     * @param string $apiKey Your OpenNotify API key
     * @param string $baseUrl Base URL for the API (optional)
     * @param float $timeout Request timeout in seconds (optional)
     * @throws InvalidArgumentException If apiKey is empty
     */
    public function __construct(
        string $apiKey,
        string $baseUrl = self::DEFAULT_BASE_URL,
        float $timeout = self::DEFAULT_TIMEOUT,
    ) {
        if (empty($apiKey)) {
            throw new InvalidArgumentException('apiKey is required');
        }

        $this->http = new HttpClient($baseUrl, $apiKey, $timeout);
    }

    /**
     * Send a notification.
     *
     * @param array{
     *     channel: string,
     *     provider: string,
     *     recipient: string,
     *     message: string,
     *     subject?: string,
     *     metadata?: array<string, mixed>
     * } $options Notification options
     * @return array{notification_id: string} Result with notification ID
     * @throws OpenNotifyException If the request fails
     *
     * @example
     * // Send SMS
     * $result = $client->send([
     *     'channel' => 'sms',
     *     'provider' => 'eskiz',
     *     'recipient' => '+998901234567',
     *     'message' => 'Your code: 123456',
     * ]);
     *
     * // Send Email
     * $result = $client->send([
     *     'channel' => 'email',
     *     'provider' => 'sendgrid',
     *     'recipient' => 'user@example.com',
     *     'message' => 'Welcome!',
     *     'subject' => 'Welcome to our service',
     * ]);
     */
    public function send(array $options): array
    {
        $channel = $options['channel'] ?? throw new InvalidArgumentException('channel is required');
        $provider = $options['provider'] ?? throw new InvalidArgumentException('provider is required');
        $recipient = $options['recipient'] ?? throw new InvalidArgumentException('recipient is required');
        $message = $options['message'] ?? throw new InvalidArgumentException('message is required');

        $recipientData = $this->buildRecipient($channel, $recipient);

        $payload = ['text' => $message];
        if (isset($options['subject'])) {
            $payload['subject'] = $options['subject'];
        }
        if (isset($options['metadata'])) {
            $payload['metadata'] = $options['metadata'];
        }

        $data = $this->http->post('/notifications/send', [
            'provider' => strtoupper($provider),
            'recipient' => $recipientData,
            'payload' => $payload,
        ]);

        return [
            'notification_id' => $data['notificationId'],
        ];
    }

    /**
     * Get notification details by ID.
     *
     * @param string $id Notification ID
     * @return array{
     *     id: string,
     *     status: string,
     *     channel: string,
     *     provider: string,
     *     recipient: string,
     *     payload: array{text: string, subject?: string},
     *     created_at: string,
     *     sent_at?: string,
     *     delivered_at?: string
     * } Notification details
     * @throws OpenNotifyException If the notification is not found or request fails
     */
    public function getNotification(string $id): array
    {
        $data = $this->http->get("/notifications/{$id}");
        return $this->normalizeNotification($data);
    }

    /**
     * Get the delivery status of a notification.
     *
     * @param string $id Notification ID
     * @return array{status: string} Status response
     * @throws OpenNotifyException If the notification is not found or request fails
     */
    public function getStatus(string $id): array
    {
        $data = $this->http->get("/notifications/{$id}/status");
        return [
            'status' => strtolower($data['status']),
        ];
    }

    /**
     * List notifications with pagination.
     *
     * @param int $page Page number (1-indexed)
     * @param int $limit Items per page
     * @return array{
     *     notifications: array<array>,
     *     total: int,
     *     page: int,
     *     limit: int
     * } Paginated list of notifications
     * @throws OpenNotifyException If the request fails
     */
    public function listNotifications(int $page = 1, int $limit = 20): array
    {
        $data = $this->http->get('/notifications', [
            'page' => $page,
            'limit' => $limit,
        ]);

        $notifications = [];
        foreach ($data['notifications'] ?? [] as $notification) {
            $notifications[] = $this->normalizeNotification($notification);
        }

        return [
            'notifications' => $notifications,
            'total' => $data['total'] ?? 0,
            'page' => $data['page'] ?? $page,
            'limit' => $data['limit'] ?? $limit,
        ];
    }

    /**
     * Build recipient object based on channel type.
     *
     * @param string $channel Channel name
     * @param string $recipient Recipient identifier
     * @return array<string, string> Recipient object
     */
    private function buildRecipient(string $channel, string $recipient): array
    {
        $field = match (strtolower($channel)) {
            'sms', 'whatsapp' => 'phone',
            'email' => 'email',
            'telegram' => 'telegramChatId',
            'push' => 'deviceToken',
            default => 'phone',
        };

        return [$field => $recipient];
    }

    /**
     * Normalize notification response from API.
     *
     * @param array<string, mixed> $data Raw notification data
     * @return array<string, mixed> Normalized notification
     */
    private function normalizeNotification(array $data): array
    {
        $payload = [
            'text' => $data['payload']['text'] ?? '',
        ];
        if (!empty($data['payload']['subject'])) {
            $payload['subject'] = $data['payload']['subject'];
        }

        $result = [
            'id' => $data['id'],
            'status' => strtolower($data['status']),
            'channel' => strtolower($data['channel']),
            'provider' => strtolower($data['provider']),
            'recipient' => $data['recipient'] ?? '',
            'payload' => $payload,
            'created_at' => $data['createdAt'] ?? '',
        ];

        if (!empty($data['sentAt'])) {
            $result['sent_at'] = $data['sentAt'];
        }
        if (!empty($data['deliveredAt'])) {
            $result['delivered_at'] = $data['deliveredAt'];
        }

        return $result;
    }
}
