import { clsx } from 'clsx'
import { type ReactNode, useCallback, useState } from 'react'
import { createPortal } from 'react-dom'

// Defaults the app's reset used to provide; the email's styles override them.
const baseStyles = 'img{max-width:100%;height:auto}'

// EmailSandbox isolates an email's styles from the app in a shadow root.
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

  // The email can restyle the host via :host, so the containment that keeps
  // positioned content inside the email's box goes on the wrapper.
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
