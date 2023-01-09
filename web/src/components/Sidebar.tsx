import { ReactElement } from 'react'
import { NavLink } from 'react-router-dom'
import {
  DocumentTextIcon,
  InboxIcon,
  PaperAirplaneIcon
} from '@heroicons/react/24/outline'
import { browserVersion } from '../utils/info'

export default function Sidebar() {
  const mailboxVersion = 'v1.4.0'

  const navItems: [string, string, ReactElement][] = [
    ['Inbox', '/inbox', <InboxIcon />],
    ['Drafts', '/drafts', <DocumentTextIcon />],
    ['Sent', '/sent', <PaperAirplaneIcon />]
  ]

  return (
    <aside className="flex-none flex flex-col justify-between h-screen md:w-60 text-base select-none">
      <div>
        <div className="flex flex-col content-center md:p-6">
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
                  `flex items-center px-4 py-2 mb-1 space-x-2 cursor-pointer rounded hover:bg-neutral-300 hover:text-black dark:hover:bg-neutral-700 dark:hover:text-neutral-100 ${
                    isActive
                      ? 'text-neutral-900 dark:text-neutral-200 bg-neutral-200 dark:bg-neutral-800'
                      : 'text-neutral-700 dark:text-neutral-400 bg-transparent'
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

      <div className="flex flex-col items-center justify-center text-gray-400 dark:text-neutral-500 text-xs py-2 md:py-6">
        <div className="space-x-2">
          <span>Mailbox version</span>
          <span>{mailboxVersion}</span>
        </div>
        <div className="space-x-2">
          <span>Browser version</span>
          <span>{browserVersion}</span>
        </div>
      </div>
    </aside>
  )
}
