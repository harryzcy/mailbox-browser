//go:build dev

package web

import (
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/brianvoe/gofakeit/v6"
	"github.com/gin-gonic/gin"
)

func MailboxProxy(ctx *gin.Context) {
	method := ctx.Request.Method
	path := strings.TrimPrefix(ctx.Request.URL.Path, "/web")

	if method == http.MethodGet && path == "/emails" {
		resp := fakeList(ctx)
		ctx.JSON(http.StatusOK, resp)
		return
	} else if method == http.MethodGet && strings.HasPrefix(path, "/emails/") {
		resp := fakeGet(ctx)
		ctx.JSON(http.StatusOK, resp)
		return
	}

	ctx.JSON(http.StatusNotFound, gin.H{
		"error": "not found",
	})
}

func fakeList(ctx *gin.Context) ListEmailsResponse {
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

	return resp
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

func fakeGet(ctx *gin.Context) GetEmailResponse {
	var resp GetEmailResponse
	gofakeit.Struct(&resp)

	resp.MessageID = ctx.Param("id")
	resp.Type = gofakeit.RandomString([]string{"inbox", "draft"})
	if resp.Type == "inbox" {
		resp.TimeReceived = gofakeit.Date().Format(time.RFC3339)
		resp.DateSent = gofakeit.Date().Format(time.RFC3339)
		resp.Source = gofakeit.Email()
		resp.Destination = []string{gofakeit.Email()}
		resp.ReturnPath = gofakeit.Email()

		var verdict EmailVerdict
		gofakeit.Struct(&verdict)
		resp.Verdict = &verdict
	} else {
		resp.TimeUpdated = gofakeit.Date().Format(time.RFC3339)
		resp.Cc = []string{gofakeit.Email()}
		resp.Bcc = []string{gofakeit.Email()}
		resp.ReplyTo = []string{gofakeit.Email()}
	}
	return resp
}

type GetEmailResponse struct {
	MessageID string   `json:"messageID" fake:"skip"`
	Type      string   `json:"type" fake:"skip"`
	Subject   string   `json:"subject" fake:"{sentence:10}"`
	From      []string `json:"from" fakesize:"1" fake:"{email}"`
	To        []string `json:"to" fakesize:"1" fake:"{email}"`
	Text      string   `json:"text" fake:"{sentence: 100}"`
	HTML      string   `json:"html" fake:"{sentence: 100}"`

	// Inbox email attributes
	TimeReceived string        `json:"timeReceived,omitempty" fake:"skip"`
	DateSent     string        `json:"dateSent,omitempty" fake:"skip"`
	Source       string        `json:"source,omitempty" fake:"skip"`
	Destination  []string      `json:"destination,omitempty" fake:"skip"`
	ReturnPath   string        `json:"returnPath,omitempty" fake:"skip"`
	Verdict      *EmailVerdict `json:"verdict,omitempty" fake:"skip"`

	// Draft email attributes
	TimeUpdated string   `json:"timeUpdated,omitempty" fake:"skip"`
	Cc          []string `json:"cc,omitempty" fake:"skip"`
	Bcc         []string `json:"bcc,omitempty" fake:"skip"`
	ReplyTo     []string `json:"replyTo,omitempty" fake:"skip"`
}

type EmailVerdict struct {
	Spam  bool `json:"spam" fake:"{bool}"`
	DKIM  bool `json:"dkim" fake:"{bool}"`
	DMARC bool `json:"dmarc" fake:"{bool}"`
	SPF   bool `json:"spf" fake:"{bool}"`
	Virus bool `json:"virus" fake:"{bool}"`
}

func reqError(ctx *gin.Context, err error) {
	ctx.JSON(http.StatusInternalServerError, gin.H{
		"error": err.Error(),
	})
}
