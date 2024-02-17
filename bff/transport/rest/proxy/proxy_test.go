package proxy

import (
	"net/http"
	"net/http/httptest"
	"os"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/harryzcy/mailbox-browser/bff/config"
	"github.com/stretchr/testify/assert"
)

func TestProxy(t *testing.T) {
	original := config.ProxyEnable
	config.ProxyEnable = false
	defer func() {
		config.ProxyEnable = original
	}()

	w := httptest.NewRecorder()
	ctx, _ := gin.CreateTestContext(w)

	Proxy(ctx)
	assert.Equal(t, http.StatusForbidden, w.Code)
}

func TestMain(m *testing.M) {
	gin.SetMode(gin.TestMode)
	os.Exit(m.Run())
}
