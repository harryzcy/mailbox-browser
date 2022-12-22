//go:build dev

package web

import (
	"math/rand"
	"net/http"
	"sort"
	"strconv"
	"strings"
	"time"

	"github.com/brianvoe/gofakeit/v6"
	"github.com/gin-gonic/gin"
)

func init() {
	// named email: FirstName LastName <email>
	gofakeit.AddFuncLookup("namedemail", gofakeit.Info{
		Category: "person",
		Display:  "Named email",
		Example:  "John Doe <john@example.com>",
		Output:   "string",
		Generate: func(r *rand.Rand, m *gofakeit.MapParams, info *gofakeit.Info) (interface{}, error) {
			return gofakeit.Name() + " <" + gofakeit.Email() + ">", nil
		},
	})
}

func MailboxProxy(ctx *gin.Context) {
	method := ctx.Request.Method
	path := strings.TrimPrefix(ctx.Request.URL.Path, "/web")

	// action verbs
	if method == http.MethodPost && strings.HasPrefix(path, "/emails/") && strings.HasSuffix(path, "/send") {
		resp := fakeSend(ctx)
		ctx.JSON(http.StatusOK, resp)
		return
	}
	if method == http.MethodPost && strings.HasPrefix(path, "/emails/") && strings.HasSuffix(path, "/untrash") {
		resp := fakeUntrash(ctx)
		ctx.JSON(http.StatusOK, resp)
		return
	}
	if method == http.MethodPost && strings.HasPrefix(path, "/emails/") && strings.HasSuffix(path, "/trash") {
		resp := fakeTrash(ctx)
		ctx.JSON(http.StatusOK, resp)
		return
	}

	// without action verbs
	if method == http.MethodGet && path == "/emails" {
		resp := fakeList(ctx)
		ctx.JSON(http.StatusOK, resp)
		return
	}
	if method == http.MethodGet && strings.HasPrefix(path, "/emails/") {
		resp := fakeGet(ctx)
		ctx.JSON(http.StatusOK, resp)
		return
	}
	if method == http.MethodPost && path == "/emails" {
		resp := fakeCreate(ctx)
		ctx.JSON(http.StatusOK, resp)
		return
	}
	if method == http.MethodPost && strings.HasPrefix(path, "/emails/") {
		resp := fakeSave(ctx)
		ctx.JSON(http.StatusOK, resp)
		return
	}
	if method == http.MethodDelete && strings.HasPrefix(path, "/emails/") {
		resp := fakeDelete(ctx)
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

	yearStr := ctx.Query("year")
	monthStr := ctx.Query("month")
	var year int
	if yearStr != "" {
		year, _ = strconv.Atoi(yearStr)
	} else {
		year = time.Now().Year()
	}
	var month time.Month
	if monthStr != "" {
		monthInt, _ := strconv.Atoi(monthStr)
		month = time.Month(monthInt)
	} else {
		month = time.Now().Month()
	}

	startTime := time.Date(year, month, 0, 0, 0, 0, 0, time.UTC)
	endTime := startTime.AddDate(0, 1, -1)

	resp := ListEmailsResponse{
		Count: pageSize,
		Items: make([]ListEmailsItem, pageSize),
	}

	for i := 0; i < pageSize; i++ {
		var item ListEmailsItem
		gofakeit.Struct(&item)
		item.Type = ctx.Query("type")
		item.TimeReceived = gofakeit.DateRange(startTime, endTime).Format(time.RFC3339)
		resp.Items[i] = item
	}

	sort.Slice(resp.Items, func(i, j int) bool {
		return resp.Items[i].TimeReceived > resp.Items[j].TimeReceived
	})
	// sometime in the same day
	resp.Items[0].TimeReceived = time.Now().Format(time.RFC3339)
	// last year
	resp.Items[len(resp.Items)-1].TimeReceived = gofakeit.DateRange(startTime.AddDate(-1, 0, 0), endTime.AddDate(-1, 0, 0)).Format(time.RFC3339)

	return resp
}

type ListEmailsResponse struct {
	Count int              `json:"count"`
	Items []ListEmailsItem `json:"items"`
}

type ListEmailsItem struct {
	MessageID    string   `json:"messageID" fake:"{uuid}"`
	Type         string   `json:"type" fake:"skip"`
	Subject      string   `json:"subject" fake:"{sentence:10}"`
	From         []string `json:"from" fakesize:"1" fake:"{namedemail}"`
	To           []string `json:"to" fakesize:"1" fake:"{namedemail}"`
	TimeReceived string   `json:"timeReceived" fake:"{date}"`
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
	From      []string `json:"from" fakesize:"1" fake:"{namedemail}"`
	To        []string `json:"to" fakesize:"1" fake:"{namedemail}"`
	Text      string   `json:"text" fake:"{sentence: 50}"`
	HTML      string   `json:"html" fake:"{sentence: 50}"`

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

func fakeCreate(ctx *gin.Context) CreateResult {
	var input CreateInput
	if err := ctx.ShouldBindJSON(&input); err != nil {
		reqBadInput(ctx)
	}

	resp := CreateResult{
		MessageID: gofakeit.UUID(),
		Subject:   input.Subject,
		From:      input.From,
		To:        input.To,
		Cc:        input.Cc,
		Bcc:       input.Bcc,
		ReplyTo:   input.ReplyTo,
		Text:      input.Text,
		HTML:      input.HTML,
	}
	if input.Send {
		resp.Type = "sent"
		resp.TimeSent = gofakeit.Date().Format(time.RFC3339)
	} else {
		resp.Type = "draft"
		resp.TimeUpdated = gofakeit.Date().Format(time.RFC3339)
	}
	if (input.GenerateText == "on") || (input.GenerateText == "auto" && input.Text == "") {
		resp.Text = gofakeit.Sentence(50)
	}

	return resp
}

type EmailInput struct {
	MessageID string   `json:"messageID"`
	Subject   string   `json:"subject"`
	From      []string `json:"from"`
	To        []string `json:"to"`
	Cc        []string `json:"cc"`
	Bcc       []string `json:"bcc"`
	ReplyTo   []string `json:"replyTo"`
	Text      string   `json:"text"`
	HTML      string   `json:"html"`
}

type CreateInput struct {
	EmailInput
	GenerateText string `json:"generateText"`
	Send         bool   `json:"send"`
}

type EmailResult struct {
	MessageID string `json:"messageID"`
	Type      string `json:"type"`

	// TimeReceived is used by inbox emails
	TimeReceived string `json:"timeReceived,omitempty"`
	// TimeUpdated is used by draft emails
	TimeUpdated string `json:"timeUpdated,omitempty"`
	// TimeSent is used by sent emails
	TimeSent string `json:"timeSent,omitempty"`

	Subject string   `json:"subject"`
	From    []string `json:"from"`
	To      []string `json:"to"`
	Cc      []string `json:"cc"`
	Bcc     []string `json:"bcc"`
	ReplyTo []string `json:"replyTo"`
	Text    string   `json:"text"`
	HTML    string   `json:"html"`
}

type CreateResult = EmailResult

func fakeSave(ctx *gin.Context) SaveResult {
	var input SaveInput
	if err := ctx.ShouldBindJSON(&input); err != nil {
		reqBadInput(ctx)
	}

	resp := SaveResult{
		MessageID: input.MessageID,
		Subject:   input.Subject,
		From:      input.From,
		To:        input.To,
		Cc:        input.Cc,
		Bcc:       input.Bcc,
		ReplyTo:   input.ReplyTo,
		Text:      input.Text,
		HTML:      input.HTML,
	}
	if input.Send {
		resp.Type = "sent"
		resp.TimeSent = gofakeit.Date().Format(time.RFC3339)
	} else {
		resp.Type = "draft"
		resp.TimeUpdated = gofakeit.Date().Format(time.RFC3339)
	}
	if (input.GenerateText == "on") || (input.GenerateText == "auto" && input.Text == "") {
		resp.Text = gofakeit.Sentence(50)
	}

	return resp
}

type SaveInput struct {
	EmailInput
	GenerateText string `json:"generateText"` // on, off, or auto (default)
	Send         bool   `json:"send"`         // send email immediately
}

type SaveResult = EmailResult

func fakeDelete(ctx *gin.Context) StatusResponse {
	return StatusResponse{
		Status: "success",
	}
}

func fakeTrash(ctx *gin.Context) StatusResponse {
	return StatusResponse{
		Status: "success",
	}
}

func fakeUntrash(ctx *gin.Context) StatusResponse {
	return StatusResponse{
		Status: "success",
	}
}

func fakeSend(ctx *gin.Context) SendResult {
	return SendResult{
		MessageID: gofakeit.UUID(),
	}
}

type SendResult struct {
	MessageID string
}

type StatusResponse struct {
	Status string `json:"status"`
}

func reqBadInput(ctx *gin.Context) {
	ctx.JSON(http.StatusBadRequest, gin.H{
		"error": "bad input",
	})
}

func reqError(ctx *gin.Context, err error) {
	ctx.JSON(http.StatusInternalServerError, gin.H{
		"error": err.Error(),
	})
}
