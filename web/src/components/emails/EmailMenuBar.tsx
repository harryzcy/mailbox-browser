import { useContext, useEffect, useState } from 'react'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/20/solid'
import {
  EnvelopeIcon,
  TrashIcon,
  EnvelopeOpenIcon,
  EllipsisVerticalIcon
} from '@heroicons/react/24/outline'
import { DraftEmailsContext } from '../../contexts/DraftEmailContext'
import { createEmail, generateLocalDraftID } from '../../services/emails'
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
    void plugins.invoke(plugin.name, emailIDs)
  }

  const handleCreate = async () => {
    const draftID = generateLocalDraftID()

    dispatchDraftEmail({
      type: 'new',
      messageID: draftID
    })

    const body = {
      subject: '',
      from: [],
      to: [],
      cc: [],
      bcc: [],
      replyTo: [],
      html: '',
      text: '',
      send: false
    }

    const email = await createEmail(body)

    dispatchDraftEmail({
      type: 'update',
      messageID: draftID,
      email
    })
  }

  return (
    <div className="flex select-none items-stretch justify-between">
      <div className="flex items-center space-x-1">
        <span
          className="mr-3 inline-flex h-full cursor-pointer items-center space-x-2 rounded-md border border-sky-200 bg-sky-200 px-3"
          onClick={() => {
            void handleCreate()
          }}
        >
          <span>
            <EnvelopeIcon className="h-5 w-5 text-sky-800" />
          </span>
          <span className="text-bold font-medium text-sky-900">Compose</span>
        </span>

        {showOperations && (
          <>
            <span
              className="inline-flex cursor-pointer rounded-md p-2 text-gray-600 hover:bg-neutral-100 hover:text-sky-900 dark:text-gray-300 dark:hover:bg-neutral-700 dark:hover:text-gray-100"
              onClick={() => {
                handleDelete && handleDelete()
              }}
            >
              <TrashIcon className="h-5 w-5" />
            </span>
            <span
              className="inline-flex cursor-pointer rounded-md p-2 text-gray-600 hover:bg-neutral-100 hover:text-sky-900 dark:text-gray-300 dark:hover:bg-neutral-700 dark:hover:text-gray-100"
              onClick={handleRead}
            >
              <EnvelopeIcon className="h-5 w-5" />
            </span>
            <span
              className="inline-flex cursor-pointer rounded-md p-2 text-gray-600 hover:bg-neutral-100 hover:text-sky-900 dark:text-gray-300 dark:hover:bg-neutral-700 dark:hover:text-gray-100"
              onClick={handleUnread}
            >
              <EnvelopeOpenIcon className="h-5 w-5" />
            </span>
            <span className="inline-flex h-1/2 w-2.5">
              <span className="m-auto block h-full w-[1px] bg-gray-300"></span>
            </span>
            <span className="relative inline-flex cursor-pointer rounded-md p-2 text-gray-600 hover:bg-neutral-100 hover:text-sky-900 dark:text-gray-300 dark:hover:bg-neutral-700 dark:hover:text-gray-100">
              <span
                className="-m-2 p-2"
                onClick={() => {
                  setShowPluginMenu(!showPluginMenu)
                }}
              >
                <EllipsisVerticalIcon className="h-5 w-5" />
              </span>
              {showPluginMenu && (
                <div className="absolute left-0 top-9 w-40 rounded-md border bg-white dark:bg-neutral-800">
                  {configContext.state.config.plugins.length === 0 ? (
                    <div className="w-full p-2">No plugins installed</div>
                  ) : (
                    configContext.state.config.plugins.map((plugin) => (
                      <div
                        key={plugin.name}
                        className="w-full p-2 hover:bg-neutral-100 hover:text-sky-900 dark:hover:bg-neutral-700 dark:hover:text-gray-100"
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
        className="inline-flex divide-x rounded-md border dark:divide-x-0 dark:border-sky-900"
        aria-label="pagination"
      >
        <span
          className={
            'inline-flex items-center rounded-l-md p-2 dark:bg-cyan-900 ' +
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
          <span className="mx-px inline-flex select-none px-3 py-2 text-center text-sm dark:bg-cyan-900 dark:text-cyan-50">
            {children}
          </span>
        )}
        <span
          className={
            'inline-flex items-center rounded-r-md p-2 dark:bg-cyan-900 ' +
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
