import './App.css'
import {
  createBrowserRouter,
  RouterProvider,
  redirect,
  defer
} from 'react-router-dom'
import EmailRoot from './pages/EmailRoot'
import EmailView from './pages/EmailView'
import Root from './pages/Root'
import EmailList from './pages/EmailList'
import { getEmail, getEmailRaw } from './services/emails'
import EmailRawView from './pages/EmailRawView'
import { getThread } from './services/threads'

const router = createBrowserRouter([
  {
    path: '/',
    element: <Root />,
    children: [
      {
        path: '',
        loader: () => redirect('inbox')
      },
      {
        path: 'inbox',
        element: <EmailRoot type="inbox" />,
        children: [
          {
            path: '',
            element: <EmailList />
          },
          {
            path: 'thread/:threadID',
            element: <EmailView />,
            loader: ({ params }) => {
              if (!params.threadID) return redirect('/inbox')
              return defer({
                type: 'thread',
                threadID: params.threadID,
                thread: getThread(params.threadID)
              })
            }
          },
          {
            path: ':messageID',
            element: <EmailView />,
            loader: ({ params }) => {
              if (!params.messageID) return redirect('/inbox')
              return defer({
                type: 'email',
                messageID: params.messageID,
                email: getEmail(params.messageID)
              })
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
            element: <EmailList />
          },
          {
            path: ':messageID',
            element: <EmailView />,
            loader: ({ params }) => {
              if (!params.messageID) return null
              return defer({
                messageID: params.messageID,
                email: getEmail(params.messageID)
              })
            }
          }
        ]
      },
      {
        path: 'sent',
        element: <EmailRoot type="sent" />,
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
              return defer({
                messageID: params.messageID,
                email: getEmail(params.messageID)
              })
            }
          }
        ]
      }
    ]
  },
  {
    path: '/raw/:messageID',
    element: <EmailRawView />,
    loader: ({ params }) => {
      if (!params.messageID) return redirect('/inbox')
      return defer({
        messageID: params.messageID,
        raw: getEmailRaw(params.messageID)
      })
    }
  }
])

function App() {
  return (
    <div className="flex font-sans bg-white dark:bg-neutral-900">
      <RouterProvider router={router} />
    </div>
  )
}

export default App
