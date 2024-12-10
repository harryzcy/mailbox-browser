import { useEffect, useMemo, useState } from 'react'

export default function useIsInViewport<Element extends HTMLElement>(
  ref: React.RefObject<Element | null>
) {
  const [isIntersecting, setIsIntersecting] = useState(false)

  const observer = useMemo(
    () =>
      new IntersectionObserver(([entry]) => {
        setIsIntersecting(entry.isIntersecting)
      }),
    [ref]
  )

  useEffect(() => {
    if (ref.current === null) return
    observer.observe(ref.current)
    // Remove the observer as soon as the component is unmounted
    return () => {
      observer.disconnect()
    }
  }, [ref, observer])

  return isIntersecting
}
