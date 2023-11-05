package idgen

import "go.zcy.dev/go-uid"

var gen, _ = uid.NewGenerator(0)

func NewID() uid.UID {
	return gen.Get()
}
