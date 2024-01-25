import { parseEmailName } from 'utils/emails'

export default function EmailName({
  emails,
  showAddress = false
}: {
  emails: string[] | null
  showAddress?: boolean
}) {
  const parsed = parseEmailName(emails)
  if (parsed.name === null && parsed.address === null) return null

  if (parsed.name === null) return parsed.address ?? ''
  if (parsed.address === null) return parsed.name

  return (
    <>
      <span className="">{parsed.name}</span>
      {showAddress && (
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {' '}
          &lt;{parsed.address}&gt;
        </span>
      )}
    </>
  )
}
