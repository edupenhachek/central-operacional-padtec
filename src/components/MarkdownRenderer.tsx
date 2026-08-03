import { useMemo, type ReactNode } from 'react'

export function MarkdownRenderer({ content }: { content: string }) {
  const elements = useMemo(() => parseMarkdown(content), [content])
  return <div className="space-y-2">{elements}</div>
}

function parseInline(text: string): ReactNode {
  const pattern = /\*\*(.+?)\*\*|`(.+?)`|@\[([^\]]+)\]/g
  const parts: ReactNode[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null
  let key = 0

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index))
    }
    if (match[1] !== undefined) {
      parts.push(
        <strong key={key++} className="font-semibold">
          {match[1]}
        </strong>,
      )
    } else if (match[2] !== undefined) {
      parts.push(
        <code key={key++} className="px-1 py-0.5 rounded bg-muted/80 text-xs font-mono">
          {match[2]}
        </code>,
      )
    } else if (match[3] !== undefined) {
      parts.push(
        <span
          key={key++}
          className="inline-flex items-center px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 text-xs font-medium cursor-pointer hover:bg-blue-200 dark:hover:bg-blue-900 transition-colors"
        >
          @{match[3]}
        </span>,
      )
    }
    lastIndex = match.index + match[0].length
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex))
  }

  return parts.length <= 1 ? (parts[0] ?? '') : <>{parts}</>
}

function parseMarkdown(text: string): ReactNode[] {
  const lines = text.split('\n')
  const blocks: ReactNode[] = []
  let i = 0
  let key = 0

  while (i < lines.length) {
    const trimmed = lines[i].trim()

    if (!trimmed) {
      i++
      continue
    }

    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      const items: string[] = []
      while (i < lines.length) {
        const t = lines[i].trim()
        if (t.startsWith('- ') || t.startsWith('* ')) {
          items.push(t.slice(2))
          i++
        } else if (!t) {
          i++
          break
        } else {
          break
        }
      }
      blocks.push(
        <ul key={key++} className="list-disc list-inside space-y-1 ml-1">
          {items.map((item, idx) => (
            <li key={idx}>{parseInline(item)}</li>
          ))}
        </ul>,
      )
      continue
    }

    if (/^\d+\.\s/.test(trimmed)) {
      const items: string[] = []
      while (i < lines.length) {
        const t = lines[i].trim()
        if (/^\d+\.\s/.test(t)) {
          items.push(t.replace(/^\d+\.\s/, ''))
          i++
        } else if (!t) {
          i++
          break
        } else {
          break
        }
      }
      blocks.push(
        <ol key={key++} className="list-decimal list-inside space-y-1 ml-1">
          {items.map((item, idx) => (
            <li key={idx}>{parseInline(item)}</li>
          ))}
        </ol>,
      )
      continue
    }

    if (trimmed.startsWith('|')) {
      const tableLines: string[] = []
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        tableLines.push(lines[i].trim())
        i++
      }
      blocks.push(
        <div key={key++} className="space-y-0.5 p-2 bg-muted/50 rounded text-xs">
          {tableLines.map((l, idx) => (
            <div key={idx}>{parseInline(l.replace(/\|/g, ' ').replace(/\s+/g, ' ').trim())}</div>
          ))}
        </div>,
      )
      continue
    }

    if (trimmed.startsWith('### ')) {
      blocks.push(
        <h4 key={key++} className="font-semibold text-sm">
          {parseInline(trimmed.slice(4))}
        </h4>,
      )
      i++
      continue
    }
    if (trimmed.startsWith('## ')) {
      blocks.push(
        <h3 key={key++} className="font-semibold text-base">
          {parseInline(trimmed.slice(3))}
        </h3>,
      )
      i++
      continue
    }
    if (trimmed.startsWith('# ')) {
      blocks.push(
        <h2 key={key++} className="font-bold text-base">
          {parseInline(trimmed.slice(2))}
        </h2>,
      )
      i++
      continue
    }

    const paraLines: string[] = []
    while (i < lines.length) {
      const t = lines[i].trim()
      if (!t) break
      if (t.startsWith('- ') || t.startsWith('* ')) break
      if (/^\d+\.\s/.test(t)) break
      if (t.startsWith('#')) break
      if (t.startsWith('|')) break
      paraLines.push(t)
      i++
    }
    if (paraLines.length > 0) {
      blocks.push(
        <p key={key++} className="leading-relaxed">
          {parseInline(paraLines.join(' '))}
        </p>,
      )
    }
  }

  return blocks
}
