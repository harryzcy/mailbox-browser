package proxy

import (
	"io"
	"net/http"
	"net/url"
	"time"

	"github.com/gin-gonic/gin"
)

func Proxy(ctx *gin.Context) {
	target, err := url.QueryUnescape(ctx.Query("l"))
	if err != nil {
		reqError(ctx, err)
		return
	}

	client := &http.Client{
		Timeout: 10 * time.Second,
	}

	req, err := http.NewRequest(ctx.Request.Method, target, ctx.Request.Body)
	if err != nil {
		reqError(ctx, err)
		return
	}

	res, err := client.Do(req)
	if err != nil {
		reqError(ctx, err)
		return
	}
	defer res.Body.Close()

	_, err = io.Copy(ctx.Writer, res.Body)
	if err != nil {
		reqError(ctx, err)
		return
	}

	copyHeader(ctx.Writer.Header(), res.Header)
	ctx.Status(res.StatusCode)
}

func copyHeader(dst, src http.Header) {
	for k, vv := range src {
		for _, v := range vv {
			dst.Add(k, v)
		}
	}
}
