package idgen

import (
	"fmt"
	"os"

	"go.zcy.dev/go-uid"
)

var gen *uid.Generator

func init() {
	var err error
	gen, err = uid.NewGenerator(0)
	if err != nil {
		fmt.Fprintf(os.Stderr, "failed to initialize id generator: %v\n", err)
		os.Exit(1)
	}

}

func NewID() uid.UID {
	return gen.Get()
}
