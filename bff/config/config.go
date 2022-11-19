package config

import (
	"os"
	"path/filepath"
)

var (
	STATIC_DIR = os.Getenv("STATIC_DIR")
	INDEX_HTML = filepath.Join(STATIC_DIR, "index.html")

	MAILBOX_URL = os.Getenv("MAILBOX_URL")
)
