package misc

import (
	"github.com/gin-gonic/gin"
)

var (
	version   = "dev"
	commit    = "n/a"
	buildDate = "n/a"
)

func Info(c *gin.Context) {
	c.JSON(200, gin.H{
		"version": version,
		"commit":  commit,
		"build":   buildDate,
	})
}
