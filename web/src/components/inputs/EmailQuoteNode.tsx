import {
  type DOMConversionMap,
  type DOMConversionOutput,
  type DOMExportOutput,
  DecoratorNode,
  type EditorConfig,
  LexicalEditor,
  LexicalNode,
  type NodeKey,
  type SerializedLexicalNode
} from 'lexical'
import { ReactNode } from 'react'

import { parseEmailHTML } from 'utils/emails'

export class EmailQuoteNode extends DecoratorNode<ReactNode> {
  __html: string

  constructor(html: string, key?: NodeKey) {
    super(key)
    this.__html = html
  }

  static getType(): string {
    return 'emailquote'
  }

  static clone(node: EmailQuoteNode): EmailQuoteNode {
    return new EmailQuoteNode(node.__html, node.__key)
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  createDOM(config: EditorConfig): HTMLElement {
    const div = document.createElement('div')
    return div
  }

  updateDOM(): false {
    return false
  }

  isInline(): false {
    return false
  }

  getTextContent(): string {
    return quoteText(this.getLatest().__html)
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
      ...super.exportJSON(),
      html: this.__html
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

interface EmailQuoteProps {
  html: string
}

export function EmailQuote(props: EmailQuoteProps) {
  return <>{parseEmailHTML(props.html)}</>
}

const BLOCK_TAGS = new Set([
  'ADDRESS',
  'BLOCKQUOTE',
  'DIV',
  'H1',
  'H2',
  'H3',
  'H4',
  'H5',
  'H6',
  'HR',
  'LI',
  'OL',
  'P',
  'PRE',
  'TABLE',
  'TR',
  'UL'
])
const SKIPPED_TAGS = new Set([
  'HEAD',
  'LINK',
  'META',
  'SCRIPT',
  'STYLE',
  'TITLE'
])

function nodeText(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) {
    return (node.textContent ?? '').replaceAll(/\s+/gu, ' ')
  }
  if (!(node instanceof Element) || SKIPPED_TAGS.has(node.tagName)) return ''
  if (node.tagName === 'BR') return '\n'

  const text = Array.from(node.childNodes)
    .map((child) => nodeText(child))
    .join('')
  return BLOCK_TAGS.has(node.tagName) ? `\n${text}\n` : text
}

// The quote is rebuilt on every edit, so keep the last conversion.
let lastQuote = { html: '', text: '' }

// quoteText converts quoted HTML to plain text, with each line prefixed by "> "
function quoteText(html: string): string {
  if (lastQuote.html !== html) {
    const { body } = new DOMParser().parseFromString(html, 'text/html')
    const text = nodeText(body)
      .split('\n')
      .map((line) => line.trim())
      .join('\n')
      .replaceAll(/\n{3,}/gu, '\n\n')
      .trim()
      .split('\n')
      .map((line) => (line ? `> ${line}` : '>'))
      .join('\n')
    lastQuote = { html, text }
  }
  return lastQuote.text
}
