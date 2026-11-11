import { clsx } from 'clsx'
import { type ReactNode, useCallback, useState } from 'react'
import { createPortal } from 'react-dom'

// Defaults the app's reset used to provide. The email's own styles come later
// and override them.
const baseStyles = 'img{max-width:100%;height:auto}'

// EmailSandbox renders an email in a shadow root, so the email's styles can't
// reach the rest of the app and the app's styles can't reach the email.
export function EmailSandbox(props: {
  className?: string
  children: ReactNode
}) {
  const [shadowRoot, setShadowRoot] = useState<ShadowRoot | null>(null)
  const attach = useCallback((host: HTMLDivElement | null) => {
    if (host) {
      setShadowRoot(host.shadowRoot ?? host.attachShadow({ mode: 'open' }))
    }
  }, [])

  // The email's styles can still restyle the shadow host through :host, so
  // paint containment sits on a wrapper the email can't style. It keeps fixed
  // and absolute positioned content inside the email's box. The color scheme
  // gives unstyled links and controls colors that suit the theme.
  return (
    <div
      className={clsx('dark:scheme-dark', props.className)}
      style={{ contain: 'paint' }}
    >
      <div ref={attach}>
        {shadowRoot &&
          createPortal(
            <>
              <style>{baseStyles}</style>
              {props.children}
            </>,
            shadowRoot
          )}
      </div>
    </div>
  )
}
