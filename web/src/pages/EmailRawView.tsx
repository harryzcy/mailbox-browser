import React from 'react'
import { useLoaderData } from 'react-router'
import { toast } from 'sonner'

import { Toaster } from '@ui/sonner'

import { reparseEmail, useEmailRaw } from 'services/emails'

export default function EmailRawView() {
  const data: { messageID: string } = useLoaderData()

  const { raw, isLoading } = useEmailRaw(data.messageID)

  const [isRequesting, setIsRequesting] = React.useState(false)

  const reparse = async () => {
    if (isRequesting) return
    setIsRequesting(true)

    try {
      await reparseEmail(data.messageID)
      toast.info('Re-parsed email', {
        duration: 5000
      })
    } catch (e) {
      console.error('Failed to re-parse email', e)
      toast.error('Failed to re-parse email', {
        duration: 5000
      })
    }

    setIsRequesting(false)
  }

  return (
    <div className="preflight">
      <div className="w-full p-2 md:px-8 md:py-5">
        <h1 className="text-lg font-light tracking-wider md:px-1 md:pb-4 dark:text-white">
          Original Email
        </h1>
        <div className="flex rounded-md dark:text-neutral-300">
          <span className="flex-initial rounded-l bg-blue-200 px-2 py-1 dark:bg-neutral-700/70">
            MessageID
          </span>
          <span className="flex-1 rounded-r bg-blue-50 px-2 py-1 md:px-4 dark:bg-neutral-800">
            {data.messageID}
          </span>
        </div>
        <div className="relative mt-5 rounded-md border p-5 text-sm dark:border-neutral-700 dark:text-neutral-400">
          {isLoading ? (
            <div className="px-2">Loading...</div>
          ) : (
            raw && (
              <>
                <pre className="block w-full wrap-anywhere whitespace-pre-wrap">
                  {raw}
                </pre>
                <div className="absolute top-2 right-0 space-x-3 p-3 dark:text-neutral-400">
                  {/* oxlint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/interactive-supports-focus */}
                  <span
                    // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role
                    role="button"
                    className="cursor-pointer rounded-md bg-blue-100 p-2 dark:bg-neutral-700"
                    // eslint-disable-next-line @typescript-eslint/no-misused-promises
                    onClick={reparse}
                  >
                    <span>Re-Parse</span>
                  </span>
                  {/* oxlint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/interactive-supports-focus */}
                  <span
                    // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role
                    role="button"
                    className="cursor-pointer rounded-md bg-blue-100 p-2 dark:bg-neutral-700"
                    onClick={() => {
                      void navigator.clipboard.writeText(raw)
                    }}
                  >
                    <span>Copy</span>
                  </span>
                  {/* oxlint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/interactive-supports-focus */}
                  <span
                    // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role
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
            )
          )}
        </div>

        <Toaster />
      </div>
    </div>
  )
}
