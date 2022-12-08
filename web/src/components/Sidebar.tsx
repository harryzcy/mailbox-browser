import { NavLink } from 'react-router-dom'

export default function Sidebar() {
  return (
    <aside className="sidebar flex-none h-screen md:w-56 border-r text-base">
      <div className="title-group flex flex-col content-center md:p-4 border-b">
        <h1 className="text-center">Mailbox Browser</h1>
      </div>
      <nav className="text-gray-400">
        <NavLink
          to="/inbox"
          className={({ isActive }) =>
            `flex content-center px-4 py-2 hover:text-purple-900 ${
              isActive ? 'text-purple-800' : ''
            }`
          }
        >
          Inbox
        </NavLink>
      </nav>
    </aside>
  )
}
