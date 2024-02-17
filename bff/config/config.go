package config

import (
	"errors"
	"os"
	"path/filepath"
	"strings"

	"github.com/spf13/viper"
	"go.uber.org/zap"
)

var (
	StaticDir string
	IndexHTML string

	AWSRegion              string
	AWSAccessKeyID         string
	AWSSecretAccessKey     string
	AWS_API_ID             string
	AWS_APIGatewayEndpoint string

	EmailAddresses []string
	ProxyEnable    bool
	ImagesAutoLoad bool

	PluginConfigs []string // comma separated list of plugin config urls
)

type Hook struct {
	Type        string `json:"type"`
	Name        string `json:"name"`
	DisplayName string `json:"displayName"`
}

var (
	configName = "config"
)

func Init(logger *zap.Logger) error {
	err := load(logger)
	if err != nil {
		return err
	}

	err = LoadPluginConfigs()
	if err != nil {
		logger.Error("Fatal error loading plugin configs", zap.Error(err))
		return err
	}
	return nil
}

func load(logger *zap.Logger) error {
	v := viper.New()
	v.SetConfigName(configName)
	v.SetConfigType("yaml")
	v.AddConfigPath(".")

	err := v.ReadInConfig()
	if err != nil {
		var notFound viper.ConfigFileNotFoundError
		if errors.As(err, &notFound) {
			logger.Info("No config file found, using environment variables")
		} else {
			logger.Error("Fatal error config file", zap.Error(err))
			return err
		}
	}

	StaticDir = getString(v, "static.dir", "STATIC_DIR")
	IndexHTML = filepath.Join(StaticDir, "index.html")

	AWSRegion = getString(v, "aws.region", "AWS_REGION")
	AWSAccessKeyID = getString(v, "aws.accessKeyID", "AWS_ACCESS_KEY_ID")
	AWSSecretAccessKey = getString(v, "aws.secretAccessKey", "AWS_SECRET_ACCESS_KEY")
	AWS_APIGatewayEndpoint = strings.TrimSuffix(getString(v, "aws.apiGateway.endpoint", "AWS_API_GATEWAY_ENDPOINT"), "/")
	AWS_API_ID = getString(v, "aws.apiGateway.apiID", "AWS_API_ID")

	// comma separated list of email addresses or domains, required for email replies
	EmailAddresses = strings.Split(getString(v, "email.addresses", "EMAIL_ADDRESSES"), ",")

	ProxyEnable = getBool(v, "proxy.enable", "ENABLE_PROXY", true)
	ImagesAutoLoad = getBool(v, "images.autoLoad", "IMAGES_AUTO_LOAD", true)
	PluginConfigs = getStringSlice(v, "plugin.configs", "PLUGIN_CONFIGS")

	return nil
}

func getString(v *viper.Viper, key, env string) string {
	if value, ok := os.LookupEnv(env); ok {
		return value
	}
	if v.IsSet(key) {
		return v.GetString(key)
	}
	return ""
}

func getBool(v *viper.Viper, key, env string, defaultValue bool) bool {
	if value, ok := os.LookupEnv(env); ok {
		return value == "true"
	}

	if v.IsSet(key) {
		return v.GetBool(key)
	}

	return defaultValue
}

func getStringSlice(v *viper.Viper, key, env string) []string {
	if value, ok := os.LookupEnv(env); ok {
		value = strings.TrimSuffix(value, ",")
		return strings.Split(value, ",")
	}
	if v.IsSet(key) {
		return v.GetStringSlice(key)
	}
	return nil
}
