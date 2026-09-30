import { act, renderHook } from '@testing-library/react'
import { ReactNode, useContext, useReducer } from 'react'
import { describe, expect, test } from 'vitest'

import { Email } from 'services/emails'

import {
  DraftEmail,
  DraftEmailsContext,
  State,
  draftEmailReducer,
  initialState
} from './DraftEmailContext'

describe('DraftEmailContext', () => {
  const createWrapper = (state: State = initialState) => {
    const wrapper = ({ children }: { children: ReactNode }) => {
      // oxlint-disable-next-line react-hooks/rules-of-hooks
      const [draftState, dispatch] = useReducer(draftEmailReducer, state)

      return (
        <DraftEmailsContext.Provider
          // oxlint-disable-next-line react/jsx-no-constructed-context-values
          value={{
            emails: draftState.emails,
            activeEmail: draftState.activeEmail,
            dispatch
          }}
        >
          {children}
        </DraftEmailsContext.Provider>
      )
    }

    return wrapper
  }

  const inboxEmail: Email = {
    messageID: 'example-id',
    type: 'inbox',
    from: ['sender@example.com'],
    to: ['me@example.com'],
    subject: 'Example subject',
    html: '<body>Content</body>'
  } as Email

  const sentEmail: Email = {
    messageID: 'example-id',
    type: 'sent',
    from: ['me@example.com'],
    to: ['sender@example.com'],
    subject: 'Example subject',
    html: 'html'
  } as Email

  test('New email', () => {
    const { result } = renderHook(() => useContext(DraftEmailsContext), {
      wrapper: createWrapper()
    })

    expect(result.current.emails).toHaveLength(0)
    act(() => {
      result.current.dispatch({
        type: 'new',
        messageID: 'example-id'
      })
    })
    expect(result.current.emails).toHaveLength(1)
    expect(result.current.emails[0].messageID).toBe('example-id')
  })

  test('New email - Multiple emails', () => {
    const { result } = renderHook(() => useContext(DraftEmailsContext), {
      wrapper: createWrapper()
    })

    expect(result.current.emails).toHaveLength(0)
    act(() => {
      result.current.dispatch({
        type: 'new',
        messageID: 'example-1'
      })
    })
    act(() => {
      result.current.dispatch({
        type: 'new',
        messageID: 'example-2'
      })
    })
    expect(result.current.emails).toHaveLength(2)
    expect(result.current.emails[0].messageID).toBe('example-1')
    expect(result.current.emails[1].messageID).toBe('example-2')
  })

  test('New reply to inbox email', () => {
    const { result } = renderHook(() => useContext(DraftEmailsContext), {
      wrapper: createWrapper()
    })

    act(() => {
      result.current.dispatch({
        type: 'new-reply',
        messageID: 'example-id',
        allowedAddresses: ['me@example.com'],
        replyEmail: inboxEmail
      })
    })
    expect(result.current.emails).toHaveLength(1)
    expect(result.current.emails[0].messageID).toBe('example-id')
    expect(result.current.emails[0].subject).toBe('Re: Example subject')
    expect(result.current.emails[0].to).toStrictEqual(['sender@example.com'])
    expect(result.current.emails[0].from).toStrictEqual(['me@example.com'])
  })

  test('New reply to inbox email with Reply-To', () => {
    const { result } = renderHook(() => useContext(DraftEmailsContext), {
      wrapper: createWrapper()
    })

    act(() => {
      result.current.dispatch({
        type: 'new-reply',
        messageID: 'example-id',
        allowedAddresses: ['me@example.com'],
        replyEmail: { ...inboxEmail, replyTo: ['ticket@example.com'] }
      })
    })
    expect(result.current.emails[0].to).toStrictEqual(['ticket@example.com'])
    expect(result.current.emails[0].from).toStrictEqual(['me@example.com'])
  })

  test('New reply to sent email', () => {
    const { result } = renderHook(() => useContext(DraftEmailsContext), {
      wrapper: createWrapper()
    })

    act(() => {
      result.current.dispatch({
        type: 'new-reply',
        messageID: 'example-id',
        allowedAddresses: ['me@example.com'],
        replyEmail: sentEmail
      })
    })

    expect(result.current.emails).toHaveLength(1)
    expect(result.current.emails[0].messageID).toBe('example-id')
    expect(result.current.emails[0].subject).toBe('Re: Example subject')
    expect(result.current.emails[0].to).toStrictEqual(['sender@example.com'])
    expect(result.current.emails[0].from).toStrictEqual(['me@example.com'])
  })

  test('New forward for inbox email', () => {
    const { result } = renderHook(() => useContext(DraftEmailsContext), {
      wrapper: createWrapper()
    })

    act(() => {
      result.current.dispatch({
        type: 'new-forward',
        messageID: 'example-id',
        forwardEmail: inboxEmail
      })
    })
    expect(result.current.emails).toHaveLength(1)
    expect(result.current.emails[0].messageID).toBe('example-id')
    expect(result.current.emails[0].subject).toBe('Fwd: Example subject')
  })

  test('New forward for sent email', () => {
    const { result } = renderHook(() => useContext(DraftEmailsContext), {
      wrapper: createWrapper()
    })

    act(() => {
      result.current.dispatch({
        type: 'new-forward',
        messageID: 'example-id',
        forwardEmail: sentEmail
      })
    })
    expect(result.current.emails).toHaveLength(1)
    expect(result.current.emails[0].messageID).toBe('example-id')
    expect(result.current.emails[0].subject).toBe('Fwd: Example subject')
  })

  test('New reply quotes the original body', () => {
    const { result } = renderHook(() => useContext(DraftEmailsContext), {
      wrapper: createWrapper()
    })

    act(() => {
      result.current.dispatch({
        type: 'new-reply',
        messageID: 'example-id',
        allowedAddresses: ['me@example.com'],
        replyEmail: {
          ...inboxEmail,
          html: '<html><head><style>p {}</style></head><body lang="en">Content</body></html>'
        }
      })
    })
    const { html } = result.current.emails[0]
    expect(html).toContain('sender@example.com wrote:')
    expect(html).toContain('<div class="editor-email-quote">Content</div>')
    expect(html).not.toContain('<style>')
  })

  test('Open email', () => {
    const { result } = renderHook(() => useContext(DraftEmailsContext), {
      wrapper: createWrapper({
        emails: [
          { messageID: 'id-1' } as DraftEmail,
          { messageID: 'id-2' } as DraftEmail
        ],
        activeEmail: null
      })
    })

    expect(result.current.emails).toHaveLength(2)
    expect(result.current.activeEmail).toBeNull()
    act(() => {
      result.current.dispatch({
        type: 'open',
        messageID: 'id-1'
      })
    })
    expect(result.current.activeEmail?.messageID).toBe('id-1')

    act(() => {
      result.current.dispatch({
        type: 'open',
        messageID: 'id-2'
      })
    })
    expect(result.current.activeEmail?.messageID).toBe('id-2')
  })

  test('Load existing email', () => {
    const { result } = renderHook(() => useContext(DraftEmailsContext), {
      wrapper: createWrapper({
        emails: [
          { messageID: 'id-1' } as DraftEmail,
          { messageID: 'id-2' } as DraftEmail
        ],
        activeEmail: null
      })
    })

    expect(result.current.activeEmail).toBeNull()
    act(() => {
      result.current.dispatch({
        type: 'load',
        email: { messageID: 'id-1' } as DraftEmail
      })
    })
    expect(result.current.activeEmail?.messageID).toBe('id-1')
  })

  test('Load new email', () => {
    const { result } = renderHook(() => useContext(DraftEmailsContext), {
      wrapper: createWrapper()
    })

    expect(result.current.activeEmail).toBeNull()
    act(() => {
      result.current.dispatch({
        type: 'load',
        email: sentEmail
      })
    })
    expect(result.current.activeEmail?.messageID).toBe('example-id')
  })

  test('Minimize email', () => {
    const { result } = renderHook(() => useContext(DraftEmailsContext), {
      wrapper: createWrapper({
        emails: [
          { messageID: 'id-1' } as DraftEmail,
          { messageID: 'id-2' } as DraftEmail
        ],
        activeEmail: { messageID: 'id-1' } as DraftEmail
      })
    })

    expect(result.current.activeEmail?.messageID).toBe('id-1')
    act(() => {
      result.current.dispatch({
        type: 'minimize'
      })
    })
    expect(result.current.activeEmail).toBeNull()
  })

  test('Remove email', () => {
    const { result } = renderHook(() => useContext(DraftEmailsContext), {
      wrapper: createWrapper({
        emails: [
          { messageID: 'id-1' } as DraftEmail,
          { messageID: 'id-2' } as DraftEmail
        ],
        activeEmail: null
      })
    })

    expect(result.current.emails).toHaveLength(2)
    act(() => {
      result.current.dispatch({
        type: 'remove',
        messageID: 'id-1'
      })
    })
    expect(result.current.emails).toHaveLength(1)
    expect(result.current.emails[0].messageID).toBe('id-2')
  })

  test('Remove active email', () => {
    const { result } = renderHook(() => useContext(DraftEmailsContext), {
      wrapper: createWrapper({
        emails: [
          { messageID: 'id-1' } as DraftEmail,
          { messageID: 'id-2' } as DraftEmail
        ],
        activeEmail: { messageID: 'id-1' } as DraftEmail
      })
    })

    expect(result.current.emails).toHaveLength(2)
    expect(result.current.activeEmail?.messageID).toBe('id-1')
    act(() => {
      result.current.dispatch({
        type: 'remove',
        messageID: 'id-1'
      })
    })
    expect(result.current.emails).toHaveLength(1)
    expect(result.current.emails[0].messageID).toBe('id-2')
    expect(result.current.activeEmail).toBeNull()
  })

  test('Remove non-existent email', () => {
    const { result } = renderHook(() => useContext(DraftEmailsContext), {
      wrapper: createWrapper({
        emails: [
          { messageID: 'id-1' } as DraftEmail,
          { messageID: 'id-2' } as DraftEmail
        ],
        activeEmail: null
      })
    })

    expect(result.current.emails).toHaveLength(2)
    act(() => {
      result.current.dispatch({
        type: 'remove',
        messageID: 'id-3'
      })
    })
    expect(result.current.emails).toHaveLength(2)
  })

  test('Update email', () => {
    const { result } = renderHook(() => useContext(DraftEmailsContext), {
      wrapper: createWrapper({
        emails: [
          { messageID: 'id-1' } as DraftEmail,
          { messageID: 'id-2' } as DraftEmail
        ],
        activeEmail: null
      })
    })

    expect(result.current.emails).toHaveLength(2)
    act(() => {
      result.current.dispatch({
        type: 'update',
        messageID: 'id-1',
        email: { messageID: 'id-1', subject: 'New subject' } as DraftEmail
      })
    })
    expect(result.current.emails).toHaveLength(2)
    expect(result.current.emails[0].subject).toBe('New subject')
  })

  test('Update active email', () => {
    const { result } = renderHook(() => useContext(DraftEmailsContext), {
      wrapper: createWrapper({
        emails: [
          { messageID: 'id-1' } as DraftEmail,
          { messageID: 'id-2' } as DraftEmail
        ],
        activeEmail: { messageID: 'id-1' } as DraftEmail
      })
    })

    expect(result.current.emails).toHaveLength(2)
    expect(result.current.activeEmail?.subject).toBeUndefined()
    act(() => {
      result.current.dispatch({
        type: 'update',
        messageID: 'id-1',
        email: { messageID: 'id-1', subject: 'New subject' } as DraftEmail
      })
    })
    expect(result.current.emails).toHaveLength(2)
    expect(result.current.activeEmail?.subject).toBe('New subject')
  })

  test('Update email with different messageID', () => {
    const { result } = renderHook(() => useContext(DraftEmailsContext), {
      wrapper: createWrapper({
        emails: [
          { messageID: 'id-1' } as DraftEmail,
          { messageID: 'id-2' } as DraftEmail
        ],
        activeEmail: null
      })
    })

    expect(result.current.emails).toHaveLength(2)
    act(() => {
      result.current.dispatch({
        type: 'update',
        messageID: 'id-1',
        email: { messageID: 'id-3', subject: 'New subject' } as DraftEmail
      })
    })
    expect(result.current.emails).toHaveLength(2)
    expect(result.current.emails[0].messageID).toBe('id-3')
    expect(result.current.emails[0].subject).toBe('New subject')
  })

  test('Created reply keeps its fields', () => {
    const { result } = renderHook(() => useContext(DraftEmailsContext), {
      wrapper: createWrapper()
    })

    act(() => {
      result.current.dispatch({
        type: 'new-reply',
        messageID: 'local-1',
        allowedAddresses: ['me@example.com'],
        replyEmail: inboxEmail
      })
    })
    act(() => {
      result.current.dispatch({
        type: 'created',
        localID: 'local-1',
        messageID: 'draft-1',
        threadID: 'thread-1'
      })
    })

    for (const email of [
      result.current.activeEmail,
      result.current.emails[0]
    ]) {
      expect(email?.messageID).toBe('draft-1')
      expect(email?.threadID).toBe('thread-1')
      expect(email?.subject).toBe('Re: Example subject')
      expect(email?.to).toStrictEqual(['sender@example.com'])
      expect(email?.from).toStrictEqual(['me@example.com'])
      expect(email?.replyEmail).toBe(inboxEmail)
    }
  })
})
