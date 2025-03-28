import { Bars3Icon } from '@heroicons/react/24/outline'
import { useReducer, useRef, useState } from 'react'
import { Outlet } from 'react-router'

import { Toaster } from '@ui/sonner'

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

import { useOutsideClick } from 'hooks/useOutsideClick'

export default function Root() {
  const [configState, configDispatch] = useReducer(
    configReducer,
    initialConfigState
  )
  const [draftEmailsState, draftEmailsDispatch] = useReducer(
    draftEmailReducer,
    initialState
  )

  const [sidebarOnMobile, setSidebarOnMobile] = useState(false)
  const mobileSidebarRef = useRef<HTMLElement>(null)
  useOutsideClick([mobileSidebarRef], () => {
    setSidebarOnMobile(false)
  })

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

        <div
          className={
            'h-screen max-w-full flex-1 pt-4 md:px-8 md:pt-5 ' +
            (sidebarOnMobile ? 'blur-xs' : '')
          }
        >
          <Outlet />
        </div>

        {/* sidebar on mobile - absolute positioning */}
        {sidebarOnMobile ? (
          <span className="absolute md:hidden w-full">
            <div className="preflight">
              <Sidebar ref={mobileSidebarRef} />
            </div>
          </span>
        ) : (
          <span className="absolute md:hidden top-5 px-2">
            <span
              className="p-2"
              onClick={() => {
                setSidebarOnMobile(true)
              }}
            >
              <Bars3Icon className="size-4 dark:text-white" />
            </span>
          </span>
        )}
      </DraftEmailsContext.Provider>

      <div className="preflight">
        <Toaster />
      </div>
    </ConfigContext.Provider>
  )
}
