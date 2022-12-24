export function getNameFromEmails(emails: string[]): string {
  const regex = /(.*?) ?<.*?>/g
  const match = regex.exec(emails[0])
  if (match) {
    return match[1]
  }
  return emails[0]
}
