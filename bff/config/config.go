package config

import (
	"os"
	"path/filepath"
)

var (
	STATIC_DIR = os.Getenv("STATIC_DIR")
	INDEX_HTML = filepath.Join(STATIC_DIR, "index.html")

	AWS_API_GATEWAY_ENDPOINT = os.Getenv("AWS_API_GATEWAY_ENDPOINT")
	AWS_ACCESS_KEY_ID        = os.Getenv("AWS_ACCESS_KEY_ID")
	AWS_SECRET_ACCESS_KEY    = os.Getenv("AWS_SECRET_ACCESS_KEY")
	AWS_REGION               = os.Getenv("AWS_REGION")
	AWS_API_ID               = os.Getenv("AWS_API_ID")
)
