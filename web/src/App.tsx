import './App.css'
import { createBrowserRouter, RouterProvider, redirect } from 'react-router-dom'
import EmailRoot from './pages/EmailRoot'
import EmailView from './pages/EmailView'
import Root from './pages/Root'
import EmailList from './pages/EmailList'
import { getEmail } from './services/emails'

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
            path: ':messageID',
            element: <EmailView />,
            loader: async ({ params }) => {
              if (!params.messageID) return redirect('/inbox')
              return await getEmail(params.messageID)
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
            loader: async ({ params }) => {
              if (!params.messageID) return redirect('/drafts')
              return await getEmail(params.messageID)
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
            loader: async ({ params }) => {
              if (!params.messageID) return redirect('/sent')
              return await getEmail(params.messageID)
            }
          }
        ]
      }
    ]
  }
])

function App() {
  return (
    <div className="flex font-sans bg-white dark:bg-gray-900">
      <RouterProvider router={router} />
    </div>
  )
}

export default App
