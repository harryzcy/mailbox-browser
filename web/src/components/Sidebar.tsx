import {
  DocumentTextIcon,
  InboxIcon,
  PaperAirplaneIcon
} from '@heroicons/react/24/outline'
import { ReactElement, forwardRef, useEffect, useState } from 'react'
import { NavLink } from 'react-router'

import { getInfo } from 'services/info'

import { browserVersion } from 'utils/info'

const Sidebar = forwardRef<HTMLElement>(function Sidebar(props, ref) {
  const navItems: [string, string, ReactElement][] = [
    ['Inbox', '/inbox', <InboxIcon key="inbox" />],
    ['Drafts', '/drafts', <DocumentTextIcon key="drafts" />],
    ['Sent', '/sent', <PaperAirplaneIcon key="sent" />]
  ]

  const [mailboxVersion, setMailboxVersion] = useState('')
  useEffect(() => {
    void getInfo().then((info) => {
      setMailboxVersion(info.version)
    })
  }, [])

  return (
    <aside
      ref={ref}
      className="flex h-screen flex-none select-none flex-col justify-between text-base w-60 bg-white dark:bg-neutral-900"
    >
      <div>
        <div className="flex flex-col content-center p-6">
          <h1 className="text-center font-light tracking-wide dark:text-neutral-100">
            Mailbox Browser
          </h1>
        </div>
        <nav className="pl-6 pr-8 pt-1">
          {navItems.map(([name, path, icon]) => {
            return (
              <NavLink
                key={path}
                to={path}
                className={({ isActive }) =>
                  `mb-1 flex cursor-pointer items-center space-x-2 rounded px-4 py-2 hover:bg-neutral-300 hover:text-black dark:hover:bg-neutral-700 dark:hover:text-neutral-100 ${
                    isActive
                      ? 'bg-neutral-200 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-200'
                      : 'bg-transparent text-neutral-700 dark:text-neutral-400'
                  }`
                }
              >
                <span className="h-4 w-4">{icon}</span>
                <span>{name}</span>
              </NavLink>
            )
          })}
        </nav>
      </div>

      <div className="grid grid-cols-2 items-center justify-center space-x-1 py-2 text-xs text-gray-400 dark:text-neutral-500 md:py-6">
        <span className="justify-self-end">Mailbox</span>
        <span>{mailboxVersion}</span>
        <span className="justify-self-end">Browser</span>
        <span>{browserVersion}</span>
      </div>
    </aside>
  )
})

export default Sidebar
