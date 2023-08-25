import { useContext, useEffect, useState } from 'react'

import {
  DraftEmail,
  DraftEmailsContext
} from '../../contexts/DraftEmailContext'
import useThrottled from '../../hooks/useThrottled'
import { deleteEmail, saveEmail } from '../../services/emails'
import { EmailDraft } from './EmailDraft'

interface FullScreenContentProps {
  handleDelete: (messageID: string) => void
}

export default function FullScreenContent(props: FullScreenContentProps) {
  const draftEmailsContext = useContext(DraftEmailsContext)

  const [isSending, setIsSending] = useState(false)
  const [draftEmail, setDraftEmail] = useState<DraftEmail | undefined>()
  const throttledDraftEmail = useThrottled(draftEmail)

  const saveDraft = async (email: DraftEmail, send: boolean = false) => {
    await saveEmail({
      messageID: email.messageID,
      subject: email.subject,
      from: email.from,
      to: email.to,
      cc: email.cc,
      bcc: email.bcc,
      replyTo: email.from,
      html: email.html,
      text: email.text,
      send
    })
  }

  useEffect(() => {
    const save = async () => {
      if (isSending) return
      if (!draftEmail) return
      await saveDraft(draftEmail)
    }

    void save()
  }, [throttledDraftEmail])

  const handleEmailChange = (email: DraftEmail) => {
    setDraftEmail(email)

    draftEmailsContext.dispatch({
      type: 'update',
      messageID: email.messageID,
      email
    })
  }

  const handleClose = () => {
    if (!draftEmailsContext.activeEmail) return

    draftEmailsContext.dispatch({
      type: 'remove',
      messageID: draftEmailsContext.activeEmail.messageID
    })
  }

  const handleMinimize = () => {
    draftEmailsContext.dispatch({
      type: 'minimize'
    })
  }

  const handleSend = async () => {
    const email = draftEmailsContext.activeEmail
    if (!email) return

    setIsSending(true) // prevent saving draft
    const shouldSend = true // save and send
    await saveDraft(email, shouldSend)

    draftEmailsContext.dispatch({
      type: 'remove',
      messageID: email.messageID
    })
  }

  const handleDelete = () => {
    const deleteRequest = async () => {
      const email = draftEmailsContext.activeEmail
      if (!email) return
      await deleteEmail(email.messageID)

      draftEmailsContext.dispatch({
        type: 'remove',
        messageID: email.messageID
      })
      props.handleDelete(email.messageID)
    }

    void deleteRequest()
  }

  if (
    draftEmailsContext.activeEmail === null ||
    draftEmailsContext.activeEmail.replyEmail ||
    draftEmailsContext.activeEmail.threadID
  ) {
    return null
  }

  return (
    <div className="absolute bottom-0 left-0 right-0 top-0 bg-neutral-800/40 px-36 py-20 dark:bg-zinc-900/90">
      <EmailDraft
        email={draftEmailsContext.activeEmail}
        handleEmailChange={handleEmailChange}
        handleClose={handleClose}
        handleMinimize={handleMinimize}
        handleSend={() => {
          void handleSend()
        }}
        handleDelete={handleDelete}
      />
    </div>
  )
}
