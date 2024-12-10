import { useEffect } from 'react'

/**
 * Hook that listens clicks outside of the passed ref
 */
export function useOutsideClick(
  refs: React.RefObject<HTMLElement> | React.RefObject<HTMLElement>[],
  callback: () => void
) {
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (Array.isArray(refs)) {
        let contained = false
        refs.forEach((ref) => {
          // @eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          if (!ref.current || ref.current.contains(event.target as Node)) {
            contained = true
          }
        })
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (!contained) {
          callback()
        }
      } else {
        // @eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (refs.current && !refs.current.contains(event.target as Node)) {
          callback()
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [refs])
}
