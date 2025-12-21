<?php

declare(strict_types=1);

namespace OpenNotify\Types;

/**
 * Notification providers supported by OpenNotify.
 */
enum Provider: string
{
    // SMS Providers
    case ESKIZ = 'eskiz';
    case PLAYMOBILE = 'playmobile';
    case GETSMS = 'getsms';

    // Telegram
    case TELEGRAM_BOT = 'telegram_bot';

    // Email Providers
    case SMTP = 'smtp';
    case SENDGRID = 'sendgrid';
    case MAILGUN = 'mailgun';

    // Push Providers
    case FCM = 'fcm';
    case APNS = 'apns';

    // WhatsApp
    case WHATSAPP_BUSINESS = 'whatsapp_business';

    /**
     * Get the channel for this provider.
     */
    public function getChannel(): Channel
    {
        return match ($this) {
            self::ESKIZ, self::PLAYMOBILE, self::GETSMS => Channel::SMS,
            self::TELEGRAM_BOT => Channel::TELEGRAM,
            self::SMTP, self::SENDGRID, self::MAILGUN => Channel::EMAIL,
            self::FCM, self::APNS => Channel::PUSH,
            self::WHATSAPP_BUSINESS => Channel::WHATSAPP,
        };
    }
}
