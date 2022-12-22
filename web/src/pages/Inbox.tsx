import { useEffect, useState } from "react"
import EmailTableView from "../components/emails/EmailTableView"
import { EmailInfo, listEmails } from "../services/emails"

export default function Inbox() {
    const [count, setCount] = useState<number>(0)
    const [hasMore, setHasMore] = useState<boolean>(true)
    const [nextCursor, setNextCursor] = useState<string | undefined>(undefined)
    const [emails, setEmails] = useState<EmailInfo[]>([])
    
    const [loadingState, setLoadingState] = useState<'idle' | 'loading' | 'loaded' | 'error'>('idle')
  
    useEffect(() => {
      const abortController = new AbortController();
  
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
  
    return (
      <div className="flex-1 max-h-screen overflow-scroll md:p-8">
        <h1 className="text-2xl font-bold">Inbox</h1>
  
        <EmailTableView emails={emails} />
      </div>
    )
  }
  