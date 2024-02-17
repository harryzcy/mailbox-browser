package rest

import (
	"path/filepath"
	"strings"
	"time"

	ginzap "github.com/gin-contrib/zap"
	"github.com/gin-gonic/gin"
	"go.uber.org/zap"

	"github.com/harryzcy/mailbox-browser/bff/config"
	"github.com/harryzcy/mailbox-browser/bff/transport/rest/misc"
	"github.com/harryzcy/mailbox-browser/bff/transport/rest/plugin"
	"github.com/harryzcy/mailbox-browser/bff/transport/rest/proxy"
)

func Init(logger *zap.Logger, mode string) *gin.Engine {
	logger.Info("initializing REST APIs...",
		zap.String("type", "server-status"),
	)

	if mode == "prod" {
		gin.SetMode(gin.ReleaseMode)
	}

	r := gin.New()
	if mode == "prod" {
		r.Use(ginzap.Ginzap(logger, time.RFC3339, true), ginzap.RecoveryWithZap(logger, true))
	} else {
		r.Use(gin.Logger(), gin.Recovery())
	}

	webPath := r.Group("/web")
	webPath.Any("/*any", proxy.MailboxProxy)
	r.GET("/proxy", proxy.Proxy)

	r.POST("/plugins/invoke", plugin.Invoke)

	// misc routes
	r.GET("/ping", misc.Ping)
	r.GET("/info", misc.Info)
	r.GET("/config", misc.Config)
	r.GET("/robots.txt", misc.Robots)

	r.NoRoute(func(c *gin.Context) {
		if strings.HasPrefix(c.Request.URL.Path, "/assets/") {
			c.File(filepath.Join(config.StaticDir, c.Request.URL.Path))
		} else {
			c.File(config.IndexHTML)
		}
	})

	return r
}
