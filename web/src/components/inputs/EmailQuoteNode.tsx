import {
  DOMConversionMap,
  DOMConversionOutput,
  DOMExportOutput,
  DecoratorNode,
  EditorConfig,
  LexicalEditor,
  LexicalNode,
  NodeKey,
  SerializedLexicalNode
} from 'lexical'
import { ReactNode } from 'react'

import { parseEmailHTML } from '../../utils/emails'

export class EmailQuoteNode extends DecoratorNode<ReactNode> {
  __html: string

  static getType(): string {
    return 'emailquote'
  }

  static clone(node: EmailQuoteNode): EmailQuoteNode {
    return new EmailQuoteNode(node.__html, node.__key)
  }

  constructor(html: string, key?: NodeKey) {
    super(key)
    this.__html = html
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  createDOM(config: EditorConfig): HTMLElement {
    const div = document.createElement('div')
    return div
  }

  updateDOM(): false {
    return false
  }

  setHTML(html: string): void {
    const self = this.getWritable()
    self.__html = html
  }

  getHTML(): string {
    const self = this.getLatest()
    return self.__html
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  decorate(editor: LexicalEditor): ReactNode {
    return <EmailQuote html={this.__html} />
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  exportDOM(editor: LexicalEditor): DOMExportOutput {
    const div = document.createElement('div')
    div.className = 'editor-email-quote'
    let innerHTML = this.__html.trim()
    if (innerHTML.startsWith(`<div class="editor-email-quote">`)) {
      innerHTML = innerHTML.replace(`<div class="editor-email-quote">`, '')
      innerHTML = innerHTML.slice(0, -6) // </div>
    }
    div.innerHTML = innerHTML.trim()
    return { element: div }
  }

  static importDOM(): DOMConversionMap | null {
    return {
      div: (node: Node) => {
        if (
          node instanceof HTMLDivElement &&
          node.classList.contains('editor-email-quote')
        ) {
          return {
            conversion: convertEmailQuoteElement,
            priority: 3
          }
        }
        return null
      }
    }
  }

  exportJSON(): SerializedEmailQuoteNode {
    return {
      html: this.__html,
      type: 'emailquote',
      version: 1
    }
  }

  static importJSON(serializedNode: SerializedEmailQuoteNode): EmailQuoteNode {
    const node = $createEmailQuoteNode(serializedNode.html)
    return node
  }
}

type SerializedEmailQuoteNode = SerializedLexicalNode & {
  html: string
}

export function $createEmailQuoteNode(html: string): EmailQuoteNode {
  return new EmailQuoteNode(html)
}

export function $isEmailQuoteNode(node: LexicalNode): boolean {
  return node instanceof EmailQuoteNode
}

function convertEmailQuoteElement(domNode: Node): DOMConversionOutput {
  const node = $createEmailQuoteNode(
    domNode.firstChild?.parentElement?.outerHTML ?? ''
  )
  return { node }
}

type EmailQuoteProps = {
  html: string
}

export function EmailQuote(props: EmailQuoteProps) {
  return <>{parseEmailHTML(props.html)}</>
}
