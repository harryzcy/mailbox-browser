package proxy

import (
	"errors"
	"net/http"
	"net/http/httputil"
	"net/url"

	"github.com/gin-gonic/gin"
	"github.com/harryzcy/mailbox-browser/bff/config"
	"github.com/harryzcy/mailbox-browser/bff/transport/rest/ginutil"
)

func Proxy(ctx *gin.Context) {
	if !config.PROXY_ENABLE {
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
	proxy := httputil.NewSingleHostReverseProxy(&url.URL{
		Scheme: remote.Scheme,
		Host:   remote.Host,
	})
	proxy.Director = func(req *http.Request) {
		req.Header = ctx.Request.Header
		req.Host = remote.Host
		req.URL.Scheme = remote.Scheme
		req.URL.Host = remote.Host
		req.URL.Path = remote.Path
	}

	proxy.ServeHTTP(ctx.Writer, ctx.Request)
}
