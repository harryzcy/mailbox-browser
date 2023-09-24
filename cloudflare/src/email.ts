export interface Email {
  messageID: string
  type: string
  subject: string
  fromAddresses: string[]
  toAddresses: string[]
  destination: string[]
  timeReceived: string
  dateSent: string
  source: string
  returnPath: string
  text: string
  html: string
}
