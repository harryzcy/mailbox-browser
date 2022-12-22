//go:build dev

package web

import (
	"net/http"
	"strconv"
	"strings"

	"github.com/brianvoe/gofakeit/v6"
	"github.com/gin-gonic/gin"
)

func MailboxProxy(ctx *gin.Context) {
	method := ctx.Request.Method
	path := strings.TrimPrefix(ctx.Request.URL.Path, "/web")

	if method == http.MethodGet && path == "/emails" {
		pageSizeStr := ctx.Query("pageSize")
		pageSize := 100
		if pageSizeStr != "" {
			pageSize, _ = strconv.Atoi(pageSizeStr)
		}

		resp := ListEmailsResponse{
			Count: pageSize,
			Items: make([]ListEmailsItem, pageSize),
		}

		for i := 0; i < pageSize; i++ {
			var item ListEmailsItem
			gofakeit.Struct(&item)
			item.Type = ctx.Query("type")
			resp.Items[i] = item
		}

		ctx.JSON(http.StatusOK, resp)
		return
	}

	ctx.JSON(http.StatusNotFound, gin.H{
		"error": "not found",
	})
}

type ListEmailsResponse struct {
	Count int              `json:"count"`
	Items []ListEmailsItem `json:"items"`
}

type ListEmailsItem struct {
	MessageID string   `json:"messageID" fake:"{uuid}"`
	Type      string   `json:"type" fake:"skip"`
	Subject   string   `json:"subject" fake:"{sentence:10}"`
	From      []string `json:"from" fakesize:"1" fake:"{email}"`
	To        []string `json:"to" fakesize:"1" fake:"{email}"`
}

func reqError(ctx *gin.Context, err error) {
	ctx.JSON(http.StatusInternalServerError, gin.H{
		"error": err.Error(),
	})
}
