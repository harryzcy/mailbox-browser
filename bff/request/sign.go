package request

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

type signSDKRequestOptions struct {
	Credentials aws.CredentialsProvider
	Payload     []byte
	Region      string
}

func signSDKRequest(ctx context.Context, req *http.Request, options *signSDKRequestOptions) error {
	payloadHash := hashPayload(options.Payload)
	if options.Credentials == nil {
		return ErrMissingCredentials
	}

	credentials, err := options.Credentials.Retrieve(ctx)
	if err != nil {
		return err
	}

	signer := v4.NewSigner()
	err = signer.SignHTTP(ctx,
		credentials, req, payloadHash, "execute-api", options.Region, time.Now(),
	)
	if err != nil {
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
