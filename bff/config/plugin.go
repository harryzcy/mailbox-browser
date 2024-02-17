package config

import (
	"encoding/json"
	"errors"
	"net/http"
	"time"
)

const (
	DefaultHTTPTimeout = 10 * time.Second
)

var (
	// Plugins is a list of all plugins, and may be nil if plugin config is invalid
	Plugins []*Plugin

	// ErrPluginConfigURLMismatch is returned when the plugin config url does not match
	// the url the config was loaded from
	ErrPluginConfigURLMismatch = errors.New("plugin config url mismatch")
)

// Plugin represents a plugin config.
type Plugin struct {
	SchemaVersion string `json:"schemaVersion"`
	Name          string `json:"name"`
	DisplayName   string `json:"displayName"`
	Description   string `json:"description"`
	Author        string `json:"author"`
	Homepage      string `json:"homepage"`
	ConfigURL     string `json:"configURL"`
	HookURL       string `json:"hookURL"`
	Hooks         []Hook `json:"hooks"`
}

// LoadPluginConfigs loads all plugin configs from the urls in PLUGIN_CONFIGS.
func LoadPluginConfigs() error {
	client := &http.Client{
		Timeout: DefaultHTTPTimeout,
	}

	plugins := make([]*Plugin, len(PluginConfigs))
	for i, url := range PluginConfigs {
		plugin, err := LoadPluginConfig(client, url)
		if err != nil {
			return err
		}
		plugins[i] = plugin
	}

	Plugins = plugins
	return nil
}

// LoadPluginConfig loads a plugin config from a url.
func LoadPluginConfig(client *http.Client, url string) (*Plugin, error) {
	resp, err := client.Get(url)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var plugin *Plugin

	err = json.NewDecoder(resp.Body).Decode(&plugin)
	if err != nil {
		return nil, err
	}

	if url != plugin.ConfigURL {
		return nil, ErrPluginConfigURLMismatch
	}

	return plugin, nil
}
