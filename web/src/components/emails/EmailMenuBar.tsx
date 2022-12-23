import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/20/solid'

interface EmailMenuBarProps {
  goPrevious: () => void
  goNext: () => void
}

export default function EmailMenuBar(props: EmailMenuBarProps) {
  return (
    <div className="flex justify-between items-stretch">
      <div>
        <span className="inline-flex items-center px-4 h-full border rounded-md cursor-pointer bg-blue-200">
          Create
        </span>
      </div>

      <nav className="inline-flex" aria-label="pagination">
        <span className="inline-flex p-2 border rounded-l-md cursor-pointer">
          <span className="h-[20px] w-[20px]">
            <ChevronLeftIcon />
          </span>
        </span>
        <span className="inline-flex p-2 border-r border-t border-b rounded-r-md cursor-pointer">
          <span className="h-[20px] w-[20px]">
            <ChevronRightIcon />
          </span>
        </span>
      </nav>
    </div>
  )
}
