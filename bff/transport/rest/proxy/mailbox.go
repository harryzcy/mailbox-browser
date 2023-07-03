//go:build !dev

package proxy

import (
	"io"
	"net/http"
	"strings"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/gin-gonic/gin"
	"github.com/harryzcy/mailbox-browser/bff/config"
	"github.com/harryzcy/mailbox-browser/bff/request"
)

func MailboxProxy(ctx *gin.Context) {
	method := ctx.Request.Method

	payload, err := io.ReadAll(ctx.Request.Body)
	if err != nil {
		reqError(ctx, err)
		return
	}

	resp, err := request.AWSRequest(ctx, request.RequestOptions{
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

func reqError(ctx *gin.Context, err error) {
	ctx.JSON(http.StatusInternalServerError, gin.H{
		"error": err.Error(),
	})
}
