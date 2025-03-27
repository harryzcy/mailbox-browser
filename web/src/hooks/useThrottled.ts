import { useCallback, useEffect, useRef, useState } from 'react'

const DEFAULT_THROTTLE_MS = 3000

const getRemainingTime = (lastTriggeredTime: number, throttleMs: number) => {
  const elapsedTime = Date.now() - lastTriggeredTime
  const remainingTime = throttleMs - elapsedTime

  return remainingTime < 0 ? 0 : remainingTime
}

const useThrottled = <T>(
  value: T,
  throttleMs: number = DEFAULT_THROTTLE_MS
) => {
  const [throttledValue, setThrottledValue] = useState<T>(value)
  const lastTriggered = useRef<number>(Date.now())
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }, [])

  useEffect(() => {
    let remainingTime = getRemainingTime(lastTriggered.current, throttleMs)

    if (remainingTime === 0) {
      lastTriggered.current = Date.now()
      setThrottledValue(value)
      cancel()
    } else {
      timeoutRef.current ??= setTimeout(() => {
        remainingTime = getRemainingTime(lastTriggered.current, throttleMs)

        if (remainingTime === 0) {
          lastTriggered.current = Date.now()
          setThrottledValue(value)
          cancel()
        }
      }, remainingTime)
    }

    return cancel
  }, [cancel, throttleMs, value])

  return throttledValue
}

export default useThrottled
