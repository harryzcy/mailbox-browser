import { act, cleanup, render, screen } from '@testing-library/react'
import type { LexicalEditor } from 'lexical'
import { $createParagraphNode, $createTextNode, $getRoot } from 'lexical'
import { afterEach, describe, expect, test, vi } from 'vitest'

import RichTextEditor from './RichTextEditor'

afterEach(cleanup)

function renderEditor(initialHtml = '') {
  render(
    <RichTextEditor
      initialHtml={initialHtml}
      handleChange={vi.fn<(value: { html: string; text: string }) => void>()}
      handleSend={vi.fn<() => void>()}
      handleDelete={vi.fn<() => void>()}
    />
  )
}

function getEditor(): LexicalEditor {
  const element = screen.getByRole('textbox') as HTMLElement & {
    __lexicalEditor?: LexicalEditor
  }
  const editor = element.__lexicalEditor
  if (!editor) throw new Error('editor not attached to the content editable')
  return editor
}

describe('RichTextEditor', () => {
  // The toolbar reads the editor state to refresh its active formats, and that
  // read resolves computed styles to detect text direction. Without an editor
  // on the read it throws, and every later toolbar update is skipped.
  test('keeps refreshing the toolbar after an edit', () => {
    renderEditor('<p>hello draft</p>')
    const editor = getEditor()

    act(() => {
      editor.update(
        () => {
          const paragraph = $createParagraphNode()
          paragraph.append($createTextNode('typed'))
          $getRoot().append(paragraph)
        },
        { discrete: true }
      )
    })

    expect(screen.getByRole('textbox').textContent).toContain('typed')
  })
})
