package proxy

import (
	"errors"
	"net/http/httputil"
	"net/url"

	"github.com/gin-gonic/gin"
	"github.com/harryzcy/mailbox-browser/bff/config"
	"github.com/harryzcy/mailbox-browser/bff/transport/rest/ginutil"
)

func Proxy(ctx *gin.Context) {
	if !config.ProxyEnable {
		ginutil.Forbidden(ctx, errors.New("proxy disabled"))
		return
	}

	target, err := url.QueryUnescape(ctx.Query("l"))
	if err != nil {
		ginutil.InternalError(ctx, err)
		return
	}

	remote, err := url.Parse(target)
	if err != nil {
		ginutil.InternalError(ctx, err)
		return
	}
	proxy := &httputil.ReverseProxy{
		Rewrite: func(req *httputil.ProxyRequest) {
			req.Out.Host = remote.Host
			req.Out.URL.Scheme = remote.Scheme
			req.Out.URL.Host = remote.Host
			req.Out.URL.Path = remote.Path
		},
	}

	proxy.ServeHTTP(ctx.Writer, ctx.Request)
}
