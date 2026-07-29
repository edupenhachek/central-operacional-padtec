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
import { Plus, Loader2 } from 'lucide-react'
import { MultiSelect } from '@/components/MultiSelect'
import { PROJETO_ALVO_OPTIONS, CATEGORIES } from '@/lib/document-utils'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

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
  const [category, setCategory] = useState('Procedimentos')
  const [customCategory, setCustomCategory] = useState('')
  const [isCustomCategory, setIsCustomCategory] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [projetoAlvo, setProjetoAlvo] = useState<string[]>(['TODOS'])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

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

    const finalCategory = isCustomCategory ? customCategory : category
    if (!finalCategory.trim()) {
      setError('Categoria é obrigatória')
      return
    }

    setError('')
    setLoading(true)
    try {
      await onSubmit({ title, category: finalCategory, file, projetoAlvo })
      setTitle('')
      setCategory('Procedimentos')
      setCustomCategory('')
      setIsCustomCategory(false)
      setFile(null)
      setProjetoAlvo(['TODOS'])
      onOpenChange(false)
    } catch (err: any) {
      setError(err?.message || 'Erro ao salvar documento')
    } finally {
      setLoading(false)
    }
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
          <DialogTitle className="font-bold text-foreground dark:text-slate-100">
            Adicionar Documento
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-foreground dark:text-slate-200">
              Título do Documento *
            </Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: POP GPON - Associação de ONU"
              className="bg-background dark:bg-slate-900 border-input text-xs"
              required
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold text-foreground dark:text-slate-200">
                Categoria / Pasta *
              </Label>
              <button
                type="button"
                onClick={() => setIsCustomCategory(!isCustomCategory)}
                className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline"
              >
                {isCustomCategory ? 'Escolher da lista' : '+ Outra categoria'}
              </button>
            </div>
            {isCustomCategory ? (
              <Input
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                placeholder="Digite o nome da categoria"
                className="bg-background dark:bg-slate-900 border-input text-xs"
              />
            ) : (
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="bg-background dark:bg-slate-900 border-input text-xs h-9">
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent className="bg-card dark:bg-slate-900 border-border">
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value} className="text-xs">
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-foreground dark:text-slate-200">
              Projeto Alvo *
            </Label>
            <MultiSelect
              options={PROJETO_ALVO_OPTIONS}
              selected={projetoAlvo}
              onChange={handleProjetoAlvoChange}
              placeholder="Selecionar projetos"
            />
            <p className="text-[11px] text-muted-foreground dark:text-slate-400">
              Define a visibilidade deste documento na Central Operacional.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-foreground dark:text-slate-200">
              Arquivo (PDF, Word, PPT, Excel)
            </Label>
            <Input
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="text-xs cursor-pointer bg-background dark:bg-slate-900 border-input"
            />
          </div>

          {error && <p className="text-xs text-red-500 font-medium">{error}</p>}

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium h-9 text-xs"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Salvando...
              </>
            ) : (
              'Salvar Documento'
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
