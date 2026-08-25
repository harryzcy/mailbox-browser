import { useEffect, useRef, useState } from 'react'

const DEFAULT_THROTTLE_MS = 3000

const getRemainingTime = (lastTriggeredTime: number, throttleMs: number) => {
  const elapsedTime = Date.now() - lastTriggeredTime
  const remainingTime = throttleMs - elapsedTime

  return Math.max(0, remainingTime)
}

const useThrottled = <T>(
  value: T,
  throttleMs: number = DEFAULT_THROTTLE_MS
) => {
  const [throttledValue, setThrottledValue] = useState(value)
  const lastTriggered = useRef<number | null>(null)

  useEffect(() => {
    // The first effect run starts the throttle window; reading the clock here
    // rather than during render keeps the render pure.
    lastTriggered.current ??= Date.now()

    const remainingTime = getRemainingTime(lastTriggered.current, throttleMs)
    const timeout = setTimeout(() => {
      lastTriggered.current = Date.now()
      setThrottledValue(value)
    }, remainingTime)

    return () => {
      clearTimeout(timeout)
    }
  }, [throttleMs, value])

  return throttledValue
}

export default useThrottled
