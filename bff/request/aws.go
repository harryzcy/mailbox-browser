package request

import (
	"bytes"
	"context"
	"net/http"
	"net/url"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/harryzcy/mailbox-browser/bff/config"
)

type RequestOptions struct {
	Method  string
	Path    string
	Query   url.Values
	Payload []byte
}

// AWSRequest sends a request to AWS API Gateway and returns the response.
func AWSRequest(ctx context.Context, options RequestOptions) (*http.Response, error) {
	endpoint := config.AWS_API_GATEWAY_ENDPOINT

	body := bytes.NewReader(options.Payload)
	req, err := http.NewRequestWithContext(ctx, options.Method, endpoint+options.Path, body)
	if err != nil {
		return nil, err
	}

	req.URL.RawQuery = options.Query.Encode()
	if options.Method == http.MethodPost || options.Method == http.MethodPut {
		req.Header.Add("Content-Type", "application/json")
	}

	req.Header.Set("Accept", "application/json")

	err = signSDKRequest(ctx, req, &signSDKRequestOptions{
		Credentials: credentials.StaticCredentialsProvider{
			Value: aws.Credentials{
				AccessKeyID:     config.AWS_ACCESS_KEY_ID,
				SecretAccessKey: config.AWS_SECRET_ACCESS_KEY,
			},
		},
		Payload: options.Payload,
		Region:  config.AWS_REGION,
	})
	if err != nil {
		return nil, err
	}

	httpClient := &http.Client{
		Timeout: 10 * time.Second,
	}
	resp, err := httpClient.Do(req)
	return resp, err
}
