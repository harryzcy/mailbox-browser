package plugin

import "errors"

var (
	ErrPluginNotFound = errors.New("plugin not found")
	ErrEmailGetFailed = errors.New("failed to get email")
	ErrInvokePlugin   = errors.New("failed to invoke plugin")
)
