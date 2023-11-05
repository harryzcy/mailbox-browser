package config

var (
	Plugins []Plugin
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

// TODO: load config from web
func LoadConfigs() {
}
