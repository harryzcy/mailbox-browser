export function getNameFromEmails(emails: string[] | null): string {
  if (!emails || emails.length === 0) {
    return ''
  }
  const regex = /(.*?) ?<.*?>/g
  const match = regex.exec(emails[0])
  if (match) {
    return match[1]
  }
  return emails[0]
}
