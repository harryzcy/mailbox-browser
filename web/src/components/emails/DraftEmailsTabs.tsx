import { useContext } from 'react'
import { useInterval } from 'react-use'
import {
  DraftEmail,
  DraftEmailsContext
} from '../../contexts/DraftEmailContext'
import {
  createEmail,
  Email,
  isLocalDraftID,
  saveEmail
} from '../../services/emails'

const SAVE_INTERVAL = 15000 /* 15 seconds */

export default function DraftEmailsTabs() {
  const draftEmailsContext = useContext(DraftEmailsContext)

  useInterval(async () => {
    const waitlist = [...draftEmailsContext.updateWaitlist]
    draftEmailsContext.dispatch({
      type: 'clear-waitlist'
    })

    for (const messageID of waitlist) {
      const email = draftEmailsContext.emails.find(
        (email) => email.messageID === messageID
      )
      if (!email) continue
      await createOrSaveEmail(email)
    }
  }, SAVE_INTERVAL)

  const createOrSaveEmail = async (email: DraftEmail) => {
    const body = {
      subject: email.subject,
      from: email.from,
      to: email.to,
      cc: email.cc,
      bcc: email.bcc,
      replyTo: email.from,
      html: email.html,
      text: email.text,
      send: false
    }

    let data: Email
    const oldMessageID = email.messageID
    if (isLocalDraftID(email.messageID)) {
      // data = await createEmail(body)
      console.log('createEmail', body)
    } else {
      // data = await saveEmail({
      //   ...body,
      //   messageID: email.messageID
      // })
      console.log('saveEmail', {
        ...body,
        messageID: email.messageID
      })
    }
    // draftEmailsContext.dispatch({
    //   type: 'update',
    //   messageID: oldMessageID,
    //   email: {
    //     messageID: data.messageID,
    //     subject: data.subject,
    //     from: data.from,
    //     to: data.to,
    //     cc: data.cc,
    //     bcc: data.bcc,
    //     replyTo: data.replyTo,
    //     html: data.html,
    //     text: data.text
    //   },
    //   excludeInWaitlist: true
    // })
  }

  if (draftEmailsContext.emails.length === 0) {
    return null
  }

  return (
    <div
      className={
        'fixed w-full h-[3rem] -mx-8 px-8 pt-2' +
        (draftEmailsContext.activeEmail === null
          ? ' border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-900'
          : '')
      }
    >
      <div className="flex space-x-2 h-full text-slate-900 dark:text-slate-300">
        {draftEmailsContext.emails.map((email) => {
          return (
            <div
              key={email.messageID}
              className="rounded-t md:rounded-t-md bg-gray-200 dark:bg-gray-800 flex p-1 px-5 items-center cursor-pointer"
              onClick={() => {
                draftEmailsContext.dispatch({
                  type: 'open',
                  id: email.messageID
                })
              }}
            >
              <span>{email.subject || 'New Email'}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
