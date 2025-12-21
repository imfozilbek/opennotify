<?php

declare(strict_types=1);

namespace OpenNotify\Tests;

use OpenNotify\OpenNotifyException;
use PHPUnit\Framework\TestCase;

class OpenNotifyExceptionTest extends TestCase
{
    public function testCreateWithDefaults(): void
    {
        $exception = new OpenNotifyException('Something went wrong');

        $this->assertEquals('Something went wrong', $exception->getMessage());
        $this->assertEquals('UNKNOWN_ERROR', $exception->errorCode);
        $this->assertNull($exception->statusCode);
        $this->assertNull($exception->apiMessage);
    }

    public function testCreateWithAllFields(): void
    {
        $exception = new OpenNotifyException(
            message: 'Auth failed',
            errorCode: 'AUTHENTICATION_ERROR',
            statusCode: 401,
            apiMessage: 'Invalid API key',
        );

        $this->assertEquals('Auth failed', $exception->getMessage());
        $this->assertEquals('AUTHENTICATION_ERROR', $exception->errorCode);
        $this->assertEquals(401, $exception->statusCode);
        $this->assertEquals('Invalid API key', $exception->apiMessage);
    }

    /**
     * @dataProvider retryableCodesProvider
     */
    public function testIsRetryableForRetryableCodes(string $code): void
    {
        $exception = new OpenNotifyException('error', $code);
        $this->assertTrue($exception->isRetryable());
    }

    public static function retryableCodesProvider(): array
    {
        return [
            ['NETWORK_ERROR'],
            ['TIMEOUT_ERROR'],
            ['RATE_LIMIT'],
            ['SERVER_ERROR'],
        ];
    }

    /**
     * @dataProvider nonRetryableCodesProvider
     */
    public function testIsRetryableForNonRetryableCodes(string $code): void
    {
        $exception = new OpenNotifyException('error', $code);
        $this->assertFalse($exception->isRetryable());
    }

    public static function nonRetryableCodesProvider(): array
    {
        return [
            ['AUTHENTICATION_ERROR'],
            ['VALIDATION_ERROR'],
            ['NOT_FOUND'],
            ['UNKNOWN_ERROR'],
        ];
    }

    public function testFromResponse401(): void
    {
        $exception = OpenNotifyException::fromResponse(401, 'Unauthorized');

        $this->assertEquals('AUTHENTICATION_ERROR', $exception->errorCode);
        $this->assertEquals(401, $exception->statusCode);
        $this->assertEquals('Unauthorized', $exception->apiMessage);
    }

    public function testFromResponse403(): void
    {
        $exception = OpenNotifyException::fromResponse(403, 'Forbidden');

        $this->assertEquals('AUTHENTICATION_ERROR', $exception->errorCode);
        $this->assertEquals(403, $exception->statusCode);
    }

    public function testFromResponse404(): void
    {
        $exception = OpenNotifyException::fromResponse(404, 'Not found');

        $this->assertEquals('NOT_FOUND', $exception->errorCode);
        $this->assertEquals(404, $exception->statusCode);
    }

    public function testFromResponse400(): void
    {
        $exception = OpenNotifyException::fromResponse(400, 'Bad request');

        $this->assertEquals('VALIDATION_ERROR', $exception->errorCode);
        $this->assertEquals(400, $exception->statusCode);
    }

    public function testFromResponse422(): void
    {
        $exception = OpenNotifyException::fromResponse(422, 'Unprocessable entity');

        $this->assertEquals('VALIDATION_ERROR', $exception->errorCode);
        $this->assertEquals(422, $exception->statusCode);
    }

    public function testFromResponse429(): void
    {
        $exception = OpenNotifyException::fromResponse(429, 'Too many requests');

        $this->assertEquals('RATE_LIMIT', $exception->errorCode);
        $this->assertEquals(429, $exception->statusCode);
    }

    public function testFromResponse500(): void
    {
        $exception = OpenNotifyException::fromResponse(500, 'Internal server error');

        $this->assertEquals('SERVER_ERROR', $exception->errorCode);
        $this->assertEquals(500, $exception->statusCode);
    }

    public function testFromResponseDefaultMessage(): void
    {
        $exception = OpenNotifyException::fromResponse(401);

        $this->assertEquals('AUTHENTICATION_ERROR', $exception->errorCode);
        $this->assertStringContainsString('Authentication', $exception->getMessage());
    }

    public function testNetworkError(): void
    {
        $exception = OpenNotifyException::networkError();

        $this->assertEquals('NETWORK_ERROR', $exception->errorCode);
        $this->assertStringContainsString('Network error', $exception->getMessage());
    }

    public function testNetworkErrorWithCause(): void
    {
        $cause = new \RuntimeException('Connection refused');
        $exception = OpenNotifyException::networkError($cause);

        $this->assertEquals('NETWORK_ERROR', $exception->errorCode);
        $this->assertStringContainsString('Connection refused', $exception->getMessage());
        $this->assertSame($cause, $exception->getPrevious());
    }

    public function testTimeoutError(): void
    {
        $exception = OpenNotifyException::timeoutError(30.0);

        $this->assertEquals('TIMEOUT_ERROR', $exception->errorCode);
        $this->assertStringContainsString('30', $exception->getMessage());
        $this->assertStringContainsString('timed out', $exception->getMessage());
    }
}
