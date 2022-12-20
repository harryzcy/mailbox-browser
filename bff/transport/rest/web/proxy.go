package web

import (
	"bytes"
	"io"
	"net/http"
	"net/url"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/harryzcy/mailbox-browser/bff/config"
)

func MailboxProxy(ctx *gin.Context) {
	method := ctx.Request.Method
	rawUrl := url.URL{
		Scheme:   "https",
		Host:     strings.TrimPrefix(config.MAILBOX_URL, "https://"),
		Path:     strings.TrimPrefix(ctx.Request.URL.Path, "/web"),
		RawQuery: ctx.Request.URL.RawQuery,
	}

	client := http.Client{
		Timeout: 10 * time.Second,
	}

	bodyBytes, err := io.ReadAll(ctx.Request.Body)
	if err != nil {
		reqError(ctx, err)
		return
	}

	req, err := http.NewRequest(method, rawUrl.String(), bytes.NewReader(bodyBytes))
	if err != nil {
		reqError(ctx, err)
		return
	}

	signer := &awsRequestSigner{
		RegionName: config.AWS_REGION,
		AwsSecurityCredentials: awsSecurityCredentials{
			AccessKeyID:     config.AWS_ACCESS_KEY_ID,
			SecretAccessKey: config.AWS_SECRET_ACCESS_KEY,
		},
	}
	err = signer.SignRequest(req)
	if err != nil {
		reqError(ctx, err)
		return
	}

	resp, err := client.Do(req)
	if err != nil {
		reqError(ctx, err)
		return
	}
	defer resp.Body.Close()
	ctx.DataFromReader(http.StatusOK, resp.ContentLength, resp.Header.Get("Content-Type"), resp.Body, nil)
}

func reqError(ctx *gin.Context, err error) {
	ctx.JSON(http.StatusInternalServerError, gin.H{
		"error": err.Error(),
	})
}
