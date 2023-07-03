import { useContext, useEffect, useState } from 'react'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/20/solid'
import {
  EnvelopeIcon,
  TrashIcon,
  EnvelopeOpenIcon,
  EllipsisVerticalIcon
} from '@heroicons/react/24/outline'
import { DraftEmailsContext } from '../../contexts/DraftEmailContext'
import { generateLocalDraftID } from '../../services/emails'
import { ConfigContext, Plugin } from '../../contexts/ConfigContext'
import * as plugins from '../../services/plugins'

interface EmailMenuBarProps {
  emailIDs: string[]
  showOperations: boolean
  handleDelete?: () => void
  handleRead: () => void
  handleUnread: () => void
  hasPrevious: boolean
  hasNext: boolean
  goPrevious: () => void
  goNext: () => void
  children?: React.ReactNode
}

export default function EmailMenuBar(props: EmailMenuBarProps) {
  const {
    emailIDs,
    showOperations,
    handleDelete,
    handleRead,
    handleUnread,
    hasPrevious,
    hasNext,
    goPrevious,
    goNext,
    children
  } = props
  const { dispatch: dispatchDraftEmail } = useContext(DraftEmailsContext)
  const configContext = useContext(ConfigContext)

  const [showPluginMenu, setShowPluginMenu] = useState(false)
  useEffect(() => {
    setShowPluginMenu(false)
  }, [showOperations])

  const invokePlugin = (plugin: Plugin) => {
    setShowPluginMenu(false)
    plugins.invoke(plugin.name, emailIDs)
  }

  return (
    <div className="flex justify-between items-stretch select-none">
      <div className="flex items-center space-x-1">
        <span
          className="inline-flex items-center h-full space-x-2 px-3 mr-3 rounded-md cursor-pointer bg-sky-200 border border-sky-200"
          onClick={() => {
            dispatchDraftEmail({
              type: 'add',
              messageID: generateLocalDraftID()
            })
          }}
        >
          <span>
            <EnvelopeIcon className="h-5 w-5 text-sky-800" />
          </span>
          <span className="text-bold text-sky-900 font-medium">Compose</span>
        </span>

        {showOperations && (
          <>
            <span
              className="inline-flex p-2 rounded-md cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-700 text-gray-600 dark:text-gray-300 hover:text-sky-900 dark:hover:text-gray-100"
              onClick={() => {
                handleDelete && handleDelete()
              }}
            >
              <TrashIcon className="h-5 w-5" />
            </span>
            <span
              className="inline-flex p-2 rounded-md cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-700 text-gray-600 dark:text-gray-300 hover:text-sky-900 dark:hover:text-gray-100"
              onClick={handleRead}
            >
              <EnvelopeIcon className="h-5 w-5" />
            </span>
            <span
              className="inline-flex p-2 rounded-md cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-700 text-gray-600 dark:text-gray-300 hover:text-sky-900 dark:hover:text-gray-100"
              onClick={handleUnread}
            >
              <EnvelopeOpenIcon className="h-5 w-5" />
            </span>
            <span className="inline-flex h-1/2 w-2.5">
              <span className="block h-full w-[1px] bg-gray-300 m-auto"></span>
            </span>
            <span className="inline-flex relative p-2 rounded-md cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-700 text-gray-600 dark:text-gray-300 hover:text-sky-900 dark:hover:text-gray-100">
              <span
                className="-m-2 p-2"
                onClick={() => {
                  setShowPluginMenu(!showPluginMenu)
                }}
              >
                <EllipsisVerticalIcon className="h-5 w-5" />
              </span>
              {showPluginMenu && (
                <div className="absolute top-9 left-0 rounded-md bg-white dark:bg-neutral-800 w-40 border">
                  {configContext.state.config.plugins.length === 0 ? (
                    <div className="w-full p-2">No plugins installed</div>
                  ) : (
                    configContext.state.config.plugins.map((plugin) => (
                      <div
                        key={plugin.name}
                        className="w-full p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 hover:text-sky-900 dark:hover:text-gray-100"
                        onClick={() => {
                          invokePlugin(plugin)
                        }}
                      >
                        {plugin.displayName}
                      </div>
                    ))
                  )}
                </div>
              )}
            </span>
          </>
        )}
      </div>

      <nav
        className="inline-flex rounded-md divide-x dark:divide-x-0 border dark:border-sky-900"
        aria-label="pagination"
      >
        <span
          className={
            'inline-flex p-2 items-center dark:bg-cyan-900 rounded-l-md ' +
            (!hasPrevious
              ? 'cursor-not-allowed text-gray-400'
              : 'cursor-pointer dark:text-cyan-50')
          }
          onClick={goPrevious}
        >
          <span className="h-5 w-5">
            <ChevronLeftIcon />
          </span>
        </span>
        {children && (
          <span className="inline-flex py-2 px-3 mx-px dark:bg-cyan-900 select-none dark:text-cyan-50 text-sm text-center">
            {children}
          </span>
        )}
        <span
          className={
            'inline-flex p-2 items-center dark:bg-cyan-900 rounded-r-md ' +
            (!hasNext
              ? 'cursor-not-allowed text-gray-400'
              : 'cursor-pointer dark:text-cyan-50')
          }
          onClick={goNext}
        >
          <span className="h-5 w-5">
            <ChevronRightIcon />
          </span>
        </span>
      </nav>
    </div>
  )
}
