package misc

import (
	"github.com/gin-gonic/gin"
)

func Robots(c *gin.Context) {
	c.String(200, "User-agent: *\nDisallow: /")
}
