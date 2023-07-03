package plugin

import (
	"github.com/gin-gonic/gin"
)

type InvokeRequest struct {
	Name       string   `json:"name"`
	MessageIDs []string `json:"messageIDs"`
}

func Invoke(c *gin.Context) {
	var req InvokeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{
			"status": "error",
			"reason": "invalid request body",
		})
		return
	}

	c.JSON(200, gin.H{
		"status": "ok",
	})
}
