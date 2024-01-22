import { useReducer } from 'react'
import { Outlet } from 'react-router-dom'

import { Toaster } from '@ui/toaster'

import Sidebar from 'components/Sidebar'

import {
  ConfigContext,
  configReducer,
  initialConfigState
} from 'contexts/ConfigContext'
import {
  DraftEmailsContext,
  draftEmailReducer,
  initialState
} from 'contexts/DraftEmailContext'

export default function Root() {
  const [configState, configDispatch] = useReducer(
    configReducer,
    initialConfigState
  )
  const [draftEmailsState, draftEmailsDispatch] = useReducer(
    draftEmailReducer,
    initialState
  )

  return (
    <ConfigContext.Provider
      value={{
        state: configState,
        dispatch: configDispatch
      }}
    >
      <DraftEmailsContext.Provider
        value={{
          emails: draftEmailsState.emails,
          activeEmail: draftEmailsState.activeEmail,
          dispatch: draftEmailsDispatch
        }}
      >
        <div className="hidden md:block preflight">
          <Sidebar />
        </div>
        <Outlet />
      </DraftEmailsContext.Provider>

      <div className="preflight">
        <Toaster />
      </div>
    </ConfigContext.Provider>
  )
}
