package misc

import (
	"github.com/gin-gonic/gin"
	"github.com/harryzcy/mailbox-browser/bff/config"
)

func Config(c *gin.Context) {
	c.JSON(200, gin.H{
		"emailDomains": config.EMAIL_DOMAINS,
	})
}
