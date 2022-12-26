import { useReducer } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import {
  DraftEmail,
  draftEmailReducer,
  DraftEmailsContext
} from '../contexts/DraftEmailContext'

export default function Root() {
  const [draftEmails, draftEmailsDispatch] = useReducer(
    draftEmailReducer,
    [] as DraftEmail[]
  )

  return (
    <DraftEmailsContext.Provider
      value={{ emails: draftEmails, dispatch: draftEmailsDispatch }}
    >
      <Sidebar />
      <Outlet />
    </DraftEmailsContext.Provider>
  )
}
