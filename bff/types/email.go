package types

type Email struct {
	MessageID     string   `json:"messageID"`
	Type          string   `json:"type"`
	Subject       string   `json:"subject"`
	FromAddresses []string `json:"from"`
	ToAddresses   []string `json:"to"`
	Destination   []string `json:"destination"`
	TimeReceived  string   `json:"timeReceived"`
	DateSent      string   `json:"dateSent"`
	Source        string   `json:"source"`
	ReturnPath    string   `json:"returnPath"`
	Text          string   `json:"text"`
	HTML          string   `json:"html"`
}
