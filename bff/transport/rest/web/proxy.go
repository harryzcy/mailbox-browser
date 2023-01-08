//go:build !dev

package web

import (
	"bytes"
	"io"
	"net/http"
	"net/url"
	"strings"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/gin-gonic/gin"
	"github.com/harryzcy/mailbox-browser/bff/config"
)

func MailboxProxy(ctx *gin.Context) {
	method := ctx.Request.Method

	payload, err := io.ReadAll(ctx.Request.Body)
	if err != nil {
		reqError(ctx, err)
		return
	}

	resp, err := request(ctx, RequestOptions{
		Method:   method,
		Endpoint: config.AWS_API_GATEWAY_ENDPOINT,
		Path:     strings.TrimPrefix(ctx.Request.URL.Path, "/web"),
		Query:    ctx.Request.URL.Query(),
		Payload:  payload,
		Region:   config.AWS_REGION,
		Credentials: credentials.StaticCredentialsProvider{
			Value: aws.Credentials{
				AccessKeyID:     config.AWS_ACCESS_KEY_ID,
				SecretAccessKey: config.AWS_SECRET_ACCESS_KEY,
			},
		},
	})
	if err != nil {
		reqError(ctx, err)
		return
	}

	headers := make(map[string]string)
	for k, v := range resp.Header {
		if k == "Content-Type" {
			continue
		}
		headers[k] = v[0]
	}

	ctx.DataFromReader(resp.StatusCode, resp.ContentLength, resp.Header.Get("Content-Type"), resp.Body, headers)
}

type RequestOptions struct {
	Method      string
	Endpoint    string
	Path        string
	Query       url.Values
	Payload     []byte
	Region      string
	Credentials aws.CredentialsProvider
}

func request(ctx *gin.Context, options RequestOptions) (*http.Response, error) {
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

func reqError(ctx *gin.Context, err error) {
	ctx.JSON(http.StatusInternalServerError, gin.H{
		"error": err.Error(),
	})
}
