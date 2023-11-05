package config

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"

	"github.com/stretchr/testify/assert"
)

func startServer(t *testing.T) *httptest.Server {
	chdir("")
	schemaPath := "../docs/plugin/schema.example.json"

	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		file, err := os.ReadFile(schemaPath)
		assert.Nil(t, err)

		var decoded map[string]interface{}
		err = json.Unmarshal(file, &decoded)
		assert.Nil(t, err)
		decoded["configURL"] = fmt.Sprintf("http://%s%s", r.Host, r.URL.Path)

		file, err = json.Marshal(decoded)
		assert.Nil(t, err)

		_, err = w.Write(file)
		assert.Nil(t, err)
	}))

	return server
}

func TestLoadPluginConfigs(t *testing.T) {
	server := startServer(t)
	defer server.Close()

	originalPluginConfigs := PLUGIN_CONFIGS
	defer func() {
		PLUGIN_CONFIGS = originalPluginConfigs
	}()

	PLUGIN_CONFIGS = []string{server.URL + "/"}

	err := LoadPluginConfigs()
	assert.Nil(t, err)

	assert.Equal(t, 1, len(Plugins))
	assert.Equal(t, "plugin-name", Plugins[0].Name)
}
