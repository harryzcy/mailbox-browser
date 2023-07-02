package misc

import (
	"github.com/gin-gonic/gin"
	"github.com/harryzcy/mailbox-browser/bff/config"
)

func Config(c *gin.Context) {
	c.JSON(200, gin.H{
		"emailAddresses": config.EMAIL_ADDRESSES,
		"disableProxy":   !config.PROXY_ENABLE,
	})
}
