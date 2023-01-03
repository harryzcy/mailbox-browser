package misc

import (
	"github.com/gin-gonic/gin"
)

var (
	version   = "dev"
	commit    = "n/a"
	buildTime = "n/a"
)

func Ping(c *gin.Context) {
	c.JSON(200, gin.H{
		"message": "pong",
	})
}

func Info(c *gin.Context) {
	c.JSON(200, gin.H{
		"version": version,
		"commit":  commit,
		"build":   buildTime,
	})
}
