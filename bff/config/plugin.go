package config

import (
	"encoding/json"
	"net/http"
	"time"
)

const (
	DEFAULT_HTTP_TIMEOUT = 10 * time.Second
)

var (
	Plugins []*Plugin
)

type Plugin struct {
	SchemaVersion string `json:"schemaVersion"`
	Name          string `json:"name"`
	DisplayName   string `json:"displayName"`
	Description   string `json:"description"`
	Author        string `json:"author"`
	Homepage      string `json:"homepage"`
	HookURL       string `json:"hookURL"`
	Hooks         []Hook `json:"hooks"`
}

// LoadConfigs loads all plugin configs from the urls in PLUGIN_CONFIGS.
func LoadConfigs() error {
	client := &http.Client{
		Timeout: DEFAULT_HTTP_TIMEOUT,
	}

	plugins := make([]*Plugin, len(PLUGIN_CONFIGS))
	for _, url := range PLUGIN_CONFIGS {
		plugin, err := LoadConfig(*client, url)
		if err != nil {
			return err
		}
		plugins = append(plugins, plugin)
	}

	Plugins = plugins
	return nil
}

// LoadConfig loads a plugin config from a url.
func LoadConfig(client http.Client, url string) (*Plugin, error) {
	resp, err := client.Get(url)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var plugin *Plugin
	err = json.NewDecoder(resp.Body).Decode(plugin)
	if err != nil {
		panic(err)
	}

	return plugin, nil
}
