import { $getRoot, $insertNodes, EditorState, LexicalEditor } from 'lexical'
import {
  InitialConfigType,
  LexicalComposer
} from '@lexical/react/LexicalComposer'
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin'
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin'
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin'
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary'
import ToolbarPlugin from './plugins/ToolbarPlugin'
import { HeadingNode, QuoteNode } from '@lexical/rich-text'
import { TableCellNode, TableNode, TableRowNode } from '@lexical/table'
import { ListItemNode, ListNode } from '@lexical/list'
import { CodeHighlightNode, CodeNode } from '@lexical/code'
import { AutoLinkNode, LinkNode } from '@lexical/link'
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin'
import { ListPlugin } from '@lexical/react/LexicalListPlugin'
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin'
import { TRANSFORMERS } from '@lexical/markdown'
import { $generateHtmlFromNodes, $generateNodesFromDOM } from '@lexical/html'
import ListMaxIndentLevelPlugin from './plugins/ListMaxIndentLevelPlugin'
import CodeHighlightPlugin from './plugins/CodeHighlightPlugin'
import AutoLinkPlugin from './plugins/AutoLinkPlugin'

import theme from './themes/LexicalTheme'
import './RichTextEditor.css'
import { useEffect } from 'react'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'

function Placeholder() {
  return (
    <div className="inline-block text-slate-400 dark:text-neutral-400 truncate absolute left-3 top-3 select-none pointer-events-none">
      Email body...
    </div>
  )
}

interface RichTextEditorProps {
  initialHtml: string
  handleChange: ({ html, text }: { html: string; text: string }) => void
  handleSend: () => void
  handleDelete?: () => void
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
      LinkNode
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
      <div className="flex flex-col w-full h-full relative rounded md:rounded-md font-normal leading-5 text-left">
        <div className="relative flex-1 overflow-scroll">
          <RichTextPlugin
            contentEditable={
              <ContentEditable
                className="relative min-h-full resize-none outline-none p-3 caret-inherit"
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
