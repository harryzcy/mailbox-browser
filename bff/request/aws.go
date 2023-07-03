package request

import (
	"bytes"
	"net/http"
	"net/url"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/gin-gonic/gin"
)

type RequestOptions struct {
	Method      string
	Endpoint    string
	Path        string
	Query       url.Values
	Payload     []byte
	Region      string
	Credentials aws.CredentialsProvider
}

// AWSRequest sends a request to AWS API Gateway and returns the response.
func AWSRequest(ctx *gin.Context, options RequestOptions) (*http.Response, error) {
	body := bytes.NewReader(options.Payload)
	req, err := http.NewRequestWithContext(ctx, options.Method, options.Endpoint+options.Path, body)
	if err != nil {
		return nil, err
	}

	req.URL.RawQuery = options.Query.Encode()
	if options.Method == http.MethodPost || options.Method == http.MethodPut {
		req.Header.Add("Content-Type", "application/json")
	}

	req.Header.Set("Accept", "application/json")

	err = signSDKRequest(ctx, req, &signSDKRequestOptions{
		Credentials: options.Credentials,
		Payload:     options.Payload,
		Region:      options.Region,
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
