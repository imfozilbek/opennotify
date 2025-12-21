<?php

declare(strict_types=1);

namespace OpenNotify\Types;

/**
 * Notification delivery status.
 */
enum NotificationStatus: string
{
    case PENDING = 'pending';
    case SENT = 'sent';
    case DELIVERED = 'delivered';
    case FAILED = 'failed';

    /**
     * Check if this is a final status.
     */
    public function isFinal(): bool
    {
        return match ($this) {
            self::DELIVERED, self::FAILED => true,
            self::PENDING, self::SENT => false,
        };
    }

    /**
     * Check if this is a successful status.
     */
    public function isSuccess(): bool
    {
        return $this === self::DELIVERED;
    }
}
