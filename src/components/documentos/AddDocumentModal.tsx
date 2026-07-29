import { useState, type FormEvent } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Plus } from 'lucide-react'
import { MultiSelect } from '@/components/MultiSelect'
import { PROJETO_ALVO_OPTIONS } from '@/lib/document-utils'

export interface AddDocumentData {
  title: string
  category: string
  file: File | null
  projetoAlvo: string[]
}

export function AddDocumentModal({
  open,
  onOpenChange,
  onSubmit,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: AddDocumentData) => Promise<void>
}) {
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [projetoAlvo, setProjetoAlvo] = useState<string[]>([])
  const [error, setError] = useState('')

  const handleProjetoAlvoChange = (values: string[]) => {
    if (values.includes('TODOS') && !projetoAlvo.includes('TODOS')) {
      setProjetoAlvo(['TODOS'])
    } else if (values.includes('TODOS') && values.length > 1) {
      setProjetoAlvo(values.filter((v) => v !== 'TODOS'))
    } else {
      setProjetoAlvo(values)
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      setError('Título é obrigatório')
      return
    }
    if (projetoAlvo.length === 0) {
      setError('Selecione ao menos um projeto alvo')
      return
    }
    setError('')
    await onSubmit({ title, category, file, projetoAlvo })
    setTitle('')
    setCategory('')
    setFile(null)
    setProjetoAlvo([])
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="h-9 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium gap-1.5 shadow-sm">
          <Plus className="w-4 h-4" /> Novo Documento
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-card dark:bg-slate-900 text-card-foreground dark:text-slate-100 border-border">
        <DialogHeader>
          <DialogTitle className="font-bold">Adicionar Documento</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Título do Documento</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Digite o título do documento"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Categoria / Pasta</Label>
            <Input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Ex: Procedimentos"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Projeto Alvo *</Label>
            <MultiSelect
              options={PROJETO_ALVO_OPTIONS}
              selected={projetoAlvo}
              onChange={handleProjetoAlvoChange}
              placeholder="Selecionar projetos"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Arquivo (PDF, Word, PPT)</Label>
            <Input
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="text-xs cursor-pointer"
            />
          </div>
          {error && <p className="text-xs text-red-500">{error}</p>}
          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium"
          >
            Salvar Documento
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
