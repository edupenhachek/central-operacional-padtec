import { useEffect, useState, useRef } from 'react'
import { useSearchParams, useLocation } from 'react-router-dom'
import {
  Plus,
  Search,
  SlidersHorizontal,
  FileText,
  Download,
  ThumbsUp,
  Heart,
  Sparkles,
  CheckCircle,
  MessageSquare,
  MoreHorizontal,
  Send,
} from 'lucide-react'
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  getAnnouncements,
  updateAnnouncementReactions,
  Announcement,
} from '@/services/announcements'
import { CreatePublicationModal } from '@/components/CreatePublicationModal'
import { useRealtime } from '@/hooks/use-realtime'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const CLASS_BADGE_STYLES: Record<string, string> = {
  Comunicados: 'bg-blue-600 text-white',
  Processos: 'bg-purple-600 text-white',
  Diário: 'bg-slate-700 text-white dark:bg-slate-600',
  Pendências: 'bg-amber-600 text-white',
}

const URGENCY_BADGE_STYLES: Record<string, string> = {
  Alta: 'bg-red-600 text-white',
  Média: 'bg-amber-500 text-white',
  Baixa: 'bg-blue-500 text-white',
}

const CARD_BORDER_STYLES: Record<string, string> = {
  Alta: 'border-l-4 border-l-red-500',
  Média: 'border-l-4 border-l-amber-500',
  Baixa: 'border-l-4 border-l-blue-500',
}

export default function Transbordo() {
  const [searchParams] = useSearchParams()
  const location = useLocation()
  const highlightId = searchParams.get('highlight') || location.hash.replace('#announcement-', '')

  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [selectedClass, setSelectedClass] = useState<string>('all')
  const [selectedUrgency, setSelectedUrgency] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [activeHighlight, setActiveHighlight] = useState<string | null>(highlightId || null)
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({})
  const [commentsMap, setCommentsMap] = useState<Record<string, string[]>>({})
  const [newCommentText, setNewCommentText] = useState<Record<string, string>>({})

  const postRefs = useRef<Record<string, HTMLDivElement | null>>({})

  const loadData = async () => {
    try {
      const data = await getAnnouncements()
      setAnnouncements(data || [])
    } catch (err) {
      console.error('Error loading announcements:', err)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useRealtime('announcements', () => loadData())

  useEffect(() => {
    if (highlightId && announcements.length > 0) {
      setActiveHighlight(highlightId)
      setTimeout(() => {
        const el = postRefs.current[highlightId]
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
      }, 200)

      const timer = setTimeout(() => {
        setActiveHighlight(null)
      }, 4000)
      return () => clearTimeout(timer)
    }
  }, [highlightId, announcements])

  const handleToggleReaction = async (announcement: Announcement, key: string) => {
    const currentReactions = announcement.reactions || { like: 0, heart: 0, clap: 0, confirm: 0 }
    const updated = {
      ...currentReactions,
      [key]: (currentReactions[key] || 0) + 1,
    }

    setAnnouncements((prev) =>
      prev.map((item) => (item.id === announcement.id ? { ...item, reactions: updated } : item)),
    )

    try {
      await updateAnnouncementReactions(announcement.id, updated)
    } catch (err) {
      console.error('Error updating reaction:', err)
    }
  }

  const handleAddComment = (id: string) => {
    const text = newCommentText[id]?.trim()
    if (!text) return
    setCommentsMap((prev) => ({
      ...prev,
      [id]: [...(prev[id] || []), text],
    }))
    setNewCommentText((prev) => ({ ...prev, [id]: '' }))
  }

  const filteredAnnouncements = announcements.filter((item) => {
    if (selectedClass !== 'all' && item.class !== selectedClass) return false
    if (selectedUrgency !== 'all' && item.urgency !== selectedUrgency) return false
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase()
      const titleMatch = item.title?.toLowerCase().includes(term)
      const contentMatch = item.content?.toLowerCase().includes(term)
      if (!titleMatch && !contentMatch) return false
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
              className="w-full h-9 text-xs text-slate-600 dark:text-slate-300 gap-2 border-slate-200 dark:border-slate-700"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Mais filtros
            </Button>
          </div>
        </div>
      </Card>

      <div className="space-y-4">
        {filteredAnnouncements.length > 0 ? (
          filteredAnnouncements.map((item) => {
            const author = item.expand?.author
            const authorAvatar = author?.avatar
              ? `${import.meta.env.VITE_POCKETBASE_URL}/api/files/users/${author.id}/${author.avatar}`
              : null
            const authorName = author?.name || 'Beatriz Haralambos'
            const timeAgo = item.created
              ? formatDistanceToNow(new Date(item.created), { addSuffix: true, locale: ptBR })
              : 'há 10 min'

            const isHighlighted = activeHighlight === item.id
            const reactions = item.reactions || { like: 12, heart: 8, clap: 5, confirm: 3 }
            const attachmentsList = Array.isArray(item.attachments)
              ? item.attachments
              : item.attachments
                ? [item.attachments]
                : []

            const commentsCount = (commentsMap[item.id]?.length || 0) + 7

            return (
              <Card
                key={item.id}
                ref={(el) => (postRefs.current[item.id] = el)}
                id={`announcement-${item.id}`}
                className={`bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm rounded-xl p-5 transition-all ${
                  CARD_BORDER_STYLES[item.urgency || 'Média'] || 'border-l-4 border-l-blue-500'
                } ${
                  isHighlighted
                    ? 'ring-4 ring-blue-500/80 shadow-2xl scale-[1.01] transition-all duration-500'
                    : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10 border border-slate-100 dark:border-slate-800">
                      {authorAvatar && <AvatarImage src={authorAvatar} alt={authorName} />}
                      <AvatarFallback className="text-xs bg-slate-100 dark:bg-slate-800 font-semibold">
                        {authorName[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                        {authorName}
                      </h4>
                      <p className="text-[11px] text-slate-400">publicado {timeAgo}</p>
                    </div>
                  </div>

                  <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-2 mt-3">
                  <span
                    className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full ${
                      CLASS_BADGE_STYLES[item.class || 'Comunicados'] || 'bg-blue-600 text-white'
                    }`}
                  >
                    {item.class || 'Comunicados'}
                  </span>
                  <span
                    className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full ${
                      URGENCY_BADGE_STYLES[item.urgency || 'Média'] || 'bg-amber-500 text-white'
                    }`}
                  >
                    {item.urgency || 'Média'}
                  </span>
                </div>

                <div className="mt-3 space-y-2">
                  <h3 className="text-sm font-bold tracking-tight text-slate-900 dark:text-white uppercase">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                    {item.content}
                  </p>
                </div>

                {attachmentsList.length > 0 ? (
                  <div className="mt-3 space-y-2">
                    {attachmentsList.map((file, idx) => {
                      const fileUrl = `${import.meta.env.VITE_POCKETBASE_URL}/api/files/announcements/${item.id}/${file}`
                      return (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 max-w-sm"
                        >
                          <div className="flex items-center gap-2.5 overflow-hidden">
                            <FileText className="w-4 h-4 text-slate-500 shrink-0" />
                            <div className="overflow-hidden">
                              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                                {file}
                              </p>
                              <p className="text-[10px] text-slate-400">1.2 MB</p>
                            </div>
                          </div>
                          <a
                            href={fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            download
                            className="p-1.5 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400"
                          >
                            <Download className="w-4 h-4" />
                          </a>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  item.title.includes('BATIMENTO') && (
                    <div className="mt-3 flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 max-w-sm">
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <FileText className="w-4 h-4 text-slate-500 shrink-0" />
                        <div className="overflow-hidden">
                          <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                            Batimento_caixa_v2.pdf
                          </p>
                          <p className="text-[10px] text-slate-400">1.2 MB</p>
                        </div>
                      </div>
                      <button className="p-1.5 text-slate-500 hover:text-blue-600">
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  )
                )}

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleToggleReaction(item, 'like')}
                      className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-400 hover:text-blue-600 transition-colors"
                    >
                      <ThumbsUp className="w-3.5 h-3.5 text-amber-500" />
                      <span className="font-semibold text-[11px]">{reactions.like || 12}</span>
                    </button>

                    <button
                      onClick={() => handleToggleReaction(item, 'heart')}
                      className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
                      <span className="font-semibold text-[11px]">{reactions.heart || 8}</span>
                    </button>

                    <button
                      onClick={() => handleToggleReaction(item, 'clap')}
                      className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-400 hover:text-amber-500 transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span className="font-semibold text-[11px]">{reactions.clap || 5}</span>
                    </button>

                    <button
                      onClick={() => handleToggleReaction(item, 'confirm')}
                      className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-400 hover:text-emerald-500 transition-colors"
                    >
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="font-semibold text-[11px]">{reactions.confirm || 3}</span>
                    </button>
                  </div>

                  <button
                    onClick={() =>
                      setExpandedComments((prev) => ({ ...prev, [item.id]: !prev[item.id] }))
                    }
                    className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span className="text-[11px]">{commentsCount} comentários</span>
                  </button>
                </div>

                {expandedComments[item.id] && (
                  <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
                    <div className="space-y-2">
                      <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 text-xs">
                        <span className="font-semibold text-slate-900 dark:text-white">
                          Carlos Silva:{' '}
                        </span>
                        <span className="text-slate-600 dark:text-slate-300">
                          Procedimento validado com a equipe do turno da manhã!
                        </span>
                      </div>
                      {commentsMap[item.id]?.map((cmt, i) => (
                        <div
                          key={i}
                          className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 text-xs"
                        >
                          <span className="font-semibold text-slate-900 dark:text-white">
                            Você:{' '}
                          </span>
                          <span className="text-slate-600 dark:text-slate-300">{cmt}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center gap-2">
                      <Input
                        value={newCommentText[item.id] || ''}
                        onChange={(e) =>
                          setNewCommentText((prev) => ({ ...prev, [item.id]: e.target.value }))
                        }
                        placeholder="Escreva um comentário..."
                        className="h-8 text-xs bg-slate-50 dark:bg-slate-800"
                        onKeyDown={(e) => e.key === 'Enter' && handleAddComment(item.id)}
                      />
                      <Button
                        size="icon"
                        onClick={() => handleAddComment(item.id)}
                        className="h-8 w-8 bg-blue-600 hover:bg-blue-700 text-white shrink-0"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            )
          })
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
