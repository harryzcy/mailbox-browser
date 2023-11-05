package config

import (
	"net/http"
	"net/http/httptest"
	"os"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestLoadPluginConfigs(t *testing.T) {
	chdir("")

	schemaPath := "../docs/plugin/schema.example.json"

	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		file, err := os.ReadFile(schemaPath)
		assert.Nil(t, err)

		_, err = w.Write(file)
		assert.Nil(t, err)
	}))
	defer server.Close()

	originalPluginConfigs := PLUGIN_CONFIGS
	defer func() {
		PLUGIN_CONFIGS = originalPluginConfigs
	}()

	PLUGIN_CONFIGS = []string{server.URL}

	err := LoadPluginConfigs()
	assert.Nil(t, err)

	assert.Equal(t, 1, len(Plugins))
	assert.Equal(t, "plugin-name", Plugins[0].Name)
}
