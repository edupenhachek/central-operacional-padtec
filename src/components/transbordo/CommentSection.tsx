import { useState } from 'react'
import { Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { MentionField } from '@/components/MentionField'
import { MarkdownRenderer } from '@/components/MarkdownRenderer'
import { createComment, type CommentRecord } from '@/services/comments'
import { useAuth } from '@/hooks/use-auth'
import { toast } from 'sonner'

interface CommentSectionProps {
  announcementId: string
  comments: CommentRecord[]
}

export function CommentSection({ announcementId, comments }: CommentSectionProps) {
  const { user } = useAuth()
  const [newComment, setNewComment] = useState('')

  const handleAddComment = async () => {
    const text = newComment.trim()
    if (!text || !user) return
    try {
      await createComment({ content: text, author: user.id, announcement: announcementId })
      setNewComment('')
    } catch (err) {
      toast.error('Erro ao adicionar comentário.')
    }
  }

  return (
    <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
      <div className="space-y-2">
        {comments.length > 0 ? (
          comments.map((cmt) => {
            const authorName = cmt.expand?.author?.name || 'Usuário'
            return (
              <div
                key={cmt.id}
                className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 text-xs"
              >
                <p className="font-semibold text-slate-900 dark:text-white mb-0.5">{authorName}</p>
                <div className="text-slate-600 dark:text-slate-300">
                  <MarkdownRenderer content={cmt.content} />
                </div>
              </div>
            )
          })
        ) : (
          <p className="text-[11px] text-slate-400 text-center py-2">
            Nenhum comentário ainda. Seja o primeiro a comentar!
          </p>
        )}
      </div>
      <div className="space-y-2">
        <MentionField
          value={newComment}
          onChange={setNewComment}
          placeholder="Escreva um comentário..."
          multiline
          className="w-full min-h-[52px] text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 resize-none"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              handleAddComment()
            }
          }}
          dropdownAbove
        />
        <div className="flex justify-end">
          <Button
            size="sm"
            onClick={handleAddComment}
            className="h-7 text-[11px] bg-blue-600 hover:bg-blue-700 text-white gap-1"
          >
            <Send className="w-3 h-3" />
            Comentar
          </Button>
        </div>
      </div>
    </div>
  )
}
