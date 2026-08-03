import { useState, useEffect, useRef, useMemo, type KeyboardEvent } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getUsers } from '@/services/users'
import { cn } from '@/lib/utils'

interface MentionUser {
  id: string
  name: string
  avatar?: string
}

interface MentionFieldProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  multiline?: boolean
  className?: string
  onKeyDown?: (e: KeyboardEvent) => void
  dropdownAbove?: boolean
}

export function MentionField({
  value,
  onChange,
  placeholder,
  multiline,
  className,
  onKeyDown,
  dropdownAbove,
}: MentionFieldProps) {
  const [users, setUsers] = useState<MentionUser[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [query, setQuery] = useState('')
  const [selectedIdx, setSelectedIdx] = useState(0)
  const fieldRef = useRef<any>(null)

  useEffect(() => {
    getUsers('Ativo = true')
      .then((u) => setUsers(u.map((x) => ({ id: x.id, name: x.name, avatar: x.avatar }))))
      .catch(() => {})
  }, [])

  const filtered = useMemo(() => {
    if (!query) return users.slice(0, 8)
    return users.filter((u) => u.name.toLowerCase().includes(query.toLowerCase())).slice(0, 8)
  }, [users, query])

  const buildAvatarUrl = (user: MentionUser): string | null => {
    if (!user.avatar) return null
    return `${import.meta.env.VITE_POCKETBASE_URL}/api/files/users/${user.id}/${user.avatar}`
  }

  const checkMention = (text: string, pos: number) => {
    const before = text.slice(0, pos)
    const atIdx = before.lastIndexOf('@')
    if (atIdx === -1) return null
    const charBefore = atIdx > 0 ? before[atIdx - 1] : ' '
    if (charBefore !== ' ' && charBefore !== '\n' && atIdx !== 0) return null
    const q = before.slice(atIdx + 1)
    if (q.includes('\n') || q.includes('@')) return null
    return { atIdx, query: q }
  }

  const detectMention = (text: string, pos: number) => {
    const mention = checkMention(text, pos)
    if (mention) {
      setQuery(mention.query)
      setShowDropdown(true)
      setSelectedIdx(0)
    } else {
      setShowDropdown(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<any>) => {
    const newVal = e.target.value
    const pos = e.target.selectionStart || newVal.length
    onChange(newVal)
    detectMention(newVal, pos)
  }

  const handleSelect = (el: any) => {
    const pos = el?.selectionStart || value.length
    detectMention(value, pos)
  }

  const insertMention = (user: MentionUser) => {
    const el = fieldRef.current
    if (!el) return
    const pos = el.selectionStart || value.length
    const before = value.slice(0, pos)
    const after = value.slice(pos)
    const atIdx = before.lastIndexOf('@')
    if (atIdx === -1) return
    const insertion = `@[${user.name}] `
    const newText = before.slice(0, atIdx) + insertion + after
    onChange(newText)
    setShowDropdown(false)
    const newPos = atIdx + insertion.length
    requestAnimationFrame(() => {
      el.focus()
      el.setSelectionRange(newPos, newPos)
    })
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (showDropdown && filtered.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIdx((i) => (i + 1) % filtered.length)
        return
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIdx((i) => (i - 1 + filtered.length) % filtered.length)
        return
      }
      if (e.key === 'Enter') {
        e.preventDefault()
        insertMention(filtered[selectedIdx])
        return
      }
      if (e.key === 'Escape') {
        e.preventDefault()
        setShowDropdown(false)
        return
      }
    }
    onKeyDown?.(e)
  }

  const commonProps = {
    value,
    onChange: handleChange,
    onKeyDown: handleKeyDown,
    onClick: (e: React.MouseEvent<any>) => handleSelect(e.target),
    onBlur: () => setTimeout(() => setShowDropdown(false), 150),
    placeholder,
    className,
    ref: fieldRef,
  }

  return (
    <div className="relative">
      {multiline ? <Textarea {...commonProps} /> : <Input {...commonProps} />}
      {showDropdown && filtered.length > 0 && (
        <div
          className={cn(
            'absolute z-50 left-0 w-72 max-h-52 overflow-y-auto rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-xl',
            dropdownAbove ? 'bottom-full mb-1' : 'top-full mt-1',
          )}
        >
          {filtered.map((u, i) => {
            const avatarUrl = buildAvatarUrl(u)
            return (
              <button
                key={u.id}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault()
                  insertMention(u)
                }}
                className={cn(
                  'w-full flex items-center gap-2 text-left px-2.5 py-2 text-xs hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors',
                  i === selectedIdx && 'bg-blue-50 dark:bg-blue-950/40',
                )}
              >
                <Avatar className="w-6 h-6 shrink-0 border border-slate-200 dark:border-slate-700">
                  {avatarUrl && <AvatarImage src={avatarUrl} alt={u.name} />}
                  <AvatarFallback className="text-[10px] bg-slate-200 dark:bg-slate-700 font-semibold text-slate-600 dark:text-slate-300">
                    {u.name[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="truncate text-slate-700 dark:text-slate-200">{u.name}</span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
