import { NavLink } from 'react-router-dom'

export default function Sidebar() {
  const navItems = [
    ['Inbox', '/inbox'],
    ['Drafts', '/drafts'],
    ['Sent', '/sent']
  ]

  return (
    <aside className="sidebar flex-none h-screen md:w-56 text-base border-r dark:border-gray-700">
      <div className="title-group flex flex-col content-center md:p-6">
        <h1 className="text-center font-bold dark:text-white">
          Mailbox Browser
        </h1>
      </div>
      <nav className="p-3 pt-1">
        {navItems.map(([name, path]) => {
          return (
            <NavLink
              to={path}
              className={({ isActive }) =>
                `flex content-center px-4 py-2 mb-1 cursor-pointer rounded dark:bg-gray-800 dark:hover:bg-gray-600 ${
                  isActive
                    ? 'text-gray-900 dark:text-gray-200 bg-gray-300 dark:bg-gray-700'
                    : 'text-gray-700 dark:text-gray-400 bg-gray-100'
                }`
              }
            >
              {name}
            </NavLink>
          )
        })}
      </nav>
    </aside>
  )
}
