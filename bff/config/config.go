package config

import (
	"os"
	"path/filepath"
)

var (
	STATIC_DIR = os.Getenv("STATIC_DIR")
	INDEX_HTML = filepath.Join(STATIC_DIR, "index.html")

	MAILBOX_URL           = os.Getenv("MAILBOX_URL")
	AWS_ACCESS_KEY_ID     = os.Getenv("AWS_ACCESS_KEY_ID")
	AWS_SECRET_ACCESS_KEY = os.Getenv("AWS_SECRET_ACCESS_KEY")
)
