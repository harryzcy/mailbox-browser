import { useEffect } from 'react'

/**
 * Hook that listens clicks outside of the passed ref
 */
export function useOutsideClick(
  refs: React.MutableRefObject<any> | React.MutableRefObject<any>[],
  callback: () => any
) {
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (Array.isArray(refs)) {
        let contained = false
        refs.forEach((ref) => {
          if (!ref.current || ref.current.contains(event.target)) {
            contained = true
          }
        })
        if (!contained) {
          callback()
        }
      } else {
        if (refs.current && !refs.current.contains(event.target)) {
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
