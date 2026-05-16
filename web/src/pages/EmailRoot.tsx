/*
 * EmailRoot.tsx
 * This is the root component for the entire right section of the page, only excluding the sidebar on the left.
 * It is used for the inbox, draft, and sent pages, and it contains the Outlet for the email list and email view components.
 */
import { useContext } from 'react'

import DraftEmailsTabs from 'components/emails/DraftEmailsTabs'
import FullScreenContent from 'components/emails/FullScreenContent'

import { DraftEmailsContext } from 'contexts/DraftEmailContext'
import { InboxContextOutlet, useInboxContext } from 'contexts/InboxContext'

interface EmailRootProps {
  type: 'inbox' | 'draft' | 'sent'
}

export default function EmailRoot(props: EmailRootProps) {
  const inboxContext = useInboxContext()

  const removeEmailFromList = (messageID: string) => {
    inboxContext.setEmails(
      inboxContext.emails.filter((email) => email.messageID !== messageID)
    )
  }

  const draftEmailsContext = useContext(DraftEmailsContext)

  return (
    <>
      <div
        className={
          'flex flex-col ' +
          (draftEmailsContext.emails.length > 0
            ? 'h-[calc(100%-3rem)]'
            : 'h-full')
        }
      >
        <div className="preflight">
          <h1 className="text-lg w-full font-light tracking-wider text-center md:text-left dark:text-white px-2 pb-3 md:px-2 md:pb-4">
            {props.type === 'inbox'
              ? 'Inbox'
              : props.type === 'draft'
                ? 'Drafts'
                : 'Sent'}
          </h1>
        </div>
        <InboxContextOutlet type={props.type} />
      </div>

      <div className="preflight">
        <FullScreenContent
          handleDelete={(messageID) => {
            removeEmailFromList(messageID)
          }}
        />
      </div>

      <div className="preflight">
        <DraftEmailsTabs />
      </div>
    </>
  )
}
