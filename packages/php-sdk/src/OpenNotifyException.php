<?php

declare(strict_types=1);

namespace OpenNotify;

use Exception;
use Throwable;

/**
 * Exception thrown by the OpenNotify SDK.
 *
 * @example
 * try {
 *     $client->send([...]);
 * } catch (OpenNotifyException $e) {
 *     if ($e->errorCode === 'RATE_LIMIT') {
 *         sleep(60);
 *     } elseif ($e->isRetryable()) {
 *         // retry
 *     }
 * }
 */
class OpenNotifyException extends Exception
{
    /**
     * Error codes that are retryable.
     */
    private const RETRYABLE_CODES = [
        'NETWORK_ERROR',
        'TIMEOUT_ERROR',
        'RATE_LIMIT',
        'SERVER_ERROR',
    ];

    /**
     * @param string $message Human-readable error message
     * @param string $errorCode Error code for programmatic handling
     * @param int|null $statusCode HTTP status code if applicable
     * @param string|null $apiMessage Original error message from the API
     * @param Throwable|null $previous Previous exception
     */
    public function __construct(
        string $message,
        public readonly string $errorCode = 'UNKNOWN_ERROR',
        public readonly ?int $statusCode = null,
        public readonly ?string $apiMessage = null,
        ?Throwable $previous = null,
    ) {
        parent::__construct($message, 0, $previous);
    }

    /**
     * Check if this error is retryable.
     *
     * Retryable errors: NETWORK_ERROR, TIMEOUT_ERROR, RATE_LIMIT, SERVER_ERROR
     */
    public function isRetryable(): bool
    {
        return in_array($this->errorCode, self::RETRYABLE_CODES, true);
    }

    /**
     * Create an exception from an HTTP response.
     */
    public static function fromResponse(int $statusCode, ?string $message = null): self
    {
        $errorCode = self::statusToCode($statusCode);
        $defaultMessage = self::defaultMessage($errorCode);

        return new self(
            message: $message ?? $defaultMessage,
            errorCode: $errorCode,
            statusCode: $statusCode,
            apiMessage: $message,
        );
    }

    /**
     * Create a network error.
     */
    public static function networkError(?Throwable $cause = null): self
    {
        $message = 'Network error occurred';
        if ($cause !== null) {
            $message = "Network error: {$cause->getMessage()}";
        }

        return new self(
            message: $message,
            errorCode: 'NETWORK_ERROR',
            previous: $cause,
        );
    }

    /**
     * Create a timeout error.
     */
    public static function timeoutError(float $timeoutSeconds): self
    {
        return new self(
            message: "Request timed out after {$timeoutSeconds} seconds",
            errorCode: 'TIMEOUT_ERROR',
        );
    }

    /**
     * Map HTTP status code to error code.
     */
    private static function statusToCode(int $statusCode): string
    {
        return match (true) {
            $statusCode === 401, $statusCode === 403 => 'AUTHENTICATION_ERROR',
            $statusCode === 404 => 'NOT_FOUND',
            $statusCode === 400, $statusCode === 422 => 'VALIDATION_ERROR',
            $statusCode === 429 => 'RATE_LIMIT',
            $statusCode >= 500 => 'SERVER_ERROR',
            default => 'UNKNOWN_ERROR',
        };
    }

    /**
     * Get default message for error code.
     */
    private static function defaultMessage(string $code): string
    {
        return match ($code) {
            'NETWORK_ERROR' => 'Network error occurred',
            'TIMEOUT_ERROR' => 'Request timed out',
            'AUTHENTICATION_ERROR' => 'Authentication failed. Check your API key.',
            'VALIDATION_ERROR' => 'Invalid request parameters',
            'NOT_FOUND' => 'Resource not found',
            'RATE_LIMIT' => 'Rate limit exceeded. Please slow down.',
            'SERVER_ERROR' => 'Server error occurred. Please try again.',
            default => 'An unknown error occurred',
        };
    }
}
