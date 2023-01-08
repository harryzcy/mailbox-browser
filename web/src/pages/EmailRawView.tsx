import React from 'react'
import { Await, useLoaderData } from 'react-router-dom'

export default function EmailRawView() {
  const data = useLoaderData() as { messageID: string; raw: string }

  return (
    <div className="w-full px-2 py-2 md:px-8 md:py-5">
      <h1 className="text-lg font-light tracking-wider md:pb-4 md:px-1 dark:text-white">
        Original Email
      </h1>
      <div className="rounded-md flex">
        <span className="flex-initial bg-blue-200 rounded-l py-1 px-2">
          MessageID
        </span>
        <span className="flex-1 bg-blue-50 rounded-r py-1 px-2 md:px-4">
          {data.messageID}
        </span>
      </div>
      <div className="mt-5 p-5 text-sm border rounded-md relative">
        <React.Suspense fallback={<div>Loading...</div>}>
          <Await resolve={data.raw}>
            {(raw) => (
              <>
                <pre className="w-full block whitespace-pre-wrap break-words">
                  {raw}
                </pre>

                <div className="absolute top-2 right-0 p-3 space-x-3">
                  <span
                    role="button"
                    className="bg-blue-100 p-2 rounded-md cursor-pointer"
                    onClick={() => {
                      navigator.clipboard.writeText(raw)
                    }}
                  >
                    <span>Copy</span>
                  </span>
                  <span
                    role="button"
                    className="bg-blue-100 p-2 rounded-md cursor-pointer"
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
