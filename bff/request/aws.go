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

type Options struct {
	Method  string
	Path    string
	Query   url.Values
	Payload []byte
}

// AWSRequest sends a request to AWS API Gateway and returns the response.
func AWSRequest(ctx context.Context, options Options) (*http.Response, error) {
	endpoint := config.AWSAPIGatewayEndpoint

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
				AccessKeyID:     config.AWSAccessKeyID,
				SecretAccessKey: config.AWSSecretAccessKey,
			},
		},
		Payload: options.Payload,
		Region:  config.AWSRegion,
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
