import { CodeHighlightNode, CodeNode } from '@lexical/code'
import { HistoryExtension } from '@lexical/history'
import { $generateHtmlFromNodes, $generateNodesFromDOM } from '@lexical/html'
import { AutoLinkNode, LinkNode } from '@lexical/link'
import { ListItemNode, ListNode } from '@lexical/list'
import { TRANSFORMERS } from '@lexical/markdown'
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import { LexicalExtensionComposer } from '@lexical/react/LexicalExtensionComposer'
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin'
import { ListPlugin } from '@lexical/react/LexicalListPlugin'
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin'
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin'
import { HeadingNode, QuoteNode, RichTextExtension } from '@lexical/rich-text'
import { TableCellNode, TableNode, TableRowNode } from '@lexical/table'
import { $getRoot, EditorState, LexicalEditor, defineExtension } from 'lexical'
import { useState } from 'react'

import { EmailQuoteNode } from 'components/inputs/EmailQuoteNode'
import 'components/inputs/RichTextEditor.css'
import AutoLinkPlugin from 'components/inputs/plugins/AutoLinkPlugin'
import CodeHighlightPlugin from 'components/inputs/plugins/CodeHighlightPlugin'
import ListMaxIndentLevelPlugin from 'components/inputs/plugins/ListMaxIndentLevelPlugin'
import ToolbarPlugin from 'components/inputs/plugins/ToolbarPlugin'
import theme from 'components/inputs/themes/LexicalTheme'

const PLACEHOLDER_TEXT = 'Email body...'

function Placeholder() {
  return (
    <div className="pointer-events-none absolute top-3 left-3 inline-block truncate text-slate-400 select-none dark:text-neutral-400">
      {PLACEHOLDER_TEXT}
    </div>
  )
}

function updateHTML(editor: LexicalEditor, value: string, clear: boolean) {
  const root = $getRoot()
  const parser = new DOMParser()
  const dom = parser.parseFromString(value, 'text/html')
  const nodes = $generateNodesFromDOM(editor, dom)
  if (clear) {
    root.clear()
  }
  root.append(...nodes)
}

interface RichTextEditorProps {
  initialHtml: string
  handleChange: ({ html, text }: { html: string; text: string }) => void
  handleSend: () => void
  handleDelete: () => void
}

export default function RichTextEditor(props: RichTextEditorProps) {
  // Built once, on mount. The extension identity determines the editor's
  // lifetime, and handleChange feeds the editor's own output back into
  // initialHtml on every keystroke, so rebuilding on a new initialHtml would
  // discard whatever the user had typed.
  const [extension] = useState(() => {
    const initialHtml = props.initialHtml
    return defineExtension({
      $initialEditorState: (editor: LexicalEditor) => {
        if (!initialHtml) return
        updateHTML(editor, initialHtml, true)
      },
      dependencies: [RichTextExtension, HistoryExtension],
      name: '[root]',
      namespace: 'email-editor',
      nodes: [
        HeadingNode,
        ListNode,
        ListItemNode,
        QuoteNode,
        CodeNode,
        CodeHighlightNode,
        TableNode,
        TableCellNode,
        TableRowNode,
        AutoLinkNode,
        LinkNode,
        EmailQuoteNode
      ],
      onError(error: Error) {
        throw error
      },
      theme
    })
  })

  const onChange = (_: EditorState, editor: LexicalEditor) => {
    editor.update(() => {
      const html = `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body>${$generateHtmlFromNodes(
        editor,
        null
      )}</body></html>`
      const text = $getRoot().getTextContent()
      props.handleChange({
        html,
        text
      })
    })
  }

  return (
    <LexicalExtensionComposer extension={extension} contentEditable={null}>
      <div className="relative flex size-full min-h-48 flex-col rounded text-left leading-5 font-normal md:rounded-md">
        <div className="relative flex-1 overflow-scroll overscroll-contain">
          <ContentEditable
            className="relative min-h-full resize-none p-3 caret-inherit outline-hidden"
            style={{
              tabSize: 1
            }}
            aria-placeholder={PLACEHOLDER_TEXT}
            placeholder={<Placeholder />}
          />
          <OnChangePlugin onChange={onChange} ignoreSelectionChange />
          <AutoFocusPlugin />
          <CodeHighlightPlugin />
          <ListPlugin />
          <LinkPlugin />
          <AutoLinkPlugin />
          <ListMaxIndentLevelPlugin maxDepth={7} />
          <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
        </div>
        <ToolbarPlugin
          handleSend={props.handleSend}
          handleDelete={props.handleDelete}
        />
      </div>
    </LexicalExtensionComposer>
  )
}
