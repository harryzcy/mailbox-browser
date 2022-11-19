package main

import (
	"context"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/harryzcy/mailbox-browser/bff/transport/rest"
	"go.uber.org/zap"
)

func main() {
	// Initialize logger
	logger, _ := NewLogger()

	// Mode is either "dev" or "prod"
	mode := os.Getenv("MODE")
	if mode == "" {
		mode = "dev"
	}

	// Initialization
	r := rest.Init(logger, mode)

	logger.Info("starting server...",
		zap.String("type", "server-status"),
	)
	srv := &http.Server{
		Addr:    ":8070",
		Handler: r,
	}

	// Start server in a separate goroutine
	// and leave the main goroutine to handle the shutdown
	go func() {
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			logger.Fatal("ListenAndServe error",
				zap.String("type", "server-status"),
				zap.Error(err),
			)
		}
	}()

	// Create channel to listen to OS interrupt signals
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)

	// Wait for shutdown signal
	<-quit
	logger.Info("shutting down server...",
		zap.String("type", "server-status"),
	)

	// The context is used to inform the server that it has 5 seconds to finish
	// the request it is currently handling
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	if err := srv.Shutdown(ctx); err != nil {
		logger.Fatal("server forced to shutdown",
			zap.String("type", "server-status"),
			zap.Error(err),
		)
	}

	logger.Info("server stopped",
		zap.String("type", "server-status"),
	)
}

func NewLogger() (*zap.Logger, error) {
	cfg := zap.NewProductionConfig()
	paths := []string{"stderr"}
	if logPath := os.Getenv("LOG_PATH"); logPath != "" {
		paths = append(paths, logPath)
	}
	cfg.OutputPaths = paths

	return cfg.Build()
}
