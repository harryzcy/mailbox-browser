package web

import (
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/harryzcy/mailbox-browser/bff/config"
)

func MailboxProxy(ctx *gin.Context) {
	method := ctx.Request.Method
	url := config.MAILBOX_URL + strings.TrimPrefix(ctx.Request.URL.Path, "/web")

	client := http.Client{
		Timeout: 10 * time.Second,
	}

	req, err := http.NewRequest(method, url, ctx.Request.Body)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})
		return
	}

	resp, err := client.Do(req)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})
		return
	}
	defer resp.Body.Close()
	ctx.DataFromReader(http.StatusOK, resp.ContentLength, resp.Header.Get("Content-Type"), resp.Body, nil)
}
