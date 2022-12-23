import './App.css'
import { createBrowserRouter, RouterProvider, redirect } from 'react-router-dom'
import Inbox from './pages/Inbox'
import EmailView from './pages/EmailView'
import Root from './pages/Root'
import EmailList from './pages/EmailList'

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
        element: <Inbox />,
        children: [
          {
            path: '',
            element: <EmailList />
          },
          {
            path: ':messageID',
            element: <EmailView />
          }
        ]
      }
    ]
  }
])

function App() {
  return (
    <div className="flex font-sans">
      <RouterProvider router={router} />
    </div>
  )
}

export default App
