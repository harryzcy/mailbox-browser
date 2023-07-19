import { useReducer } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import {
  ConfigContext,
  configReducer,
  initialConfigState
} from '../contexts/ConfigContext'
import {
  draftEmailReducer,
  DraftEmailsContext,
  initialState
} from '../contexts/DraftEmailContext'

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
        <Sidebar />
        <Outlet />
      </DraftEmailsContext.Provider>
    </ConfigContext.Provider>
  )
}
