package rest

import (
	"path/filepath"
	"strings"
	"time"

	ginzap "github.com/gin-contrib/zap"
	"github.com/gin-gonic/gin"
	"go.uber.org/zap"

	"github.com/harryzcy/mailbox-browser/bff/config"
	"github.com/harryzcy/mailbox-browser/bff/transport/rest/web"
)

func Init(logger *zap.Logger, mode string) *gin.Engine {
	logger.Info("initializing REST APIs...",
		zap.String("type", "server-status"),
	)

	r := gin.New()

	if mode == "prod" {
		gin.SetMode(gin.ReleaseMode)
		r.Use(ginzap.Ginzap(logger, time.RFC3339, true), ginzap.RecoveryWithZap(logger, true))
	} else {
		r.Use(gin.Logger(), gin.Recovery())
	}

	webPath := r.Group("/web")
	{
		emails := webPath.Group("/emails")
		emails.GET("", web.MailboxProxy)              // list
		emails.GET("/:id", web.MailboxProxy)          // get
		emails.POST("", web.MailboxProxy)             // create
		emails.POST("/:id", web.MailboxProxy)         // save
		emails.DELETE("/:id", web.MailboxProxy)       // delete
		emails.POST("/:id/trash", web.MailboxProxy)   // trash
		emails.POST("/:id/untrash", web.MailboxProxy) // untrash
		emails.POST("/:id/send", web.MailboxProxy)    // send
	}

	r.NoRoute(func(c *gin.Context) {
		if (c.Request.URL.Path == "/") || (c.Request.URL.Path == "/index.html") {
			c.File(config.INDEX_HTML)
		} else if strings.HasPrefix(c.Request.URL.Path, "/assets/") {
			c.File(filepath.Join(config.STATIC_DIR, c.Request.URL.Path))
		}
	})

	return r
}
