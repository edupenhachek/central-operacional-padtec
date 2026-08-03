import { useState, useRef } from 'react'
import {
  Upload,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Code,
  Flame,
  AlertTriangle,
  ArrowDown,
  Trash2,
} from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MentionField } from '@/components/MentionField'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  createAnnouncement,
  AnnouncementClass,
  AnnouncementUrgency,
} from '@/services/announcements'
import { useAuth } from '@/hooks/use-auth'
import { toast } from 'sonner'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function CreatePublicationModal({ open, onOpenChange, onSuccess }: Props) {
  const { user } = useAuth()
  const [title, setTitle] = useState('')
  const [cls, setClass] = useState<AnnouncementClass | ''>('')
  const [urgency, setUrgency] = useState<AnnouncementUrgency>('Média')
  const [content, setContent] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFormat = (tag: string) => {
    setContent((prev) => {
      if (tag === 'bold') return prev + ' **texto**'
      if (tag === 'italic') return prev + ' *texto*'
      if (tag === 'underline') return prev + ' <u>texto</u>'
      if (tag === 'list') return prev + '\n• Item'
      if (tag === 'numlist') return prev + '\n1. Item'
      if (tag === 'code') return prev + ' `codigo`'
      return prev
    })
  }

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    if (e.dataTransfer.files) {
      const added = Array.from(e.dataTransfer.files).filter((f) => f.size <= 10 * 1024 * 1024)
      setFiles((prev) => [...prev, ...added].slice(0, 5))
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const added = Array.from(e.target.files).filter((f) => f.size <= 10 * 1024 * 1024)
      setFiles((prev) => [...prev, ...added].slice(0, 5))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !cls || !content.trim()) {
      toast.error('Preencha o título, a classe e o conteúdo da publicação.')
      return
    }

    setIsSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('title', title.trim())
      formData.append('class', cls)
      formData.append('urgency', urgency)
      formData.append('content', content.trim())
      if (user?.id) formData.append('author', user.id)
      formData.append('reactions', JSON.stringify({ like: 0, heart: 0, clap: 0, confirm: 0 }))

      files.forEach((file) => {
        formData.append('attachments', file)
      })

      await createAnnouncement(formData)
      toast.success('Publicação criada com sucesso!')
      setTitle('')
      setClass('')
      setUrgency('Média')
      setContent('')
      setFiles([])
      onOpenChange(false)
      onSuccess()
    } catch (err) {
      console.error(err)
      toast.error('Erro ao criar publicação.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 backdrop-blur-md max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between border-b pb-4 border-slate-100 dark:border-slate-800">
          <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white">
            Nova publicação
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Título da publicação
              </label>
              <span className="text-[11px] text-slate-400">{title.length}/120</span>
            </div>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value.slice(0, 120))}
              placeholder="Digite um título claro e objetivo..."
              className="h-10 text-sm bg-slate-50 dark:bg-slate-800/50"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                Classe (tipo de publicação)
              </label>
              <Select value={cls} onValueChange={(val) => setClass(val as AnnouncementClass)}>
                <SelectTrigger className="h-10 text-sm bg-slate-50 dark:bg-slate-800/50">
                  <SelectValue placeholder="Selecione a classe" />
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
                <button
                  type="button"
                  onClick={() => setUrgency('Alta')}
                  className={`flex items-center justify-center gap-1 text-xs font-semibold rounded-lg border transition-all ${
                    urgency === 'Alta'
                      ? 'bg-red-50 text-red-600 border-red-500 dark:bg-red-950/60'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-400'
                  }`}
                >
                  <Flame className="w-3.5 h-3.5 text-red-500" /> Alta
                </button>
                <button
                  type="button"
                  onClick={() => setUrgency('Média')}
                  className={`flex items-center justify-center gap-1 text-xs font-semibold rounded-lg border transition-all ${
                    urgency === 'Média'
                      ? 'bg-amber-50 text-amber-600 border-amber-500 dark:bg-amber-950/60'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-400'
                  }`}
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500" /> Média
                </button>
                <button
                  type="button"
                  onClick={() => setUrgency('Baixa')}
                  className={`flex items-center justify-center gap-1 text-xs font-semibold rounded-lg border transition-all ${
                    urgency === 'Baixa'
                      ? 'bg-blue-50 text-blue-600 border-blue-500 dark:bg-blue-950/60'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-400'
                  }`}
                >
                  <ArrowDown className="w-3.5 h-3.5 text-blue-500" /> Baixa
                </button>
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
              Conteúdo
            </label>
            <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-visible bg-slate-50 dark:bg-slate-800/40">
              <div className="flex items-center gap-1 p-2 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs">
                <span className="font-semibold text-slate-500 px-1">Normal</span>
                <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-700 mx-1" />
                <button
                  type="button"
                  onClick={() => handleFormat('bold')}
                  className="p-1 hover:bg-slate-100 rounded dark:hover:bg-slate-700"
                  title="Negrito"
                >
                  <Bold className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleFormat('italic')}
                  className="p-1 hover:bg-slate-100 rounded dark:hover:bg-slate-700"
                  title="Itálico"
                >
                  <Italic className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleFormat('underline')}
                  className="p-1 hover:bg-slate-100 rounded dark:hover:bg-slate-700"
                  title="Sublinhado"
                >
                  <Underline className="w-3.5 h-3.5" />
                </button>
                <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-700 mx-1" />
                <button
                  type="button"
                  onClick={() => handleFormat('list')}
                  className="p-1 hover:bg-slate-100 rounded dark:hover:bg-slate-700"
                  title="Lista de marcadores"
                >
                  <List className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleFormat('numlist')}
                  className="p-1 hover:bg-slate-100 rounded dark:hover:bg-slate-700"
                  title="Lista numerada"
                >
                  <ListOrdered className="w-3.5 h-3.5" />
                </button>
                <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-700 mx-1" />
                <button
                  type="button"
                  onClick={() => handleFormat('code')}
                  className="p-1 hover:bg-slate-100 rounded dark:hover:bg-slate-700"
                  title="Código"
                >
                  <Code className="w-3.5 h-3.5" />
                </button>
              </div>
              <MentionField
                value={content}
                onChange={setContent}
                placeholder="Escreva sua mensagem para a equipe..."
                multiline
                className="min-h-[110px] border-none bg-transparent focus-visible:ring-0 text-sm p-3 resize-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
              Anexos
            </label>
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleFileDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-5 text-center cursor-pointer hover:border-blue-500 transition-colors bg-slate-50/50 dark:bg-slate-800/20"
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileSelect}
                className="hidden"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
              />
              <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-600 mx-auto flex items-center justify-center mb-2">
                <Upload className="w-5 h-5" />
              </div>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                Arraste arquivos para cá ou clique para selecionar
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">PDF, DOC, XLS, PNG até 10MB</p>
            </div>

            {files.length > 0 && (
              <div className="mt-2 space-y-1.5">
                {files.map((file, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs"
                  >
                    <span className="truncate max-w-[80%] font-medium">{file.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-400">
                        {(file.size / (1024 * 1024)).toFixed(1)} MB
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          setFiles((prev) => prev.filter((_, i) => i !== idx))
                        }}
                        className="text-red-500 hover:text-red-700 p-0.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
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
              className="h-10 text-xs px-6 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm"
            >
              {isSubmitting ? 'Publicando...' : 'Publicar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
