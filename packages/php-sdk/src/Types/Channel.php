<?php

declare(strict_types=1);

namespace OpenNotify\Types;

/**
 * Notification channels supported by OpenNotify.
 */
enum Channel: string
{
    case SMS = 'sms';
    case TELEGRAM = 'telegram';
    case EMAIL = 'email';
    case PUSH = 'push';
    case WHATSAPP = 'whatsapp';

    /**
     * Get the recipient field name for this channel.
     */
    public function getRecipientField(): string
    {
        return match ($this) {
            self::SMS, self::WHATSAPP => 'phone',
            self::EMAIL => 'email',
            self::TELEGRAM => 'telegramChatId',
            self::PUSH => 'deviceToken',
        };
    }
}
