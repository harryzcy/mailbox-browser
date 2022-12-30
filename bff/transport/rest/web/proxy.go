//go:build !dev

package web

import (
	"bytes"
	"context"
	"io"
	"net/http"
	"net/url"
	"strings"

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

	content, err := request(ctx, RequestOptions{
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

	ctx.Data(http.StatusOK, "application/json", []byte(content))
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

func request(ctx context.Context, options RequestOptions) (string, error) {
	body := bytes.NewReader(options.Payload)
	req, err := http.NewRequestWithContext(ctx, options.Method, options.Endpoint+options.Path, body)
	if err != nil {
		return "", err
	}

	req.URL.RawQuery = options.Query.Encode()
	if options.Method == http.MethodPost || options.Method == http.MethodPut {
		req.Header.Add("Content-Type", "application/json")
	}

	req.Header.Set("Accept", "application/json")

	err = SignSDKRequest(ctx, req, &SignSDKRequestOptions{
		Credentials: options.Credentials,
		Payload:     options.Payload,
		Region:      options.Region,
		Verbose:     false,
	})
	if err != nil {
		return "", err
	}

	httpClient := &http.Client{}
	resp, err := httpClient.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	data, err := ioReadall(resp.Body)
	if err != nil {
		return "", err
	}

	return string(data), nil
}

var (
	ioReadall = io.ReadAll
)

func reqError(ctx *gin.Context, err error) {
	ctx.JSON(http.StatusInternalServerError, gin.H{
		"error": err.Error(),
	})
}
