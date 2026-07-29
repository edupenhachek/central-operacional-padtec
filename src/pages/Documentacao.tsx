import { useEffect, useState } from 'react'
import {
  FileText,
  Search,
  Plus,
  Trash2,
  Star,
  Eye,
  FileCode,
  Presentation,
  FileCheck,
  Calendar,
  ArrowLeft,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  getDocuments,
  createDocument,
  deleteDocument,
  getUserFavorites,
  addFavorite,
  removeFavorite,
  DocumentItem,
  DocumentFavorite,
} from '@/services/documents'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/components/ui/use-toast'
import pb from '@/lib/pocketbase/client'
import { cn } from '@/lib/utils'

// Fallback items to match design reference if database is empty
const DEMO_DOCUMENTS: DocumentItem[] = [
  {
    id: 'demo-1',
    title: 'POP GPON - Associação de ONU',
    category: 'Procedimentos',
    file_type: 'PDF',
    created: '2026-07-18T10:00:00.000Z',
    updated: '2026-07-18T10:00:00.000Z',
  },
  {
    id: 'demo-2',
    title: 'Manual de Atendimento ao Técnico de Campo',
    category: 'Procedimentos',
    file_type: 'WORD',
    created: '2026-07-18T10:00:00.000Z',
    updated: '2026-07-18T10:00:00.000Z',
  },
  {
    id: 'demo-3',
    title: 'Fluxo de Ativação de Serviços',
    category: 'Procedimentos',
    file_type: 'APRESENTAÇÃO',
    created: '2026-07-18T10:00:00.000Z',
    updated: '2026-07-18T10:00:00.000Z',
  },
  {
    id: 'demo-4',
    title: 'Procedimento de Manobra em CTO',
    category: 'Procedimentos',
    file_type: 'PDF',
    created: '2026-07-18T10:00:00.000Z',
    updated: '2026-07-18T10:00:00.000Z',
  },
]

export default function Documentacao() {
  const { user } = useAuth()
  const { toast } = useToast()

  const [docs, setDocs] = useState<DocumentItem[]>([])
  const [favorites, setFavorites] = useState<Record<string, string>>({}) // docId -> favoriteId
  const [search, setSearch] = useState('')
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  const [selectedFolder, setSelectedFolder] = useState<string | null>('Procedimentos')

  // New Document Modal State
  const [newTitle, setNewTitle] = useState('')
  const [newCategory, setNewCategory] = useState('')
  const [newFile, setNewFile] = useState<File | null>(null)
  const [openModal, setOpenModal] = useState(false)
  const [viewDoc, setViewDoc] = useState<DocumentItem | null>(null)

  const loadData = async () => {
    try {
      const data = await getDocuments()
      setDocs(data.length > 0 ? data : DEMO_DOCUMENTS)

      if (user?.id) {
        const favs = await getUserFavorites(user.id)
        const favMap: Record<string, string> = {}
        favs.forEach((f: DocumentFavorite) => {
          favMap[f.document] = f.id
        })
        setFavorites(favMap)
      }
    } catch (err) {
      console.error('Error loading documents:', err)
      setDocs(DEMO_DOCUMENTS)
    }
  }

  useEffect(() => {
    loadData()
  }, [user?.id])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim()) return

    try {
      if (newFile) {
        const formData = new FormData()
        formData.append('title', newTitle)
        formData.append('category', newCategory || 'Procedimentos')
        formData.append('file', newFile)
        await createDocument(formData)
      } else {
        await createDocument({ title: newTitle, category: newCategory || 'Procedimentos' })
      }

      toast({
        title: 'Documento criado',
        description: 'O documento foi adicionado com sucesso.',
      })

      setNewTitle('')
      setNewCategory('')
      setNewFile(null)
      setOpenModal(false)
      loadData()
    } catch (err) {
      toast({
        title: 'Erro ao criar documento',
        description: 'Não foi possível salvar o documento.',
        variant: 'destructive',
      })
    }
  }

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (id.startsWith('demo-')) {
      setDocs((prev) => prev.filter((d) => d.id !== id))
      return
    }
    try {
      await deleteDocument(id)
      toast({ title: 'Documento excluído' })
      loadData()
    } catch (err) {
      toast({
        title: 'Erro ao excluir',
        description: 'Você não tem permissão para excluir este documento.',
        variant: 'destructive',
      })
    }
  }

  const toggleFavorite = async (docId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!user?.id) {
      toast({ title: 'Atenção', description: 'Faça login para favoritar documentos.' })
      return
    }

    const favId = favorites[docId]
    if (favId) {
      // Optimistic update
      setFavorites((prev) => {
        const copy = { ...prev }
        delete copy[docId]
        return copy
      })
      try {
        if (!docId.startsWith('demo-')) {
          await removeFavorite(favId)
        }
      } catch (err) {
        console.error('Failed to remove favorite:', err)
      }
    } else {
      // Optimistic update
      setFavorites((prev) => ({ ...prev, [docId]: 'temp-fav-id' }))
      try {
        if (!docId.startsWith('demo-')) {
          const res = await addFavorite(user.id, docId)
          setFavorites((prev) => ({ ...prev, [docId]: res.id }))
        }
      } catch (err) {
        console.error('Failed to add favorite:', err)
      }
    }
  }

  const getFileTypeInfo = (doc: DocumentItem) => {
    const title = doc.title.toLowerCase()
    const fileName = doc.file?.toLowerCase() || ''
    const customType = doc.file_type?.toUpperCase()

    if (customType) {
      if (customType.includes('WORD') || customType.includes('DOC')) {
        return {
          label: 'WORD',
          bgColor: 'bg-blue-50/80 dark:bg-blue-950/30',
          iconColor: 'text-blue-500',
          icon: FileText,
        }
      }
      if (customType.includes('APRESENTAÇÃO') || customType.includes('PPT')) {
        return {
          label: 'APRESENTAÇÃO',
          bgColor: 'bg-amber-50/80 dark:bg-amber-950/30',
          iconColor: 'text-amber-500',
          icon: Presentation,
        }
      }
      return {
        label: 'PDF',
        bgColor: 'bg-red-50/80 dark:bg-red-950/30',
        iconColor: 'text-red-500',
        icon: FileCode,
      }
    }

    if (fileName.endsWith('.doc') || fileName.endsWith('.docx') || title.includes('manual')) {
      return {
        label: 'WORD',
        bgColor: 'bg-blue-50/80 dark:bg-blue-950/30',
        iconColor: 'text-blue-500',
        icon: FileText,
      }
    }

    if (
      fileName.endsWith('.ppt') ||
      fileName.endsWith('.pptx') ||
      title.includes('fluxo') ||
      title.includes('apresentação')
    ) {
      return {
        label: 'APRESENTAÇÃO',
        bgColor: 'bg-amber-50/80 dark:bg-amber-950/30',
        iconColor: 'text-amber-500',
        icon: Presentation,
      }
    }

    return {
      label: 'PDF',
      bgColor: 'bg-red-50/80 dark:bg-red-950/30',
      iconColor: 'text-red-500',
      icon: FileCode,
    }
  }

  const handleVisualize = (doc: DocumentItem) => {
    if (doc.file && !doc.id.startsWith('demo-')) {
      window.open(pb.files.getURL(doc, doc.file), '_blank')
    } else {
      setViewDoc(doc)
    }
  }

  const filteredDocs = docs.filter((d) => {
    const matchesSearch =
      d.title.toLowerCase().includes(search.toLowerCase()) ||
      (d.category && d.category.toLowerCase().includes(search.toLowerCase()))
    const matchesFav = showFavoritesOnly ? !!favorites[d.id] : true
    const matchesFolder = selectedFolder
      ? (d.category || 'Procedimentos').toLowerCase() === selectedFolder.toLowerCase()
      : true

    return matchesSearch && matchesFav && matchesFolder
  })

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground dark:text-slate-100">
            Documentação
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground dark:text-slate-400 mt-0.5">
            Biblioteca centralizada de documentos operacionais
          </p>
        </div>

        {/* Right Search & Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative flex-1 sm:flex-initial min-w-[200px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar documentos..."
              className="pl-9 h-9 text-xs sm:text-sm bg-card dark:bg-slate-900 border-border"
            />
          </div>

          <Button
            variant={showFavoritesOnly ? 'default' : 'outline'}
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            className={cn(
              'h-9 text-xs font-medium gap-1.5 transition-colors',
              showFavoritesOnly
                ? 'bg-amber-500 hover:bg-amber-600 text-white'
                : 'bg-card dark:bg-slate-900 border-border text-foreground hover:bg-accent',
            )}
          >
            <Star
              className={cn(
                'w-3.5 h-3.5',
                showFavoritesOnly ? 'fill-white' : 'text-amber-500 fill-amber-500',
              )}
            />
            Favoritos
          </Button>

          <Dialog open={openModal} onOpenChange={setOpenModal}>
            <DialogTrigger asChild>
              <Button className="h-9 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium gap-1.5 shadow-sm">
                <Plus className="w-4 h-4" /> Novo Documento
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-card dark:bg-slate-900 text-card-foreground dark:text-slate-100 border-border">
              <DialogHeader>
                <DialogTitle className="text-foreground dark:text-slate-100 font-bold">
                  Adicionar Documento
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4 mt-2">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-foreground dark:text-slate-200">
                    Título do Documento
                  </Label>
                  <Input
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Digite o título do documento"
                    className="text-foreground dark:text-slate-100 placeholder:text-muted-foreground bg-background dark:bg-slate-900 border-input"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-foreground dark:text-slate-200">
                    Categoria / Pasta
                  </Label>
                  <Input
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="Ex: Procedimentos"
                    className="text-foreground dark:text-slate-100 placeholder:text-muted-foreground bg-background dark:bg-slate-900 border-input"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-foreground dark:text-slate-200">
                    Arquivo (PDF, Word, PPT)
                  </Label>
                  <Input
                    type="file"
                    onChange={(e) => setNewFile(e.target.files?.[0] || null)}
                    className="text-xs text-foreground dark:text-slate-100 bg-background dark:bg-slate-900 border-input cursor-pointer"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium"
                >
                  Salvar Documento
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Folder Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground dark:text-slate-400 font-medium">
        <button
          onClick={() => setSelectedFolder(null)}
          className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Todas as pastas
        </button>
        <span>/</span>
        <span className="text-foreground dark:text-slate-200 font-semibold uppercase tracking-wider text-[11px]">
          {selectedFolder || 'Todas'}
        </span>
      </div>

      {/* Category Section Header */}
      {selectedFolder && (
        <div className="text-[11px] font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase -mb-2">
          {selectedFolder}
        </div>
      )}

      {/* Document Grid */}
      {filteredDocs.length === 0 ? (
        <div className="p-12 text-center border border-dashed border-border rounded-xl bg-card dark:bg-slate-900/50">
          <FileText className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-50" />
          <h3 className="text-sm font-semibold text-foreground dark:text-slate-200">
            Nenhum documento encontrado
          </h3>
          <p className="text-xs text-muted-foreground dark:text-slate-400 mt-1">
            {showFavoritesOnly
              ? 'Você ainda não marcou nenhum documento como favorito.'
              : 'Tente alterar os termos da busca ou selecionar outra pasta.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {filteredDocs.map((doc) => {
            const fileTypeInfo = getFileTypeInfo(doc)
            const TypeIcon = fileTypeInfo.icon
            const isFav = !!favorites[doc.id]

            return (
              <Card
                key={doc.id}
                className="group border border-slate-200/80 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between bg-card dark:bg-slate-900"
              >
                <div>
                  {/* Top Pastel Header Area */}
                  <div
                    className={cn(
                      'relative h-32 flex items-center justify-center transition-colors',
                      fileTypeInfo.bgColor,
                    )}
                  >
                    {/* Upper Right File Type Label + Favorite Star */}
                    <div className="absolute top-3 right-3 flex items-center gap-2">
                      <span className="text-[10px] font-extrabold tracking-wider text-slate-700 dark:text-slate-300 uppercase">
                        {fileTypeInfo.label}
                      </span>
                      <button
                        onClick={(e) => toggleFavorite(doc.id, e)}
                        title={isFav ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                        className="p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                      >
                        <Star
                          className={cn(
                            'w-4 h-4 transition-transform active:scale-125',
                            isFav
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-slate-400 dark:text-slate-500 hover:text-amber-400',
                          )}
                        />
                      </button>
                    </div>

                    {/* Central Large File Icon */}
                    <TypeIcon className={cn('w-12 h-12 stroke-[1.5]', fileTypeInfo.iconColor)} />
                  </div>

                  {/* Card Content Body */}
                  <div className="p-4 space-y-3">
                    {/* Category Pill */}
                    <span className="inline-block px-2.5 py-0.5 bg-blue-50 dark:bg-blue-950/60 text-[11px] font-medium text-blue-600 dark:text-blue-400 rounded-full border border-blue-100 dark:border-blue-900/50">
                      {doc.category || 'Procedimentos'}
                    </span>

                    {/* Title */}
                    <h3 className="text-xs sm:text-sm font-bold leading-snug text-foreground dark:text-slate-100 line-clamp-2 min-h-[2.5rem]">
                      {doc.title}
                    </h3>
                  </div>
                </div>

                {/* Footer Meta & Action */}
                <div className="p-4 pt-0 flex items-center justify-between gap-2 border-t border-slate-100 dark:border-slate-800/80 mt-2">
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>
                      {doc.created
                        ? new Date(doc.created).toLocaleDateString('pt-BR')
                        : '18/07/2026'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    {(user?.role === 'ADMIN' || user?.role === 'SUPERADMIN') && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => handleDelete(doc.id, e)}
                        className="h-8 w-8 text-slate-400 hover:text-red-500"
                        title="Excluir documento"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    )}

                    <Button
                      onClick={() => handleVisualize(doc)}
                      className="bg-emerald-500 hover:bg-emerald-600 text-white font-medium text-xs h-8 px-3 rounded-lg shadow-sm gap-1.5 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Visualizar
                    </Button>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Document Detail Preview Dialog */}
      {viewDoc && (
        <Dialog open={!!viewDoc} onOpenChange={() => setViewDoc(null)}>
          <DialogContent className="max-w-md bg-card dark:bg-slate-900 border-border text-card-foreground dark:text-slate-100">
            <DialogHeader>
              <DialogTitle className="text-base font-bold text-foreground dark:text-slate-100 flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-emerald-500" />
                {viewDoc.title}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 text-xs mt-2">
              <div className="p-3 bg-muted/60 dark:bg-slate-800/60 rounded-lg space-y-1">
                <p>
                  <strong className="text-foreground dark:text-slate-200">Categoria:</strong>{' '}
                  {viewDoc.category || 'Procedimentos'}
                </p>
                <p>
                  <strong className="text-foreground dark:text-slate-200">Data de criação:</strong>{' '}
                  {viewDoc.created
                    ? new Date(viewDoc.created).toLocaleDateString('pt-BR')
                    : '18/07/2026'}
                </p>
                <p>
                  <strong className="text-foreground dark:text-slate-200">Tipo:</strong>{' '}
                  {getFileTypeInfo(viewDoc).label}
                </p>
              </div>

              <p className="text-muted-foreground dark:text-slate-300 leading-relaxed">
                Este é um documento operacional padronizado da Central Operacional Padtec. Utilize
                as diretrizes contidas neste material para orientar o atendimento de campo e
                escalonamento.
              </p>

              <div className="pt-2 flex justify-end">
                <Button
                  onClick={() => setViewDoc(null)}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-8 px-4"
                >
                  Fechar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
