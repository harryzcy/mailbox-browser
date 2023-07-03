package ginutil

import "github.com/gin-gonic/gin"

func InternalError(c *gin.Context, err error) {
	c.JSON(500, gin.H{
		"error": err.Error(),
	})
}

func BadRequest(c *gin.Context, err error) {
	c.JSON(400, gin.H{
		"error": err.Error(),
	})
}

func Success(c *gin.Context) {
	c.JSON(200, gin.H{
		"status": "success",
	})
}
