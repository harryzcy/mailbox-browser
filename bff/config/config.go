package config

import (
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"strings"

	"github.com/spf13/viper"
	"go.uber.org/zap"
)

var (
	STATIC_DIR string
	INDEX_HTML string

	AWS_REGION               string
	AWS_ACCESS_KEY_ID        string
	AWS_SECRET_ACCESS_KEY    string
	AWS_API_ID               string
	AWS_API_GATEWAY_ENDPOINT string

	EMAIL_ADDRESSES []string
	PROXY_ENABLE    bool

	PLUGINS []Plugin
)

type Plugin struct {
	Name        string `json:"name"`
	DisplayName string `json:"displayName"`
	Endpoints   struct {
		Email  string `json:"email"`
		Emails string `json:"emails"`
	} `json:"endpoints"`
}

func Init(logger *zap.Logger) {
	v := viper.New()
	v.SetConfigName("config")
	v.SetConfigType("yaml")
	v.AddConfigPath(".")

	err := v.ReadInConfig()
	if err != nil {
		var notFound viper.ConfigFileNotFoundError
		if errors.As(err, &notFound) {
			logger.Info("No config file found, using environment variables")
		} else {
			logger.Fatal("Fatal error config file", zap.Error(err))
		}
	}

	STATIC_DIR = getString(v, "static.dir", "STATIC_DIR")
	INDEX_HTML = filepath.Join(STATIC_DIR, "index.html")

	AWS_REGION = getString(v, "aws.region", "AWS_REGION")
	AWS_ACCESS_KEY_ID = getString(v, "aws.accessKeyID", "AWS_ACCESS_KEY_ID")
	AWS_SECRET_ACCESS_KEY = getString(v, "aws.secretAccessKey", "AWS_SECRET_ACCESS_KEY")
	AWS_API_GATEWAY_ENDPOINT = getString(v, "aws.apiGateway.endpoint", "AWS_API_GATEWAY_ENDPOINT")
	AWS_API_ID = getString(v, "aws.apiGateway.apiID", "AWS_API_ID")

	// comma separated list of email addresses or domains, required for email replies
	EMAIL_ADDRESSES = strings.Split(getString(v, "email.addresses", "EMAIL_ADDRESSES"), ",")

	PROXY_ENABLE = getBool(v, "proxy.enable", "ENABLE_PROXY", true)

	err = v.UnmarshalKey("plugins", &PLUGINS)
	if err != nil {
		logger.Fatal("Fatal error unmarshaling plugins", zap.Error(err))
	}

	fmt.Println(PLUGINS)
}

func getString(v *viper.Viper, key, env string) string {
	if v.IsSet(key) {
		return v.GetString(key)
	}
	return os.Getenv(env)
}

func getBool(v *viper.Viper, key, env string, defaultValue bool) bool {
	if v.IsSet(key) {
		return v.GetBool(key)
	}

	if value, ok := os.LookupEnv(env); ok {
		return value == "true"
	}

	return defaultValue
}
