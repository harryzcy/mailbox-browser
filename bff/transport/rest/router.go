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
	"github.com/harryzcy/mailbox-browser/bff/transport/rest/web"
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
	{
		emails := webPath.Group("/emails")
		emails.GET("", web.MailboxProxy)                            // list
		emails.GET("/:id", web.MailboxProxy)                        // get
		emails.GET("/:id/attachments/:contentID", web.MailboxProxy) // get attachment
		emails.GET("/:id/inlines/:contentID", web.MailboxProxy)     // get inline file
		emails.POST("", web.MailboxProxy)                           // create
		emails.PUT("/:id", web.MailboxProxy)                        // save
		emails.DELETE("/:id", web.MailboxProxy)                     // delete
		emails.POST("/:id/trash", web.MailboxProxy)                 // trash
		emails.POST("/:id/untrash", web.MailboxProxy)               // untrash
		emails.POST("/:id/send", web.MailboxProxy)                  // send
	}

	// misc routes
	r.GET("/ping", misc.Ping)
	r.GET("/info", misc.Info)

	r.NoRoute(func(c *gin.Context) {
		if strings.HasPrefix(c.Request.URL.Path, "/assets/") {
			c.File(filepath.Join(config.STATIC_DIR, c.Request.URL.Path))
		} else {
			c.File(config.INDEX_HTML)
		}
	})

	return r
}
