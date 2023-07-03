package plugin

import (
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"

	"github.com/harryzcy/mailbox-browser/bff/config"
)

func TestMain(m *testing.M) {
	gin.SetMode(gin.TestMode)

	m.Run()
}

func TestFindPluginByName(t *testing.T) {
	originalPlugins := config.PLUGINS
	defer func() {
		config.PLUGINS = originalPlugins
	}()

	config.PLUGINS = []config.Plugin{
		{
			Name: "plugin1",
		},
		{
			Name: "plugin2",
		},
	}

	plugin := findPluginByName("plugin1")
	assert.Equal(t, "plugin1", plugin.Name)
	plugin = findPluginByName("plugin2")
	assert.Equal(t, "plugin2", plugin.Name)
	plugin = findPluginByName("plugin3")
	assert.Nil(t, plugin)
}
