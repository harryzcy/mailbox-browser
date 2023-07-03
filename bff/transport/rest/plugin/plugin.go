package plugin

import (
	"bytes"
	"encoding/json"
	"errors"
	"net/http"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/gin-gonic/gin"
	"github.com/harryzcy/mailbox-browser/bff/config"
	"github.com/harryzcy/mailbox-browser/bff/request"
	"github.com/harryzcy/mailbox-browser/bff/types"
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

	plugin := findPluginByName(req.Name)
	if plugin == nil {
		c.JSON(400, gin.H{
			"status": "error",
			"reason": "plugin not found",
		})
		return
	}

	emails, err := getEmails(c, req.MessageIDs)
	if err != nil {
		c.JSON(500, gin.H{
			"status": "error",
			"reason": "failed to get emails",
		})
		return
	}

	client := http.Client{
		Timeout: 10 * time.Second,
	}
	err = invokePlugin(client, plugin, emails)
	if err != nil {
		c.JSON(500, gin.H{
			"status": "error",
			"reason": "failed to invoke plugin",
		})
		return
	}

	c.JSON(200, gin.H{
		"status": "ok",
	})
}

// findPluginByName finds a plugin by name from the config.PLUGINS slice.
// It returns nil if the plugin is not found.
func findPluginByName(name string) *config.Plugin {
	for _, plugin := range config.PLUGINS {
		if plugin.Name == name {
			return &plugin
		}
	}
	return nil
}

func getEmails(ctx *gin.Context, emailIDs []string) ([]types.Email, error) {
	var emails []types.Email

	for _, emailID := range emailIDs {
		resp, err := request.AWSRequest(ctx, request.RequestOptions{
			Method:   "GET",
			Endpoint: config.AWS_API_GATEWAY_ENDPOINT,
			Path:     "/emails/" + emailID,
			Region:   config.AWS_REGION,
			Credentials: credentials.StaticCredentialsProvider{
				Value: aws.Credentials{
					AccessKeyID:     config.AWS_ACCESS_KEY_ID,
					SecretAccessKey: config.AWS_SECRET_ACCESS_KEY,
				},
			},
		})
		if err != nil {
			return nil, err
		}
		defer resp.Body.Close()

		var email types.Email
		err = json.NewDecoder(resp.Body).Decode(&email)
		if err != nil {
			return nil, err
		}

		emails = append(emails, email)
	}

	return emails, nil
}

func invokePlugin(client http.Client, plugin *config.Plugin, emails []types.Email) error {
	if len(emails) == 0 {
		return nil
	}

	var url string
	var body []byte
	if len(emails) == 1 {
		url = plugin.Endpoints.Email
		var err error
		body, err = json.Marshal(emails[0])
		if err != nil {
			return err
		}
	} else {
		// more than 1 email
		url = plugin.Endpoints.Emails
		if url == "" {
			return errors.New("batch email endpoint not found")
		}

		var err error
		body, err = json.Marshal(emails)
		if err != nil {
			return err
		}
	}

	_, err := client.Post(url, "application/json", bytes.NewReader(body))
	if err != nil {
		return err
	}
	return nil
}
