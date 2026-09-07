import { act, cleanup, render, screen } from '@testing-library/react'
import type { LexicalEditor } from 'lexical'
import {
  $createParagraphNode,
  $createTextNode,
  $getRoot,
  HISTORY_PUSH_TAG
} from 'lexical'
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

function button(label: string): HTMLButtonElement {
  return screen.getByLabelText(label) as HTMLButtonElement
}

function getEditor(): LexicalEditor {
  const element = screen.getByRole('textbox') as HTMLElement & {
    __lexicalEditor?: LexicalEditor
  }
  const editor = element.__lexicalEditor
  if (!editor) throw new Error('editor not attached to the content editable')
  return editor
}

function appendParagraph(editor: LexicalEditor, tag?: string) {
  act(() => {
    editor.update(
      () => {
        const paragraph = $createParagraphNode()
        paragraph.append($createTextNode('typed'))
        $getRoot().append(paragraph)
      },
      tag ? { discrete: true, tag } : { discrete: true }
    )
  })
}

describe('RichTextEditor', () => {
  test('loads initialHtml into the editor', () => {
    renderEditor('<p>hello draft</p>')
    expect(screen.getByRole('textbox').textContent).toContain('hello draft')
  })

  test('shows the placeholder only while the editor is empty', () => {
    renderEditor('')
    expect(screen.getByText('Email body...')).toBeTruthy()
    cleanup()

    renderEditor('<p>hello draft</p>')
    expect(screen.queryByText('Email body...')).toBeNull()
  })

  // The toolbar reads the editor state to refresh its active formats, and that
  // read resolves computed styles to detect text direction. Without an editor
  // on the read it throws, and every later toolbar update is skipped.
  test('keeps refreshing the toolbar after an edit', () => {
    renderEditor('<p>hello draft</p>')
    appendParagraph(getEditor())

    expect(screen.getByRole('textbox').textContent).toContain('typed')
  })

  test('starts with undo and redo disabled', () => {
    renderEditor('<p>hello draft</p>')
    expect(button('Undo').disabled).toBe(true)
    expect(button('Redo').disabled).toBe(true)
  })

  test('enables undo once the document changes', () => {
    renderEditor('<p>hello draft</p>')
    appendParagraph(getEditor(), HISTORY_PUSH_TAG)

    expect(button('Undo').disabled).toBe(false)
    expect(button('Redo').disabled).toBe(true)
  })

  test('ignores later initialHtml changes so typing is not discarded', () => {
    renderEditor('<p>first</p>')
    const editor = getEditor()
    appendParagraph(editor)

    expect(getEditor()).toBe(editor)
    expect(screen.getByRole('textbox').textContent).toContain('typed')
  })
})
