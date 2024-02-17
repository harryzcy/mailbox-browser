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
	wd, err := os.Getwd()
	if err != nil {
		panic(err)
	}
	for !strings.HasSuffix(wd, "/bff") {
		err = os.Chdir("..")
		if err != nil {
			panic(err)
		}

		wd, err = os.Getwd()
		if err != nil {
			panic(err)
		}
	}

	if dir != "" {
		err = os.Chdir(dir)
		if err != nil {
			panic(err)
		}
	}
}

func TestLoad(t *testing.T) {
	chdir("testdata")
	defer chdir("")

	logger, err := zap.NewDevelopment()
	assert.NoError(t, err)

	err = load(logger)
	assert.NoError(t, err)
	assert.Equal(t, "/static", StaticDir)
	assert.Equal(t, "/static/index.html", IndexHTML)
	assert.Equal(t, "us-west-2", AWSRegion)
	assert.Equal(t, "example-key-id", AWSAccessKeyID)
	assert.Equal(t, "example-secret-key", AWSSecretAccessKey)
	assert.Equal(t, "https://example.com", AWSAPIGatewayEndpoint)
	assert.Equal(t, []string{"example.com", "example.org"}, EmailAddresses)
	assert.True(t, ProxyEnable)
	assert.Equal(t, "https://example.com/plugin1", PluginConfigs[0])
	assert.Equal(t, "https://example.com/plugin2", PluginConfigs[1])
}

func TestLoad_NoFile(t *testing.T) {
	chdir("config")
	defer chdir("")

	logger, err := zap.NewDevelopment()
	assert.NoError(t, err)

	err = load(logger)
	assert.NoError(t, err)
	assert.Equal(t, "", StaticDir)
	assert.Equal(t, "", AWSRegion)
	assert.Equal(t, "", AWSAccessKeyID)
	assert.Equal(t, "", AWSSecretAccessKey)
	assert.Equal(t, "", AWSAPIGatewayEndpoint)
	assert.Equal(t, []string{""}, EmailAddresses)
	assert.True(t, ProxyEnable)
}

func TestLoad_ViperError(t *testing.T) {
	chdir("testdata")
	configName = "error"
	defer chdir("")
	defer func() {
		configName = "config"
	}()

	logger, err := zap.NewDevelopment()
	assert.NoError(t, err)

	err = load(logger)
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
