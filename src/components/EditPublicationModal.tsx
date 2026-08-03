import { useState, useRef } from 'react'
import { Upload, Trash2, Flame, AlertTriangle, ArrowDown } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { MentionField } from '@/components/MentionField'
import {
  updateAnnouncement,
  type Announcement,
  type AnnouncementClass,
  type AnnouncementUrgency,
} from '@/services/announcements'
import { toast } from 'sonner'

interface Props {
  announcement: Announcement
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function EditPublicationModal({ announcement, open, onOpenChange, onSuccess }: Props) {
  const [title, setTitle] = useState(announcement.title)
  const [cls, setClass] = useState<AnnouncementClass>(announcement.class || 'Comunicados')
  const [urgency, setUrgency] = useState<AnnouncementUrgency>(announcement.urgency || 'Média')
  const [content, setContent] = useState(announcement.content)
  const [newFiles, setNewFiles] = useState<File[]>([])
  const [existingFiles, setExistingFiles] = useState<string[]>(
    Array.isArray(announcement.attachments)
      ? announcement.attachments
      : announcement.attachments
        ? [announcement.attachments]
        : [],
  )
  const [isSubmitting, setIsSubmitting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !content.trim()) {
      toast.error('Preencha o título e o conteúdo.')
      return
    }
    setIsSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('title', title.trim())
      formData.append('class', cls)
      formData.append('urgency', urgency)
      formData.append('content', content.trim())
      existingFiles.forEach((f) => formData.append('attachments', f))
      newFiles.forEach((f) => formData.append('attachments', f))
      await updateAnnouncement(announcement.id, formData)
      toast.success('Publicação atualizada!')
      onOpenChange(false)
      onSuccess()
    } catch (err) {
      toast.error('Erro ao atualizar publicação.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b pb-4 border-slate-100 dark:border-slate-800">
          <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white">
            Editar publicação
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
              Título
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value.slice(0, 120))}
              className="h-10 text-sm bg-slate-50 dark:bg-slate-800/50"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                Classe
              </label>
              <Select value={cls} onValueChange={(v) => setClass(v as AnnouncementClass)}>
                <SelectTrigger className="h-10 text-sm bg-slate-50 dark:bg-slate-800/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Comunicados">Comunicados</SelectItem>
                  <SelectItem value="Processos">Processos</SelectItem>
                  <SelectItem value="Diário">Diário</SelectItem>
                  <SelectItem value="Pendências">Pendências</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                Urgência
              </label>
              <div className="grid grid-cols-3 gap-1.5 h-10">
                {[
                  { v: 'Alta' as const, icon: Flame, color: 'red' },
                  { v: 'Média' as const, icon: AlertTriangle, color: 'amber' },
                  { v: 'Baixa' as const, icon: ArrowDown, color: 'blue' },
                ].map(({ v, icon: Icon }) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setUrgency(v)}
                    className={`flex items-center justify-center gap-1 text-xs font-semibold rounded-lg border transition-all ${
                      urgency === v
                        ? `bg-${urgency === 'Alta' ? 'red' : urgency === 'Média' ? 'amber' : 'blue'}-50 text-${urgency === 'Alta' ? 'red' : urgency === 'Média' ? 'amber' : 'blue'}-600 border-${urgency === 'Alta' ? 'red' : urgency === 'Média' ? 'amber' : 'blue'}-500 dark:bg-${urgency === 'Alta' ? 'red' : urgency === 'Média' ? 'amber' : 'blue'}-950/60`
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-400'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" /> {v}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
              Conteúdo
            </label>
            <MentionField
              value={content}
              onChange={setContent}
              placeholder="Escreva sua mensagem..."
              multiline
              className="min-h-[110px] border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-800/40 focus-visible:ring-0 text-sm p-3 resize-none"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
              Anexos existentes
            </label>
            {existingFiles.length > 0 ? (
              <div className="space-y-1.5">
                {existingFiles.map((file, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs"
                  >
                    <span className="truncate max-w-[80%] font-medium">{file}</span>
                    <button
                      type="button"
                      onClick={() => setExistingFiles((prev) => prev.filter((_, i) => i !== idx))}
                      className="text-red-500 hover:text-red-700 p-0.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-slate-400">Nenhum anexo.</p>
            )}
          </div>
          <div>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-4 text-center cursor-pointer hover:border-blue-500 transition-colors bg-slate-50/50 dark:bg-slate-800/20"
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
                onChange={(e) => {
                  if (e.target.files)
                    setNewFiles((prev) => [...prev, ...Array.from(e.target.files!)].slice(0, 5))
                }}
              />
              <Upload className="w-4 h-4 text-blue-600 mx-auto mb-1" />
              <p className="text-xs text-slate-500">Adicionar novos anexos</p>
            </div>
            {newFiles.length > 0 && (
              <div className="mt-2 space-y-1.5">
                {newFiles.map((file, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs"
                  >
                    <span className="truncate max-w-[80%] font-medium">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => setNewFiles((prev) => prev.filter((_, i) => i !== idx))}
                      className="text-red-500 hover:text-red-700 p-0.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="h-10 text-xs px-5 rounded-lg"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-10 text-xs px-6 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg"
            >
              {isSubmitting ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
