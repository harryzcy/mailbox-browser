package proxy

import (
	"io"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/harryzcy/mailbox-browser/bff/request"
	"github.com/harryzcy/mailbox-browser/bff/transport/rest/ginutil"
)

func MailboxProxy(ctx *gin.Context) {
	method := ctx.Request.Method

	payload, err := io.ReadAll(ctx.Request.Body)
	if err != nil {
		ginutil.InternalError(ctx, err)
		return
	}

	resp, err := request.AWSRequest(ctx, request.RequestOptions{
		Method:  method,
		Path:    strings.TrimPrefix(ctx.Request.URL.Path, "/web"),
		Query:   ctx.Request.URL.Query(),
		Payload: payload,
	})
	if err != nil {
		ginutil.InternalError(ctx, err)
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
