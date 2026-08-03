import { useEffect, useState, useMemo } from 'react'
import { useSearchParams, useLocation } from 'react-router-dom'
import { Plus, Search, SlidersHorizontal } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getAnnouncements, type Announcement } from '@/services/announcements'
import { getComments, type CommentRecord } from '@/services/comments'
import { CreatePublicationModal } from '@/components/CreatePublicationModal'
import { PublicationCard } from '@/components/transbordo/PublicationCard'
import { MoreFiltersPanel } from '@/components/transbordo/MoreFiltersPanel'
import { useRealtime } from '@/hooks/use-realtime'
import { cn } from '@/lib/utils'

export default function Transbordo() {
  const [searchParams] = useSearchParams()
  const location = useLocation()
  const highlightId = searchParams.get('highlight') || location.hash.replace('#announcement-', '')

  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [comments, setComments] = useState<CommentRecord[]>([])
  const [selectedClass, setSelectedClass] = useState('all')
  const [selectedUrgency, setSelectedUrgency] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [activeHighlight, setActiveHighlight] = useState<string | null>(highlightId || null)
  const [showMoreFilters, setShowMoreFilters] = useState(false)
  const [authorFilter, setAuthorFilter] = useState('')
  const [dateRange, setDateRange] = useState<
    { from: Date | undefined; to: Date | undefined } | undefined
  >(undefined)

  const loadData = async () => {
    try {
      const [annData, commentData] = await Promise.all([getAnnouncements(), getComments()])
      setAnnouncements(annData || [])
      setComments(commentData || [])
    } catch (err) {
      console.error('Error loading data:', err)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useRealtime('announcements', () => loadData())
  useRealtime('comments', () => {
    getComments()
      .then(setComments)
      .catch(() => {})
  })

  useEffect(() => {
    if (highlightId && announcements.length > 0) {
      setActiveHighlight(highlightId)
      setTimeout(() => {
        const el = document.getElementById(`announcement-${highlightId}`)
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }, 200)
      const timer = setTimeout(() => setActiveHighlight(null), 4000)
      return () => clearTimeout(timer)
    }
  }, [highlightId, announcements])

  const uniqueAuthors = useMemo(() => {
    const seen = new Map<string, { id: string; name: string }>()
    announcements.forEach((item) => {
      const author = item.expand?.author
      if (author?.id && author?.name && !seen.has(author.id)) {
        seen.set(author.id, { id: author.id, name: author.name })
      }
    })
    return Array.from(seen.values())
  }, [announcements])

  const commentsByAnnouncement = useMemo(() => {
    const map: Record<string, CommentRecord[]> = {}
    comments.forEach((c) => {
      if (!map[c.announcement]) map[c.announcement] = []
      map[c.announcement].push(c)
    })
    return map
  }, [comments])

  const filteredAnnouncements = announcements.filter((item) => {
    if (selectedClass !== 'all' && item.class !== selectedClass) return false
    if (selectedUrgency !== 'all' && item.urgency !== selectedUrgency) return false
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase()
      if (!item.title?.toLowerCase().includes(term) && !item.content?.toLowerCase().includes(term))
        return false
    }
    if (authorFilter.trim()) {
      const authorName = item.expand?.author?.name || ''
      if (!authorName.toLowerCase().includes(authorFilter.toLowerCase())) return false
    }
    if (dateRange && (dateRange.from || dateRange.to) && item.created) {
      const itemDate = new Date(item.created)
      if (dateRange.from && itemDate < dateRange.from) return false
      if (dateRange.to && itemDate > dateRange.to) return false
    }
    return true
  })

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Transbordo
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Realize e monitore comunicados à equipe.
          </p>
        </div>
        <Button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs h-10 px-4 rounded-xl shadow-sm gap-2"
        >
          <Plus className="w-4 h-4" />
          Criar Publicação
        </Button>
      </div>

      <Card className="p-4 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm rounded-xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1 block">
              Filtrar por classe
            </label>
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger className="h-9 text-xs bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700">
                <SelectValue placeholder="Todas as classes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as classes</SelectItem>
                <SelectItem value="Comunicados">Comunicados</SelectItem>
                <SelectItem value="Processos">Processos</SelectItem>
                <SelectItem value="Diário">Diário</SelectItem>
                <SelectItem value="Pendências">Pendências</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1 block">
              Filtrar por urgência
            </label>
            <Select value={selectedUrgency} onValueChange={setSelectedUrgency}>
              <SelectTrigger className="h-9 text-xs bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700">
                <SelectValue placeholder="Todas as urgências" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as urgências</SelectItem>
                <SelectItem value="Alta">Alta</SelectItem>
                <SelectItem value="Média">Média</SelectItem>
                <SelectItem value="Baixa">Baixa</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="lg:col-span-1">
            <label className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1 block">
              Busca
            </label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por palavra-chave..."
                className="h-9 text-xs pl-8 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"
              />
            </div>
          </div>
          <div className="flex items-end">
            <Button
              variant="outline"
              onClick={() => setShowMoreFilters((prev) => !prev)}
              className={cn(
                'w-full h-9 text-xs gap-2 border-slate-200 dark:border-slate-700 transition-colors',
                showMoreFilters
                  ? 'bg-blue-50 text-blue-600 border-blue-400 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800'
                  : 'text-slate-600 dark:text-slate-300',
              )}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Mais filtros
            </Button>
          </div>
        </div>
        {showMoreFilters && (
          <MoreFiltersPanel
            authorFilter={authorFilter}
            onAuthorChange={setAuthorFilter}
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
            uniqueAuthors={uniqueAuthors}
          />
        )}
      </Card>

      <div className="space-y-4">
        {filteredAnnouncements.length > 0 ? (
          filteredAnnouncements.map((item) => (
            <PublicationCard
              key={item.id}
              item={item}
              comments={commentsByAnnouncement[item.id] || []}
              isHighlighted={activeHighlight === item.id}
              onRefetch={loadData}
            />
          ))
        ) : (
          <Card className="p-8 text-center bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
            <p className="text-xs text-slate-500">
              Nenhuma publicação encontrada para os filtros selecionados.
            </p>
          </Card>
        )}
      </div>

      <CreatePublicationModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSuccess={loadData}
      />
    </div>
  )
}
