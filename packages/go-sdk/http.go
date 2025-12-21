package opennotify

import (
    "bytes"
    "context"
    "encoding/json"
    "fmt"
    "io"
    "net/http"
    "net/url"
    "time"
)

const (
    defaultBaseURL = "https://api.opennotify.dev/api/v1"
    defaultTimeout = 30 * time.Second
)

// httpClient is an internal HTTP client for making API requests.
type httpClient struct {
    baseURL    string
    apiKey     string
    httpClient *http.Client
}

// newHTTPClient creates a new HTTP client.
func newHTTPClient(baseURL, apiKey string, timeout time.Duration) *httpClient {
    if baseURL == "" {
        baseURL = defaultBaseURL
    }
    if timeout == 0 {
        timeout = defaultTimeout
    }

    return &httpClient{
        baseURL: baseURL,
        apiKey:  apiKey,
        httpClient: &http.Client{
            Timeout: timeout,
        },
    }
}

// get performs a GET request.
func (c *httpClient) get(ctx context.Context, path string, query map[string]string) ([]byte, error) {
    reqURL := c.baseURL + path

    if len(query) > 0 {
        params := url.Values{}
        for k, v := range query {
            if v != "" {
                params.Add(k, v)
            }
        }
        if encoded := params.Encode(); encoded != "" {
            reqURL += "?" + encoded
        }
    }

    req, err := http.NewRequestWithContext(ctx, http.MethodGet, reqURL, nil)
    if err != nil {
        return nil, fmt.Errorf("failed to create request: %w", err)
    }

    return c.do(req)
}

// post performs a POST request.
func (c *httpClient) post(ctx context.Context, path string, body any) ([]byte, error) {
    reqURL := c.baseURL + path

    var bodyReader io.Reader
    if body != nil {
        jsonBody, err := json.Marshal(body)
        if err != nil {
            return nil, fmt.Errorf("failed to marshal request body: %w", err)
        }
        bodyReader = bytes.NewReader(jsonBody)
    }

    req, err := http.NewRequestWithContext(ctx, http.MethodPost, reqURL, bodyReader)
    if err != nil {
        return nil, fmt.Errorf("failed to create request: %w", err)
    }

    if body != nil {
        req.Header.Set("Content-Type", "application/json")
    }

    return c.do(req)
}

// do executes the HTTP request.
func (c *httpClient) do(req *http.Request) ([]byte, error) {
    req.Header.Set("X-API-Key", c.apiKey)
    req.Header.Set("Accept", "application/json")

    resp, err := c.httpClient.Do(req)
    if err != nil {
        return nil, fmt.Errorf("request failed: %w", err)
    }
    defer resp.Body.Close()

    body, err := io.ReadAll(resp.Body)
    if err != nil {
        return nil, fmt.Errorf("failed to read response body: %w", err)
    }

    if resp.StatusCode >= 400 {
        var apiErr APIError
        if err := json.Unmarshal(body, &apiErr); err != nil {
            return nil, &APIError{
                StatusCode: resp.StatusCode,
                Message:    string(body),
            }
        }
        apiErr.StatusCode = resp.StatusCode
        return nil, &apiErr
    }

    return body, nil
}
