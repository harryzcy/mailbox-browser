package web

import (
	"context"
	"crypto/sha256"
	"errors"
	"fmt"
	"net/http"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	v4 "github.com/aws/aws-sdk-go-v2/aws/signer/v4"
)

var (
	ErrMissingCredentials = errors.New("no credentials provided")
)

type SignSDKRequestOptions struct {
	Credentials aws.CredentialsProvider
	Payload     []byte
	Region      string
	Verbose     bool
}

func SignSDKRequest(ctx context.Context, req *http.Request, options *SignSDKRequestOptions) error {
	payloadHash := hashPayload(options.Payload)
	if options.Credentials == nil {
		if options.Verbose {
			fmt.Printf("[DEBUG] No credentials provided\n")
		}
		return ErrMissingCredentials
	}

	if options.Verbose {
		fmt.Printf("[DEBUG] Credential Function: %T\n", options.Credentials)
	}

	credentials, err := options.Credentials.Retrieve(ctx)
	if err != nil {
		if options.Verbose {
			fmt.Printf("[DEBUG] Error retrieving credentials: %s\n", err)
		}
		return err
	}

	if options.Verbose {
		fmt.Printf("[DEBUG] Signing request\n")
	}

	signer := v4.NewSigner()
	err = signer.SignHTTP(ctx,
		credentials, req, payloadHash, "execute-api", options.Region, time.Now(),
	)
	if err != nil {
		if options.Verbose {
			fmt.Printf("[DEBUG] Error signing request: %s\n", err)
		}
		return err
	}

	return nil
}

// hashPayload returns the hex-encoded SHA256 hash of the payload.
func hashPayload(payload []byte) string {
	h := sha256.New()
	h.Write(payload)
	return fmt.Sprintf("%x", h.Sum(nil))
}
