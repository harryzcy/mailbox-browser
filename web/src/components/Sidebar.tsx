import { NavLink } from 'react-router-dom'

export default function Sidebar() {
  return (
    <aside className="sidebar flex-none h-screen md:w-56 text-base border-r dark:border-gray-700">
      <div className="title-group flex flex-col content-center md:p-6">
        <h1 className="text-center font-bold dark:text-white">Mailbox Browser</h1>
      </div>
      <nav className='p-3 pt-1'>
        <NavLink
          to="/inbox"
          className={({ isActive }) =>
            `flex content-center px-4 py-2 mb-1 cursor-pointer rounded bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-600 ${
              isActive ? 'text-gray-800 dark:text-gray-200 dark:bg-gray-700' : ''
            }`
          }
        >
          Inbox
        </NavLink>
      </nav>
    </aside>
  )
}
