import React from 'react'
import { Await, useLoaderData } from 'react-router-dom'

import { toast } from 'components/ui/use-toast'

import { reparseEmail } from 'services/emails'

export default function EmailRawView() {
  const data = useLoaderData() as { messageID: string; raw: string }

  const [isRequesting, setIsRequesting] = React.useState(false)

  const reparse = async () => {
    if (isRequesting) return
    setIsRequesting(true)

    try {
      await reparseEmail(data.messageID)
      toast({
        title: 'Re-parsed email',
        duration: 5000
      })
    } catch (e) {
      toast({
        title: 'Failed to re-parse email',
        duration: 5000
      })
    }

    setIsRequesting(false)
  }

  return (
    <div className="w-full px-2 py-2 md:px-8 md:py-5">
      <h1 className="text-lg font-light tracking-wider dark:text-white md:px-1 md:pb-4">
        Original Email
      </h1>
      <div className="flex rounded-md dark:text-neutral-300">
        <span className="flex-initial rounded-l bg-blue-200 px-2 py-1 dark:bg-neutral-700/70">
          MessageID
        </span>
        <span className="flex-1 rounded-r bg-blue-50 px-2 py-1 dark:bg-neutral-800 md:px-4">
          {data.messageID}
        </span>
      </div>
      <div className="relative mt-5 rounded-md border p-5 text-sm dark:border-neutral-700 dark:text-neutral-400">
        <React.Suspense fallback={<div>Loading...</div>}>
          <Await resolve={data.raw}>
            {(raw: string) => (
              <>
                <pre className="block w-full whitespace-pre-wrap break-words">
                  {raw}
                </pre>

                <div className="absolute right-0 top-2 space-x-3 p-3 dark:text-neutral-400">
                  <span
                    role="button"
                    className="cursor-pointer rounded-md bg-blue-100 p-2 dark:bg-neutral-700"
                    onClick={reparse}
                  >
                    <span>Re-Parse</span>
                  </span>
                  <span
                    role="button"
                    className="cursor-pointer rounded-md bg-blue-100 p-2 dark:bg-neutral-700"
                    onClick={() => {
                      void navigator.clipboard.writeText(raw)
                    }}
                  >
                    <span>Copy</span>
                  </span>
                  <span
                    role="button"
                    className="cursor-pointer rounded-md bg-blue-100 p-2 dark:bg-neutral-700"
                    onClick={() => {
                      const blob = new Blob([raw], { type: 'message/rfc822' })
                      const url = URL.createObjectURL(blob)
                      const a = document.createElement('a')
                      a.href = url
                      a.download = `${data.messageID}.eml`
                      a.click()
                    }}
                  >
                    <span>Download</span>
                  </span>
                </div>
              </>
            )}
          </Await>
        </React.Suspense>
      </div>
    </div>
  )
}
