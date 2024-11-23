import {
  RouterProvider,
  createBrowserRouter,
  redirect,
  useRouteError
} from 'react-router'

import EmailList from 'pages/EmailList'
import EmailRawView from 'pages/EmailRawView'
import EmailRoot from 'pages/EmailRoot'
import EmailView from 'pages/EmailView'
import Root from 'pages/Root'

import { getEmail, getEmailRaw } from 'services/emails'
import { getThread } from 'services/threads'

const router = createBrowserRouter([
  {
    path: '/',
    element: <Root />,
    errorElement: <ErrorBoundary />,
    children: [
      {
        path: '',
        loader: () => redirect('inbox')
      },
      {
        path: 'inbox',
        element: <EmailRoot type="inbox" />,
        errorElement: <ErrorBoundary />,
        children: [
          {
            path: '',
            element: <EmailList />
          },
          {
            path: 'thread/:threadID',
            element: <EmailView />,
            errorElement: <ErrorBoundary />,
            loader: ({ params }) => {
              if (!params.threadID) return redirect('/inbox')
              return {
                type: 'thread',
                threadID: params.threadID,
                thread: getThread(params.threadID)
              }
            }
          },
          {
            path: ':messageID',
            element: <EmailView />,
            errorElement: <ErrorBoundary />,
            loader: ({ params }) => {
              if (!params.messageID) return redirect('/inbox')
              return {
                type: 'email',
                messageID: params.messageID,
                email: getEmail(params.messageID)
              }
            }
          }
        ]
      },
      {
        path: 'drafts',
        element: <EmailRoot type="draft" />,
        children: [
          {
            path: '',
            element: <EmailList />,
            errorElement: <ErrorBoundary />
          },
          {
            path: ':messageID',
            element: <EmailView />,
            loader: ({ params }) => {
              if (!params.messageID) return null
              return {
                messageID: params.messageID,
                email: getEmail(params.messageID)
              }
            }
          }
        ]
      },
      {
        path: 'sent',
        element: <EmailRoot type="sent" />,
        errorElement: <ErrorBoundary />,
        children: [
          {
            path: '',
            element: <EmailList />
          },
          {
            path: ':messageID',
            element: <EmailView />,
            loader: ({ params }) => {
              if (!params.messageID) return redirect('/sent')
              return {
                messageID: params.messageID,
                email: getEmail(params.messageID)
              }
            }
          }
        ]
      }
    ]
  },
  {
    path: '/raw/:messageID',
    element: <EmailRawView />,
    errorElement: <ErrorBoundary />,
    loader: ({ params }) => {
      if (!params.messageID) return redirect('/inbox')
      return {
        messageID: params.messageID,
        raw: getEmailRaw(params.messageID)
      }
    }
  }
])

function ErrorBoundary() {
  const error = useRouteError() as {
    status: number
    error: unknown
    data: string
    internal: boolean
    statusText: string
  }
  console.error(error)
  console.error(error.error)
  // Uncaught ReferenceError: path is not defined
  return <div>Unknown Error: {error.data}</div>
}

function App() {
  return (
    <div className="flex relative bg-white font-sans dark:bg-neutral-900">
      <RouterProvider router={router} />
    </div>
  )
}

export default App
