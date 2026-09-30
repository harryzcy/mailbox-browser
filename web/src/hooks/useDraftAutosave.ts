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
    // the throttled value decides when to save, the latest draft what to save
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, [throttledDraftEmail])

  return {
    queueSave: setDraftEmail,
    cancelSave: () => {
      setDraftEmail(undefined)
    }
  }
}
