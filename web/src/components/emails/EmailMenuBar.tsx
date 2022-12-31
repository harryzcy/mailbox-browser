import { useContext } from 'react'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/20/solid'
import { EnvelopeIcon, TrashIcon } from '@heroicons/react/24/outline'
import { DraftEmailsContext } from '../../contexts/DraftEmailContext'
import { generateLocalDraftID } from '../../services/emails'

interface EmailMenuBarProps {
  showOperations: boolean
  hasPrevious: boolean
  hasNext: boolean
  goPrevious: () => void
  goNext: () => void
  children?: React.ReactNode
}

export default function EmailMenuBar(props: EmailMenuBarProps) {
  const { showOperations, hasPrevious, hasNext, goPrevious, goNext, children } =
    props
  const { dispatch: dispatchDraftEmail } = useContext(DraftEmailsContext)

  return (
    <div className="flex justify-between items-stretch">
      <div className="flex items-center space-x-2">
        <span
          className="inline-flex items-center h-full space-x-2 px-3 rounded-md cursor-pointer bg-sky-200 border border-sky-200"
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
            <span className="inline-flex p-2 rounded-md cursor-pointer hover:bg-neutral-100">
              <TrashIcon className="h-5 w-5 text-sky-800" />
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
