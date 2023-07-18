import { useContext, useReducer } from 'react'
import { renderHook } from '@testing-library/react'
import {
  DraftEmailsContext,
  draftEmailReducer,
  initialState
} from './DraftEmailContext'
import { act } from 'react-dom/test-utils'
import { Email } from '../services/emails'

describe('DraftEmailContext', () => {
  const wrapper = ({ children }: { children: JSX.Element }) => {
    const [state, dispatch] = useReducer(draftEmailReducer, initialState)

    return (
      <DraftEmailsContext.Provider
        value={{
          emails: state.emails,
          activeEmail: state.activeEmail,
          dispatch
        }}
      >
        {children}
      </DraftEmailsContext.Provider>
    )
  }

  test('New email', () => {
    const { result } = renderHook(() => useContext(DraftEmailsContext), {
      wrapper
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
      wrapper
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

  test('New reply', () => {
    const { result } = renderHook(() => useContext(DraftEmailsContext), {
      wrapper
    })

    act(() => {
      result.current.dispatch({
        type: 'new-reply',
        messageID: 'example-id',
        allowedAddresses: ['example@example.com'],
        replyEmail: {
          messageID: 'reply-to-id',
          type: 'inbox',
          from: ['example@example.com'],
          to: ['example@example.com'],
          subject: 'Example subject'
        } as Email
      })
    })
    expect(result.current.emails).toHaveLength(1)
    expect(result.current.emails[0].messageID).toBe('example-id')
    expect(result.current.emails[0].subject).toBe('Re: Example subject')
  })

  test('New forward', () => {
    const { result } = renderHook(() => useContext(DraftEmailsContext), {
      wrapper
    })

    act(() => {
      result.current.dispatch({
        type: 'new-forward',
        messageID: 'example-id',
        forwardEmail: {
          messageID: 'forward-to-id',
          type: 'inbox',
          from: ['example@example.com'],
          to: ['example@example.com'],
          subject: 'Example subject',
          html: '<body>Content</body>'
        } as Email
      })
    })
    expect(result.current.emails).toHaveLength(1)
    expect(result.current.emails[0].messageID).toBe('example-id')
    expect(result.current.emails[0].subject).toBe('Fwd: Example subject')
  })
})
