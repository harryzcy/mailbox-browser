import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/20/solid'

interface EmailMenuBarProps {
  hasPrevious: boolean
  hasNext: boolean
  goPrevious: () => void
  goNext: () => void
  children?: React.ReactNode
}

export default function EmailMenuBar(props: EmailMenuBarProps) {
  const { hasPrevious, hasNext, goPrevious, goNext, children } = props
  return (
    <div className="flex justify-between items-stretch">
      <div>
        <span className="inline-flex items-center px-4 h-full rounded-md cursor-pointer bg-blue-200">
          Create
        </span>
      </div>

      <nav className="inline-flex" aria-label="pagination">
        <span
          className={
            'inline-flex p-2 border items-center dark:border-0 bg-cyan-900 rounded-l-md ' +
            (!hasPrevious
              ? 'cursor-not-allowed text-gray-400'
              : 'cursor-pointer dark:text-gray-200')
          }
          onClick={goPrevious}
        >
          <span className="h-[20px] w-[20px]">
            <ChevronLeftIcon />
          </span>
        </span>
        {children && (
          <span className="inline-flex py-2 px-3 border dark:border-0 mx-px bg-cyan-900 select-none dark:text-gray-200">
            {children}
          </span>
        )}
        <span
          className={
            'inline-flex p-2 border items-center border-l-0 dark:border-0 bg-cyan-900 rounded-r-md ' +
            (!hasNext
              ? 'cursor-not-allowed text-gray-400'
              : 'cursor-pointer dark:text-gray-200')
          }
          onClick={goNext}
        >
          <span className="h-[20px] w-[20px]">
            <ChevronRightIcon />
          </span>
        </span>
      </nav>
    </div>
  )
}
