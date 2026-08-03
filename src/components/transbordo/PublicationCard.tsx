import { useState, useEffect } from 'react'
import {
  ThumbsUp,
  Heart,
  Sparkles,
  CheckCircle,
  MessageSquare,
  MoreHorizontal,
  Edit,
  Trash2,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { MarkdownRenderer } from '@/components/MarkdownRenderer'
import { AttachmentList } from '@/components/transbordo/AttachmentList'
import { CommentSection } from '@/components/transbordo/CommentSection'
import { EditPublicationModal } from '@/components/EditPublicationModal'
import {
  updateAnnouncementReactions,
  deleteAnnouncement,
  type Announcement,
} from '@/services/announcements'
import { type CommentRecord } from '@/services/comments'
import { useAuth } from '@/hooks/use-auth'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const CLASS_BADGE: Record<string, string> = {
  Comunicados: 'bg-blue-600 text-white',
  Processos: 'bg-purple-600 text-white',
  Diário: 'bg-slate-700 text-white dark:bg-slate-600',
  Pendências: 'bg-amber-600 text-white',
}
const URGENCY_BADGE: Record<string, string> = {
  Alta: 'bg-red-600 text-white',
  Média: 'bg-amber-500 text-white',
  Baixa: 'bg-blue-500 text-white',
}
const CARD_BORDER: Record<string, string> = {
  Alta: 'border-l-4 border-l-red-500',
  Média: 'border-l-4 border-l-amber-500',
  Baixa: 'border-l-4 border-l-blue-500',
}

interface Props {
  item: Announcement
  comments: CommentRecord[]
  isHighlighted: boolean
  onRefetch: () => void
}

export function PublicationCard({ item, comments, isHighlighted, onRefetch }: Props) {
  const { user } = useAuth()
  const [reactions, setReactions] = useState(
    item.reactions || { like: 0, heart: 0, clap: 0, confirm: 0 },
  )
  const [expanded, setExpanded] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  useEffect(() => {
    setReactions(item.reactions || { like: 0, heart: 0, clap: 0, confirm: 0 })
  }, [item.reactions])

  const author = item.expand?.author
  const authorAvatar = author?.avatar
    ? `${import.meta.env.VITE_POCKETBASE_URL}/api/files/users/${author.id}/${author.avatar}`
    : null
  const authorName = author?.name || 'Usuário'
  const timeAgo = item.created
    ? formatDistanceToNow(new Date(item.created), { addSuffix: true, locale: ptBR })
    : ''
  const canManage =
    user?.id === item.author || user?.role === 'ADMIN' || user?.role === 'SUPERADMIN'
  const attachmentsList = Array.isArray(item.attachments)
    ? item.attachments
    : item.attachments
      ? [item.attachments]
      : []

  const handleReaction = async (key: string) => {
    const updated = { ...reactions, [key]: (reactions[key] || 0) + 1 }
    setReactions(updated)
    try {
      await updateAnnouncementReactions(item.id, updated)
    } catch (err) {
      console.error('Error updating reaction:', err)
    }
  }

  const handleDelete = async () => {
    try {
      await deleteAnnouncement(item.id)
      toast.success('Publicação excluída.')
      setDeleteOpen(false)
      onRefetch()
    } catch (err) {
      toast.error('Erro ao excluir publicação.')
    }
  }

  const reactionButtons = [
    { key: 'like', icon: ThumbsUp, color: 'text-amber-500', hover: 'hover:text-blue-600' },
    { key: 'heart', icon: Heart, color: 'text-red-500 fill-red-500', hover: 'hover:text-red-500' },
    { key: 'clap', icon: Sparkles, color: 'text-amber-500', hover: 'hover:text-amber-500' },
    {
      key: 'confirm',
      icon: CheckCircle,
      color: 'text-emerald-500',
      hover: 'hover:text-emerald-500',
    },
  ]

  return (
    <Card
      id={`announcement-${item.id}`}
      className={cn(
        'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm rounded-xl p-5 transition-all',
        CARD_BORDER[item.urgency || 'Média'] || 'border-l-4 border-l-blue-500',
        isHighlighted &&
          'ring-4 ring-blue-500/80 shadow-2xl scale-[1.01] transition-all duration-500',
      )}
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
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">{authorName}</h4>
            <p className="text-[11px] text-slate-400">{timeAgo ? `publicado ${timeAgo}` : ''}</p>
          </div>
        </div>
        {canManage && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setEditOpen(true)}>
                <Edit className="w-3.5 h-3.5 mr-2" /> Editar
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setDeleteOpen(true)}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="w-3.5 h-3.5 mr-2" /> Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      <div className="flex items-center gap-2 mt-3">
        <span
          className={cn(
            'text-[10px] font-semibold px-2.5 py-0.5 rounded-full',
            CLASS_BADGE[item.class || 'Comunicados'] || 'bg-blue-600 text-white',
          )}
        >
          {item.class || 'Comunicados'}
        </span>
        <span
          className={cn(
            'text-[10px] font-semibold px-2.5 py-0.5 rounded-full',
            URGENCY_BADGE[item.urgency || 'Média'] || 'bg-amber-500 text-white',
          )}
        >
          {item.urgency || 'Média'}
        </span>
      </div>

      <div className="mt-3 space-y-2">
        <h3 className="text-sm font-bold tracking-tight text-slate-900 dark:text-white uppercase">
          {item.title}
        </h3>
        <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          <MarkdownRenderer content={item.content} />
        </div>
      </div>

      {attachmentsList.length > 0 && (
        <AttachmentList attachments={attachmentsList} announcementId={item.id} />
      )}

      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {reactionButtons.map(({ key, icon: Icon, color, hover }) => (
            <button
              key={key}
              onClick={() => handleReaction(key)}
              className={cn(
                'flex items-center gap-1 text-xs text-slate-600 dark:text-slate-400 transition-colors',
                hover,
              )}
            >
              <Icon className={cn('w-3.5 h-3.5', color)} />
              <span className="font-semibold text-[11px]">{reactions[key] || 0}</span>
            </button>
          ))}
        </div>
        <button
          onClick={() => setExpanded((prev) => !prev)}
          className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span className="text-[11px]">
            {comments.length} {comments.length === 1 ? 'comentário' : 'comentários'}
          </span>
        </button>
      </div>

      {expanded && <CommentSection announcementId={item.id} comments={comments} />}

      {editOpen && (
        <EditPublicationModal
          announcement={item}
          open={editOpen}
          onOpenChange={setEditOpen}
          onSuccess={onRefetch}
        />
      )}

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Excluir publicação</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir esta publicação? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setDeleteOpen(false)} className="text-xs h-9">
              Cancelar
            </Button>
            <Button
              onClick={handleDelete}
              className="text-xs h-9 bg-red-600 hover:bg-red-700 text-white"
            >
              Excluir
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
