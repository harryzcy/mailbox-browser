import { ReactElement } from 'react'
import { NavLink } from 'react-router-dom'
import {
  DocumentTextIcon,
  InboxIcon,
  PaperAirplaneIcon
} from '@heroicons/react/24/outline'

export default function Sidebar() {
  const navItems: [string, string, ReactElement][] = [
    ['Inbox', '/inbox', <InboxIcon />],
    ['Drafts', '/drafts', <DocumentTextIcon />],
    ['Sent', '/sent', <PaperAirplaneIcon />]
  ]

  return (
    <aside className="sidebar flex-none h-screen md:w-60 text-base border-r dark:border-gray-700 select-none">
      <div className="title-group flex flex-col content-center md:p-6">
        <h1 className="text-center font-light tracking-wide dark:text-gray-100">
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
                `flex items-center px-4 py-2 mb-1 space-x-2 cursor-pointer rounded hover:bg-gray-300 hover:text-black dark:hover:bg-gray-700 dark:hover:text-gray-100 ${
                  isActive
                    ? 'text-gray-900 dark:text-gray-200 bg-gray-200 dark:bg-gray-800'
                    : 'text-gray-700 dark:text-gray-400 bg-transparent'
                }`
              }
            >
              <span className="h-4 w-4">{icon}</span>
              <span>{name}</span>
            </NavLink>
          )
        })}
      </nav>
    </aside>
  )
}
