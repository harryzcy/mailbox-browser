import { useReducer } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import {
  draftEmailReducer,
  DraftEmailsContext,
  initialState
} from '../contexts/DraftEmailContext'

export default function Root() {
  const [draftEmailsState, draftEmailsDispatch] = useReducer(
    draftEmailReducer,
    initialState
  )

  return (
    <DraftEmailsContext.Provider
      value={{
        emails: draftEmailsState.emails,
        activeEmail: draftEmailsState.activeEmail,
        updateWaitlist: draftEmailsState.updateWaitlist,
        dispatch: draftEmailsDispatch
      }}
    >
      <Sidebar />
      <Outlet />
    </DraftEmailsContext.Provider>
  )
}
