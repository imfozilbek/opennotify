<?php

declare(strict_types=1);

namespace OpenNotify\Tests;

use InvalidArgumentException;
use OpenNotify\OpenNotify;
use PHPUnit\Framework\TestCase;

class OpenNotifyTest extends TestCase
{
    public function testConstructorWithApiKey(): void
    {
        $client = new OpenNotify('sk_test_key');
        $this->assertInstanceOf(OpenNotify::class, $client);
    }

    public function testConstructorWithEmptyApiKeyThrows(): void
    {
        $this->expectException(InvalidArgumentException::class);
        $this->expectExceptionMessage('apiKey is required');
        new OpenNotify('');
    }

    public function testConstructorWithCustomBaseUrl(): void
    {
        $client = new OpenNotify(
            'sk_test_key',
            'https://custom.api.com/v1',
        );
        $this->assertInstanceOf(OpenNotify::class, $client);
    }

    public function testConstructorWithCustomTimeout(): void
    {
        $client = new OpenNotify(
            'sk_test_key',
            'https://api.opennotify.dev/api/v1',
            60.0,
        );
        $this->assertInstanceOf(OpenNotify::class, $client);
    }
}
