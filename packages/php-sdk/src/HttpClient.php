<?php

declare(strict_types=1);

namespace OpenNotify;

use GuzzleHttp\Client;
use GuzzleHttp\Exception\ConnectException;
use GuzzleHttp\Exception\RequestException;
use GuzzleHttp\RequestOptions;

/**
 * HTTP client for OpenNotify API.
 *
 * @internal
 */
class HttpClient
{
    private Client $client;
    private float $timeout;

    public function __construct(
        string $baseUrl,
        string $apiKey,
        float $timeout = 30.0,
    ) {
        $this->timeout = $timeout;

        $this->client = new Client([
            'base_uri' => rtrim($baseUrl, '/') . '/',
            'timeout' => $timeout,
            'headers' => [
                'Content-Type' => 'application/json',
                'Accept' => 'application/json',
                'X-API-Key' => $apiKey,
            ],
        ]);
    }

    /**
     * Make a GET request.
     *
     * @param string $path API endpoint path
     * @param array<string, mixed> $query Query parameters
     * @return array<string, mixed> Response data
     * @throws OpenNotifyException
     */
    public function get(string $path, array $query = []): array
    {
        return $this->request('GET', $path, [
            RequestOptions::QUERY => $query,
        ]);
    }

    /**
     * Make a POST request.
     *
     * @param string $path API endpoint path
     * @param array<string, mixed> $json Request body
     * @return array<string, mixed> Response data
     * @throws OpenNotifyException
     */
    public function post(string $path, array $json = []): array
    {
        return $this->request('POST', $path, [
            RequestOptions::JSON => $json,
        ]);
    }

    /**
     * Make a PUT request.
     *
     * @param string $path API endpoint path
     * @param array<string, mixed> $json Request body
     * @return array<string, mixed> Response data
     * @throws OpenNotifyException
     */
    public function put(string $path, array $json = []): array
    {
        return $this->request('PUT', $path, [
            RequestOptions::JSON => $json,
        ]);
    }

    /**
     * Make a DELETE request.
     *
     * @param string $path API endpoint path
     * @return array<string, mixed> Response data
     * @throws OpenNotifyException
     */
    public function delete(string $path): array
    {
        return $this->request('DELETE', $path);
    }

    /**
     * Make an HTTP request.
     *
     * @param string $method HTTP method
     * @param string $path API endpoint path
     * @param array<string, mixed> $options Guzzle options
     * @return array<string, mixed> Response data
     * @throws OpenNotifyException
     */
    private function request(string $method, string $path, array $options = []): array
    {
        try {
            $response = $this->client->request($method, ltrim($path, '/'), $options);
        } catch (ConnectException $e) {
            if (str_contains($e->getMessage(), 'timed out')) {
                throw OpenNotifyException::timeoutError($this->timeout);
            }
            throw OpenNotifyException::networkError($e);
        } catch (RequestException $e) {
            if ($e->hasResponse()) {
                $response = $e->getResponse();
                $statusCode = $response->getStatusCode();
                $body = (string) $response->getBody();
                $data = json_decode($body, true);

                $message = null;
                if (is_array($data) && isset($data['error']['message'])) {
                    $message = $data['error']['message'];
                }

                throw OpenNotifyException::fromResponse($statusCode, $message);
            }
            throw OpenNotifyException::networkError($e);
        }

        return $this->handleResponse($response);
    }

    /**
     * Handle API response.
     *
     * @param \Psr\Http\Message\ResponseInterface $response
     * @return array<string, mixed>
     * @throws OpenNotifyException
     */
    private function handleResponse(\Psr\Http\Message\ResponseInterface $response): array
    {
        $body = (string) $response->getBody();
        $data = json_decode($body, true);

        if (!is_array($data)) {
            return [];
        }

        // Check API success flag
        if (isset($data['success']) && $data['success'] === false) {
            $message = $data['error']['message'] ?? 'Unknown error';
            throw new OpenNotifyException(
                message: $message,
                errorCode: 'UNKNOWN_ERROR',
                statusCode: $response->getStatusCode(),
                apiMessage: $message,
            );
        }

        // Return data field if present
        return $data['data'] ?? $data;
    }
}
