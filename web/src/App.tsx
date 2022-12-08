import './App.css'
import {
  createBrowserRouter,
  RouterProvider,
  Route,
  redirect
} from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Inbox from './pages/Inbox'

const router = createBrowserRouter([
  {
    path: '/',
    loader: () => redirect('/inbox')
  },
  {
    path: '/inbox',
    element: (
      <>
        <Sidebar />
        <Inbox />
      </>
    )
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
