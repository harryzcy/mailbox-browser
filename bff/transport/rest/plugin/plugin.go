package plugin

import (
	"bytes"
	"encoding/json"
	"errors"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/harryzcy/mailbox-browser/bff/config"
	"github.com/harryzcy/mailbox-browser/bff/request"
	"github.com/harryzcy/mailbox-browser/bff/transport/rest/ginutil"
	"github.com/harryzcy/mailbox-browser/bff/types"
)

type InvokeRequest struct {
	Name       string   `json:"name"`
	MessageIDs []string `json:"messageIDs"`
}

// TODO: Rework this.
func Invoke(c *gin.Context) {
	var req InvokeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		ginutil.BadRequest(c, err)
		return
	}

	plugin := findPluginByName(req.Name)
	if plugin == nil {
		ginutil.BadRequest(c, ErrPluginNotFound)
		return
	}

	emails, err := getEmails(c, req.MessageIDs)
	if err != nil {
		ginutil.InternalError(c, ErrEmailGetFailed)
		return
	}

	client := http.Client{
		Timeout: 10 * time.Second,
	}
	err = invokePlugin(client, plugin, emails)
	if err != nil {
		ginutil.InternalError(c, ErrInvokePlugin)
		return
	}

	ginutil.Success(c)
}

// findPluginByName finds a plugin by name from the config.PLUGINS slice.
// It returns nil if the plugin is not found.
func findPluginByName(name string) *config.Plugin {
	for _, plugin := range config.Plugins {
		if plugin.Name == name {
			return plugin
		}
	}
	return nil
}

func getEmails(ctx *gin.Context, emailIDs []string) ([]types.Email, error) {
	var emails []types.Email

	for _, emailID := range emailIDs {
		resp, err := request.AWSRequest(ctx, request.RequestOptions{
			Method: "GET",
			Path:   "/emails/" + emailID,
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

	var body []byte

	if len(emails) == 1 {
		var err error
		body, err = json.Marshal(emails[0])
		if err != nil {
			return err
		}
	} else {
		// more than 1 email
		if plugin.HookURL == "" {
			return errors.New("batch email endpoint not found")
		}

		var err error
		body, err = json.Marshal(emails)
		if err != nil {
			return err
		}
	}

	_, err := client.Post(plugin.HookURL, "application/json", bytes.NewReader(body))
	if err != nil {
		return err
	}
	return nil
}
