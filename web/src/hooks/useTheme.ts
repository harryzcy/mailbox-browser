import { useEffect } from 'react'

export function useTheme() {
  const mediaWatcher = window.matchMedia('(prefers-color-scheme: dark)')
  const container = document.getElementsByTagName('body')[0]

  const setThemeClass = (isDark: boolean) => {
    if (isDark) {
      container.classList.add('dark')
    } else {
      container.classList.remove('dark')
    }
  }
  setThemeClass(mediaWatcher.matches)

  useEffect(() => {
    function updateTheme(e: MediaQueryListEvent) {
      setThemeClass(e.matches)
    }
    mediaWatcher.onchange = updateTheme

    return () => {
      mediaWatcher.removeEventListener('change', updateTheme)
    }
  })
}
