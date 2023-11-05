package types

import "go.zcy.dev/go-uid"

type PluginWebhookPayload struct {
	ID        uid.UID       `json:"id"`
	Hook      HookInfo      `json:"hook"`
	Resources HookResources `json:"resources"`
}

type HookInfo struct {
	Name string `json:"name"`
}

type HookResources struct {
	Email     *Email  `json:"email,omitempty"`
	EmailList []Email `json:"emailList,omitempty"`
}
