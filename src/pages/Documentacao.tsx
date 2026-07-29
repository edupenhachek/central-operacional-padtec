import { useEffect, useState } from 'react'
import {
  FileText,
  Search,
  Trash2,
  Star,
  Eye,
  Calendar,
  Layers,
  LayoutGrid,
  List,
  Grid2X2,
  SlidersHorizontal,
  Building2,
  ShieldCheck,
  FolderOpen,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
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
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/components/ui/use-toast'
import { useRealtime } from '@/hooks/use-realtime'
import { cn } from '@/lib/utils'
import { CATEGORIES, getFileTypeInfo, PROJETO_ALVO_OPTIONS, ViewMode } from '@/lib/document-utils'
import { AddDocumentModal, AddDocumentData } from '@/components/documentos/AddDocumentModal'
import { DocumentPreviewModal } from '@/components/documentos/DocumentPreviewModal'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

// Rich Demo Documents for complete coverage
const DEMO_DOCUMENTS: DocumentItem[] = [
  {
    id: 'demo-1',
    title: 'POP GPON - Associação de ONU',
    category: 'Procedimentos',
    file_type: 'PDF',
    projeto_alvo: ['NOC', 'BKO'],
    created: '2026-07-28T10:00:00.000Z',
    updated: '2026-07-28T10:00:00.000Z',
  },
  {
    id: 'demo-2',
    title: 'Manual de Atendimento ao Técnico de Campo',
    category: 'Procedimentos',
    file_type: 'WORD',
    projeto_alvo: ['TODOS'],
    created: '2026-07-27T10:00:00.000Z',
    updated: '2026-07-27T10:00:00.000Z',
  },
  {
    id: 'demo-3',
    title: 'Fluxo de Ativação de Serviços DWDM',
    category: 'Procedimentos',
    file_type: 'APRESENTAÇÃO',
    projeto_alvo: ['COPE'],
    created: '2026-07-26T10:00:00.000Z',
    updated: '2026-07-26T10:00:00.000Z',
  },
  {
    id: 'demo-4',
    title: 'Política Corporativa de Segurança Padtec',
    category: 'Corporativo',
    file_type: 'PDF',
    projeto_alvo: ['TODOS'],
    created: '2026-07-25T10:00:00.000Z',
    updated: '2026-07-25T10:00:00.000Z',
  },
  {
    id: 'demo-5',
    title: 'Registro e Diário de Bordo NOC Julho',
    category: 'Diário de Bordo',
    file_type: 'EXCEL',
    projeto_alvo: ['NOC'],
    created: '2026-07-24T10:00:00.000Z',
    updated: '2026-07-24T10:00:00.000Z',
  },
  {
    id: 'demo-6',
    title: 'Matriz de Acessos aos Sistemas NMS & Zabbix',
    category: 'Gestão de Acessos',
    file_type: 'EXCEL',
    projeto_alvo: ['NOC', 'COPE'],
    created: '2026-07-23T10:00:00.000Z',
    updated: '2026-07-23T10:00:00.000Z',
  },
  {
    id: 'demo-7',
    title: 'Guia de Treinamento em Redes Ópticas',
    category: 'Treinamentos',
    file_type: 'APRESENTAÇÃO',
    projeto_alvo: ['TODOS'],
    created: '2026-07-22T10:00:00.000Z',
    updated: '2026-07-22T10:00:00.000Z',
  },
  {
    id: 'demo-8',
    title: 'Ferramenta de Diagnóstico e Validação OTDR',
    category: 'Ferramentas',
    file_type: 'WORD',
    projeto_alvo: ['COPE', 'BKO'],
    created: '2026-07-21T10:00:00.000Z',
    updated: '2026-07-21T10:00:00.000Z',
  },
]

export default function Documentacao() {
  const { user } = useAuth()
  const { toast } = useToast()

  const [docs, setDocs] = useState<DocumentItem[]>([])
  const [favorites, setFavorites] = useState<Record<string, string>>({})
  const [search, setSearch] = useState('')
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)

  // Category Pill Filter
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL')

  // View Mode: 'grid' | 'list' | 'icons'
  const [viewMode, setViewMode] = useState<ViewMode>('grid')

  // Admin Operation Filter (NOC / COPE / BKO / ALL)
  const [adminOpFilter, setAdminOpFilter] = useState<string>('ALL')

  // Modals
  const [openAddModal, setOpenModal] = useState(false)
  const [previewDoc, setPreviewDoc] = useState<DocumentItem | null>(null)

  const isAdminOrSuper = user?.role === 'ADMIN' || user?.role === 'SUPERADMIN'

  // User projects normalization
  const userProjects = Array.isArray(user?.projeto)
    ? user.projeto
    : user?.projeto
      ? [user.projeto]
      : []

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

  // Realtime synchronization
  useRealtime('documents', () => {
    loadData()
  })

  const handleCreateDocument = async (data: AddDocumentData) => {
    try {
      await createDocument(data)
      toast({
        title: 'Documento criado',
        description: 'O documento foi adicionado com sucesso à biblioteca.',
      })
      loadData()
    } catch (err) {
      toast({
        title: 'Erro ao criar documento',
        description: 'Não foi possível salvar o documento.',
        variant: 'destructive',
      })
      throw err
    }
  }

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (id.startsWith('demo-')) {
      setDocs((prev) => prev.filter((d) => d.id !== id))
      toast({ title: 'Documento removido' })
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

  // RBAC & Multi-filter Logic
  const filteredDocs = docs.filter((d) => {
    const docTargets = Array.isArray(d.projeto_alvo)
      ? d.projeto_alvo
      : d.projeto_alvo
        ? [d.projeto_alvo]
        : []

    // 1. RBAC Isolation for Standard Users
    if (!isAdminOrSuper && docTargets.length > 0) {
      const isForTodos = docTargets.includes('TODOS')
      const matchesUserProject = docTargets.some((target) => userProjects.includes(target))
      if (!isForTodos && !matchesUserProject) {
        return false
      }
    }

    // 2. Admin Operation View Filter (NOC, COPE, BKO)
    if (isAdminOrSuper && adminOpFilter !== 'ALL' && docTargets.length > 0) {
      const isForTodos = docTargets.includes('TODOS')
      const matchesFilter = docTargets.includes(adminOpFilter)
      if (!isForTodos && !matchesFilter) {
        return false
      }
    }

    // 3. Category Pills Filter
    if (selectedCategory !== 'ALL') {
      if ((d.category || '').toLowerCase() !== selectedCategory.toLowerCase()) {
        return false
      }
    }

    // 4. Favorites Only
    if (showFavoritesOnly && !favorites[d.id]) {
      return false
    }

    // 5. Search Text Filter
    if (search.trim()) {
      const query = search.toLowerCase()
      const matchesTitle = d.title.toLowerCase().includes(query)
      const matchesCategory = (d.category || '').toLowerCase().includes(query)
      if (!matchesTitle && !matchesCategory) {
        return false
      }
    }

    return true
  })

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Top Header Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground dark:text-slate-100 flex items-center gap-2">
            <FolderOpen className="w-7 h-7 text-blue-600 dark:text-blue-400" />
            Documentação
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground dark:text-slate-400 mt-0.5">
            Biblioteca centralizada de procedimentos e arquivos operacionais
          </p>
        </div>

        {/* Controls Row */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {/* Admin Operation Filter Dropdown */}
          {isAdminOrSuper && (
            <div className="w-36 sm:w-40 shrink-0">
              <Select value={adminOpFilter} onValueChange={setAdminOpFilter}>
                <SelectTrigger className="h-9 text-xs bg-card dark:bg-slate-900 border-border">
                  <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-500" />
                  <SelectValue placeholder="Operação" />
                </SelectTrigger>
                <SelectContent className="bg-card dark:bg-slate-900 border-border">
                  <SelectItem value="ALL" className="text-xs">
                    Todas Operações
                  </SelectItem>

                  {PROJETO_ALVO_OPTIONS.filter((p) => p !== 'TODOS').map((op) => (
                    <SelectItem key={op} value={op} className="text-xs font-medium">
                      Operação {op}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Search Input */}
          <div className="relative flex-1 min-w-[160px] sm:min-w-[200px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar documentos..."
              className="pl-9 h-9 text-xs sm:text-sm bg-card dark:bg-slate-900 border-border"
            />
          </div>

          {/* View Mode Toggle Group */}
          <div className="flex items-center p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700/80">
            <button
              onClick={() => setViewMode('grid')}
              title="Visão Grade"
              className={cn(
                'p-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1',
                viewMode === 'grid'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200',
              )}
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="hidden md:inline text-[11px]">Grade</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              title="Visão Lista"
              className={cn(
                'p-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1',
                viewMode === 'list'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200',
              )}
            >
              <List className="w-4 h-4" />
              <span className="hidden md:inline text-[11px]">Lista</span>
            </button>
            <button
              onClick={() => setViewMode('icons')}
              title="Visão Ícones"
              className={cn(
                'p-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1',
                viewMode === 'icons'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200',
              )}
            >
              <Grid2X2 className="w-4 h-4" />
              <span className="hidden md:inline text-[11px]">Ícones</span>
            </button>
          </div>

          {/* Favorites Filter */}
          <Button
            variant={showFavoritesOnly ? 'default' : 'outline'}
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            className={cn(
              'h-9 text-xs font-medium gap-1.5 transition-colors shrink-0',
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
            <span className="hidden sm:inline">Favoritos</span>
          </Button>

          {/* New Document Modal Trigger */}
          <AddDocumentModal
            open={openAddModal}
            onOpenChange={setOpenModal}
            onSubmit={handleCreateDocument}
          />
        </div>
      </div>

      {/* Category Pills Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none pt-1">
        <Button
          variant={selectedCategory === 'ALL' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedCategory('ALL')}
          className={cn(
            'h-8 text-xs font-semibold rounded-full gap-1.5 shrink-0 transition-all',
            selectedCategory === 'ALL'
              ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
              : 'bg-card dark:bg-slate-900 border-border text-slate-700 dark:text-slate-300 hover:bg-accent',
          )}
        >
          <Layers className="w-3.5 h-3.5" />
          Todas as pastas
        </Button>

        {CATEGORIES.map((cat) => {
          const Icon = cat.icon
          const isSelected = selectedCategory.toLowerCase() === cat.value.toLowerCase()

          return (
            <Button
              key={cat.value}
              variant={isSelected ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(isSelected ? 'ALL' : cat.value)}
              className={cn(
                'h-8 text-xs font-medium rounded-full gap-1.5 shrink-0 transition-all',
                isSelected
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm font-semibold'
                  : 'bg-card dark:bg-slate-900 border-border text-slate-700 dark:text-slate-300 hover:bg-accent',
              )}
            >
              <Icon className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
              {cat.label}
            </Button>
          )
        })}
      </div>

      {/* Active Filter Indicators */}
      {(selectedCategory !== 'ALL' || adminOpFilter !== 'ALL' || showFavoritesOnly || search) && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
          <span className="font-semibold flex items-center gap-1 text-slate-500 dark:text-slate-400">
            <SlidersHorizontal className="w-3.5 h-3.5" /> Filtros ativos:
          </span>
          {selectedCategory !== 'ALL' && (
            <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 rounded-full font-medium">
              Categoria: {selectedCategory}
            </span>
          )}
          {adminOpFilter !== 'ALL' && (
            <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded-full font-medium">
              Operação: {adminOpFilter}
            </span>
          )}
          {showFavoritesOnly && (
            <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 rounded-full font-medium">
              Apenas Favoritos
            </span>
          )}
          {search && (
            <span className="px-2 py-0.5 bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-full">
              Busca: "{search}"
            </span>
          )}
          <button
            onClick={() => {
              setSelectedCategory('ALL')
              setAdminOpFilter('ALL')
              setShowFavoritesOnly(false)
              setSearch('')
            }}
            className="text-blue-600 dark:text-blue-400 hover:underline font-medium text-xs ml-1"
          >
            Limpar todos
          </button>
        </div>
      )}

      {/* Documents Display */}
      {filteredDocs.length === 0 ? (
        <div className="p-12 text-center border border-dashed border-border rounded-xl bg-card dark:bg-slate-900/50">
          <FileText className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-50" />
          <h3 className="text-sm font-semibold text-foreground dark:text-slate-200">
            Nenhum documento encontrado
          </h3>
          <p className="text-xs text-muted-foreground dark:text-slate-400 mt-1">
            {showFavoritesOnly
              ? 'Você ainda não marcou nenhum documento como favorito nesta categoria.'
              : 'Tente alterar os termos da busca ou selecionar outra categoria de documentos.'}
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRADE (Grid View - Cards) */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredDocs.map((doc) => {
            const fileTypeInfo = getFileTypeInfo(doc)
            const TypeIcon = fileTypeInfo.icon
            const isFav = !!favorites[doc.id]
            const targetProjects = doc.projeto_alvo || ['TODOS']

            return (
              <Card
                key={doc.id}
                className="group border border-slate-200/80 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between bg-card dark:bg-slate-900"
              >
                <div>
                  {/* Card Header Background */}
                  <div
                    className={cn(
                      'relative h-32 flex items-center justify-center transition-colors',
                      fileTypeInfo.bgColor,
                    )}
                  >
                    {/* Upper Right File Type & Favorite */}
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

                  {/* Card Body */}
                  <div className="p-4 space-y-3">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {/* Category Pill */}
                      <span className="inline-block px-2.5 py-0.5 bg-blue-50 dark:bg-blue-950/60 text-[11px] font-medium text-blue-600 dark:text-blue-400 rounded-full border border-blue-100 dark:border-blue-900/50">
                        {doc.category || 'Procedimentos'}
                      </span>

                      {/* Target Project Badges */}
                      {targetProjects.map((p) => (
                        <span
                          key={p}
                          className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-semibold rounded text-[10px] border border-emerald-100 dark:border-emerald-900/50"
                        >
                          {p}
                        </span>
                      ))}
                    </div>

                    {/* Title */}
                    <h3 className="text-xs sm:text-sm font-bold leading-snug text-foreground dark:text-slate-100 line-clamp-2 min-h-[2.5rem]">
                      {doc.title}
                    </h3>
                  </div>
                </div>

                {/* Card Footer */}
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
                    {isAdminOrSuper && (
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
                      onClick={() => setPreviewDoc(doc)}
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
      ) : viewMode === 'list' ? (
        /* LISTA (List Table View) */
        <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-card dark:bg-slate-900 shadow-sm">
          <Table>
            <TableHeader className="bg-slate-50 dark:bg-slate-800/60">
              <TableRow className="border-b border-slate-200 dark:border-slate-800">
                <TableHead className="w-10 text-center"></TableHead>
                <TableHead className="text-xs font-bold text-foreground dark:text-slate-200">
                  Documento
                </TableHead>
                <TableHead className="text-xs font-bold text-foreground dark:text-slate-200">
                  Categoria
                </TableHead>
                <TableHead className="text-xs font-bold text-foreground dark:text-slate-200">
                  Projeto Alvo
                </TableHead>
                <TableHead className="text-xs font-bold text-foreground dark:text-slate-200">
                  Data
                </TableHead>
                <TableHead className="text-right text-xs font-bold text-foreground dark:text-slate-200 pr-4">
                  Ações
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDocs.map((doc) => {
                const fileTypeInfo = getFileTypeInfo(doc)
                const TypeIcon = fileTypeInfo.icon
                const isFav = !!favorites[doc.id]
                const targetProjects = doc.projeto_alvo || ['TODOS']

                return (
                  <TableRow
                    key={doc.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border-b border-slate-100 dark:border-slate-800"
                  >
                    <TableCell className="text-center py-3">
                      <button
                        onClick={(e) => toggleFavorite(doc.id, e)}
                        title={isFav ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                      >
                        <Star
                          className={cn(
                            'w-4 h-4',
                            isFav
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-slate-300 hover:text-amber-400',
                          )}
                        />
                      </button>
                    </TableCell>

                    <TableCell className="py-3">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${fileTypeInfo.bgColor}`}>
                          <TypeIcon className={`w-5 h-5 ${fileTypeInfo.iconColor}`} />
                        </div>
                        <div>
                          <p className="text-xs sm:text-sm font-semibold text-foreground dark:text-slate-100">
                            {doc.title}
                          </p>
                          <span className="text-[10px] text-muted-foreground uppercase font-mono">
                            {fileTypeInfo.label}
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="py-3">
                      <span className="px-2.5 py-0.5 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-medium rounded-full text-xs border border-blue-100 dark:border-blue-900/50">
                        {doc.category || 'Procedimentos'}
                      </span>
                    </TableCell>

                    <TableCell className="py-3">
                      <div className="flex gap-1 flex-wrap">
                        {targetProjects.map((p) => (
                          <span
                            key={p}
                            className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-semibold rounded text-[10px]"
                          >
                            {p}
                          </span>
                        ))}
                      </div>
                    </TableCell>

                    <TableCell className="py-3 text-xs text-slate-500 dark:text-slate-400">
                      {doc.created
                        ? new Date(doc.created).toLocaleDateString('pt-BR')
                        : '18/07/2026'}
                    </TableCell>

                    <TableCell className="py-3 text-right pr-4">
                      <div className="flex items-center justify-end gap-1.5">
                        {isAdminOrSuper && (
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
                          onClick={() => setPreviewDoc(doc)}
                          className="bg-emerald-500 hover:bg-emerald-600 text-white font-medium text-xs h-8 px-3 rounded-lg shadow-sm gap-1.5"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Visualizar
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      ) : (
        /* ÍCONES (Compact Card View) */
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {filteredDocs.map((doc) => {
            const fileTypeInfo = getFileTypeInfo(doc)
            const TypeIcon = fileTypeInfo.icon
            const isFav = !!favorites[doc.id]

            return (
              <Card
                key={doc.id}
                onClick={() => setPreviewDoc(doc)}
                className="group border border-slate-200/80 dark:border-slate-800 rounded-xl p-3 flex flex-col justify-between hover:border-blue-500 hover:shadow-md transition-all cursor-pointer bg-card dark:bg-slate-900"
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-2">
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                      {fileTypeInfo.label}
                    </span>
                    <button
                      onClick={(e) => toggleFavorite(doc.id, e)}
                      className="p-0.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <Star
                        className={cn(
                          'w-3.5 h-3.5',
                          isFav
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-300 hover:text-amber-400',
                        )}
                      />
                    </button>
                  </div>

                  <div
                    className={`p-3 rounded-lg flex items-center justify-center mb-2 ${fileTypeInfo.bgColor}`}
                  >
                    <TypeIcon className={`w-8 h-8 ${fileTypeInfo.iconColor}`} />
                  </div>

                  <h4 className="text-xs font-bold leading-tight text-foreground dark:text-slate-100 line-clamp-2">
                    {doc.title}
                  </h4>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-[10px] text-blue-600 dark:text-blue-400 font-medium truncate max-w-[80px]">
                    {doc.category || 'Procedimentos'}
                  </span>

                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      setPreviewDoc(doc)
                    }}
                    className="h-6 px-2 text-[10px] bg-emerald-500 hover:bg-emerald-600 text-white rounded"
                  >
                    Ver
                  </Button>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* In-App Preview Modal */}
      <DocumentPreviewModal doc={previewDoc} onClose={() => setPreviewDoc(null)} />
    </div>
  )
}
