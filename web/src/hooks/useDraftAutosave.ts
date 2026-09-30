import { useEffect, useState } from 'react'

import { DraftEmail } from 'contexts/DraftEmailContext'

import useThrottled from 'hooks/useThrottled'

import { isLocalDraftID, useSaveEmail } from 'services/emails'

/**
 * Hook that saves a draft in the background while it's being edited
 */
export function useDraftAutosave() {
  const [draftEmail, setDraftEmail] = useState<DraftEmail | undefined>()
  const throttledDraftEmail = useThrottled(draftEmail)

  const { trigger: triggerSaveEmail } = useSaveEmail()

  useEffect(() => {
    if (!draftEmail) return
    if (isLocalDraftID(draftEmail.messageID)) return

    triggerSaveEmail({
      messageID: draftEmail.messageID,
      subject: draftEmail.subject,
      from: draftEmail.from,
      to: draftEmail.to,
      cc: draftEmail.cc,
      bcc: draftEmail.bcc,
      replyTo: draftEmail.from,
      html: draftEmail.html,
      text: draftEmail.text,
      send: false
    }).catch((e: unknown) => {
      console.error('Failed to save draft', e)
    })
    // Deliberately keyed off the throttled value only: it decides *when* to save,
    // while the body reads the latest draftEmail to decide *what* to save.
    // Depending on draftEmail would save on every keystroke and defeat the throttle.
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, [throttledDraftEmail])

  return {
    // queue the latest version of the draft to be saved
    queueSave: setDraftEmail,
    // drop any pending save, e.g. before sending or discarding the draft
    cancelSave: () => {
      setDraftEmail(undefined)
    }
  }
}
