import { NavLink } from 'react-router-dom'

export default function Sidebar() {
  const navItems = [
    ['Inbox', '/inbox'],
    ['Drafts', '/drafts'],
    ['Sent', '/sent']
  ]

  return (
    <aside className="sidebar flex-none h-screen md:w-56 text-base border-r dark:border-gray-700 select-none">
      <div className="title-group flex flex-col content-center md:p-6">
        <h1 className="text-center font-light tracking-wide dark:text-gray-100">
          Mailbox Browser
        </h1>
      </div>
      <nav className="p-3 pt-1">
        {navItems.map(([name, path]) => {
          return (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                `flex content-center px-4 py-2 mb-1 cursor-pointer rounded hover:bg-gray-300 hover:text-black dark:hover:bg-gray-700 dark:hover:text-gray-100 ${
                  isActive
                    ? 'text-gray-900 dark:text-gray-200 bg-gray-200 dark:bg-gray-800'
                    : 'text-gray-700 dark:text-gray-400 bg-transparent'
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
