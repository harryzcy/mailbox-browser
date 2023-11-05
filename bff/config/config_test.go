package config

import (
	"os"
	"strings"
	"testing"

	"github.com/spf13/viper"
	"github.com/stretchr/testify/assert"
	"go.uber.org/zap"
)

func chdir(dir string) {
	wd, _ := os.Getwd()
	for !strings.HasSuffix(wd, "/bff") {
		_ = os.Chdir("..")

		wd, _ = os.Getwd()
	}

	if dir != "" {
		_ = os.Chdir(dir)
	}
}

func TestLoad(t *testing.T) {
	chdir("testdata")
	defer chdir("")

	logger, _ := zap.NewDevelopment()
	err := load(logger)
	assert.NoError(t, err)
	assert.Equal(t, "/static", STATIC_DIR)
	assert.Equal(t, "/static/index.html", INDEX_HTML)
	assert.Equal(t, "us-west-2", AWS_REGION)
	assert.Equal(t, "example-key-id", AWS_ACCESS_KEY_ID)
	assert.Equal(t, "example-secret-key", AWS_SECRET_ACCESS_KEY)
	assert.Equal(t, "app-id", AWS_API_ID)
	assert.Equal(t, "https://example.com", AWS_API_GATEWAY_ENDPOINT)
	assert.Equal(t, []string{"example.com", "example.org"}, EMAIL_ADDRESSES)
	assert.True(t, PROXY_ENABLE)
	assert.Equal(t, "https://example.com/plugin1", PLUGIN_CONFIGS[0])
	assert.Equal(t, "https://example.com/plugin2", PLUGIN_CONFIGS[1])
}

func TestLoad_NoFile(t *testing.T) {
	chdir("config")
	defer chdir("")

	logger, _ := zap.NewDevelopment()
	err := load(logger)
	assert.NoError(t, err)
	assert.Equal(t, "", STATIC_DIR)
	assert.Equal(t, "", AWS_REGION)
	assert.Equal(t, "", AWS_ACCESS_KEY_ID)
	assert.Equal(t, "", AWS_SECRET_ACCESS_KEY)
	assert.Equal(t, "", AWS_API_ID)
	assert.Equal(t, "", AWS_API_GATEWAY_ENDPOINT)
	assert.Equal(t, []string{""}, EMAIL_ADDRESSES)
	assert.True(t, PROXY_ENABLE)
}

func TestLoad_ViperError(t *testing.T) {
	chdir("testdata")
	configName = "error"
	defer chdir("")
	defer func() {
		configName = "config"
	}()

	logger, _ := zap.NewDevelopment()
	err := load(logger)
	assert.Error(t, err)
}

func TestGetString(t *testing.T) {
	v := viper.New()
	v.Set("key", "value")
	assert.Equal(t, "value", getString(v, "key", ""))

	os.Setenv("key2", "value2")
	assert.Equal(t, "value2", getString(v, "key2", "key2"))
}

func TestGetBool(t *testing.T) {
	v := viper.New()
	v.Set("key", true)
	assert.True(t, getBool(v, "key", "", false))

	os.Setenv("key2", "true")
	assert.True(t, getBool(v, "key2", "key2", false))

	os.Setenv("key3", "false")
	assert.False(t, getBool(v, "key3", "key3", true))

	assert.True(t, getBool(v, "key4", "key4", true))
}
