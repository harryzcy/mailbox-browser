import { CodeHighlightNode, CodeNode } from '@lexical/code'
import { $generateHtmlFromNodes, $generateNodesFromDOM } from '@lexical/html'
import { AutoLinkNode, LinkNode } from '@lexical/link'
import { ListItemNode, ListNode } from '@lexical/list'
import { TRANSFORMERS } from '@lexical/markdown'
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin'
import {
  InitialConfigType,
  LexicalComposer
} from '@lexical/react/LexicalComposer'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary'
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin'
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin'
import { ListPlugin } from '@lexical/react/LexicalListPlugin'
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin'
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin'
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'
import { HeadingNode, QuoteNode } from '@lexical/rich-text'
import { TableCellNode, TableNode, TableRowNode } from '@lexical/table'
import { $getRoot, EditorState, LexicalEditor } from 'lexical'

import { EmailQuoteNode } from 'components/inputs/EmailQuoteNode'
import 'components/inputs/RichTextEditor.css'
import AutoLinkPlugin from 'components/inputs/plugins/AutoLinkPlugin'
import CodeHighlightPlugin from 'components/inputs/plugins/CodeHighlightPlugin'
import ListMaxIndentLevelPlugin from 'components/inputs/plugins/ListMaxIndentLevelPlugin'
import ToolbarPlugin from 'components/inputs/plugins/ToolbarPlugin'
import theme from 'components/inputs/themes/LexicalTheme'

function Placeholder() {
  return (
    <div className="pointer-events-none absolute left-3 top-3 inline-block select-none truncate text-slate-400 dark:text-neutral-400">
      Email body...
    </div>
  )
}

interface RichTextEditorProps {
  initialHtml: string
  handleChange: ({ html, text }: { html: string; text: string }) => void
  handleSend: () => void
  handleDelete: () => void
}

export default function RichTextEditor(props: RichTextEditorProps) {
  const updateHTML = (editor: LexicalEditor, value: string, clear: boolean) => {
    const root = $getRoot()
    const parser = new DOMParser()
    const dom = parser.parseFromString(value, 'text/html')
    const nodes = $generateNodesFromDOM(editor, dom)
    if (clear) {
      root.clear()
    }
    root.append(...nodes)
  }

  const editorConfig: InitialConfigType = {
    theme,
    namespace: 'email-editor',
    onError(error: Error) {
      throw error
    },
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
    editorState: (editor) => {
      if (!props.initialHtml) return undefined
      updateHTML(editor, props.initialHtml, true)
    }
  }

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
    <LexicalComposer initialConfig={editorConfig}>
      <div className="relative flex h-full min-h-[12rem] w-full flex-col rounded text-left font-normal leading-5 md:rounded-md">
        <div className="relative flex-1 overflow-scroll">
          <RichTextPlugin
            contentEditable={
              <ContentEditable
                className="relative min-h-full resize-none p-3 caret-inherit outline-none"
                style={{
                  tabSize: 1
                }}
              />
            }
            placeholder={<Placeholder />}
            ErrorBoundary={LexicalErrorBoundary}
          />
          <HistoryPlugin />
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
    </LexicalComposer>
  )
}
