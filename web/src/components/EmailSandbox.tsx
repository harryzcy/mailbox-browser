import { type ReactNode, useCallback, useState } from 'react'
import { createPortal } from 'react-dom'

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
  // and absolute positioned content inside the email's box.
  return (
    <div className={props.className} style={{ contain: 'paint' }}>
      <div ref={attach}>
        {shadowRoot && createPortal(props.children, shadowRoot)}
      </div>
    </div>
  )
}
