import { useEffect, useRef, useState } from 'react'
import EmailMenuBar from '../components/emails/EmailMenuBar'
import EmailTableView from '../components/emails/EmailTableView'
import { useOutsideClick } from '../hooks/useOutsideClick'
import { EmailInfo, listEmails } from '../services/emails'

export default function Inbox() {
  const [count, setCount] = useState<number>(0)
  const [hasMore, setHasMore] = useState<boolean>(true)
  const [nextCursor, setNextCursor] = useState<string | undefined>(undefined)
  const [emails, setEmails] = useState<EmailInfo[]>([])

  const [selected, setSelected] = useState<string[]>([])

  const [loadingState, setLoadingState] = useState<
    'idle' | 'loading' | 'loaded' | 'error'
  >('idle')

  const menuRef = useRef<HTMLDivElement>(null)
  const emailViewRef = useRef<HTMLDivElement>(null)
  useOutsideClick([menuRef, emailViewRef], () => {
    setSelected([])
  })

  useEffect(() => {
    const abortController = new AbortController()

    if (loadingState === 'idle') {
      setLoadingState('loading')
      loadEmails()
    }

    return () => abortController.abort()
  }, [])

  const loadEmails = async () => {
    const data = await listEmails({
      type: 'inbox',
      year: 2022,
      month: 12,
      order: 'desc'
    })
    setEmails(data.items)
    setCount(data.count)
    setHasMore(data.hasMore)
    setNextCursor(data.nextCursor)

    setLoadingState('loaded')
  }

  const toggleSelected = (messageID: string, action: 'add' | 'replace') => {
    if (action === 'replace') {
      setSelected([messageID])
      return
    }

    if (selected.includes(messageID)) {
      setSelected(selected.filter((s) => s !== messageID))
    } else {
      setSelected([...selected, messageID])
    }
  }

  const goPrevious = () => {}
  const goNext = () => {}

  return (
    <div className="flex-1 max-h-screen overflow-scroll md:px-8 md:pb-8">
      <h1 className="text-2xl font-bold md:pt-8 md:pb-4 md:px-2">Inbox</h1>

      <div ref={menuRef} className="mb-4">
        <EmailMenuBar goPrevious={goPrevious} goNext={goNext} />
      </div>

      <div ref={emailViewRef}>
        <EmailTableView
          emails={emails}
          selected={selected}
          toggleSelected={toggleSelected}
        />
      </div>
    </div>
  )
}
