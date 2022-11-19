package rest

import (
	"time"

	ginzap "github.com/gin-contrib/zap"
	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

func Init(logger *zap.Logger, mode string) *gin.Engine {
	logger.Info("initializing REST APIs...",
		zap.String("type", "server-status"),
	)

	if mode == "prod" {
		gin.SetMode(gin.ReleaseMode)
	}

	r := gin.New()
	r.Use(ginzap.Ginzap(logger, time.RFC3339, true), ginzap.RecoveryWithZap(logger, true))

	return r
}
