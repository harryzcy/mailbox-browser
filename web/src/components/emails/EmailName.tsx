export default function EmailName({
  emails,
  showAddress = false
}: {
  emails: string[] | null
  showAddress?: boolean
}) {
  if (!emails || emails.length === 0) {
    return null
  }

  const regex = /(.*?)<(.*?)>/g
  const match = regex.exec(emails[0])
  if (match) {
    if (match[1].trim() === '') {
      return match[2].trim()
    }
    if (!showAddress) return match[1].trim()
    return (
      <>
        <span className="">{match[1].trim()}</span>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {' '}
          &lt;{match[2].trim()}&gt;
        </span>
      </>
    )
  }
  return emails[0]
}
