import { useState, useEffect, useCallback, useMemo } from 'react'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Plus, CalendarDays, Search, Pencil, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { useRealtime } from '@/hooks/use-realtime'
import {
  getEscalas,
  deleteEscala,
  PROJETO_ESCALA_OPTIONS,
  PROJETO_COLORS,
  STATUS_COLORS,
  type EscalaRecord,
} from '@/services/escalas'
import { EscalaFormModal } from '@/components/EscalaFormModal'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

const FOCAL_ROLES = ['SUPERADMIN', 'ADMIN', 'FOCAL NOC', 'FOCAL COPE', 'FOCAL BKO']
const MONTH_OPTIONS = Array.from({ length: 12 }, (_, i) => ({
  value: String(i),
  label: format(new Date(2024, i, 1), 'MMMM', { locale: ptBR }),
}))
const CURRENT_YEAR = new Date().getFullYear()
const YEAR_OPTIONS = Array.from({ length: 5 }, (_, i) => String(CURRENT_YEAR - 2 + i))

export default function Escalas() {
  const { user } = useAuth()
  const [records, setRecords] = useState<EscalaRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [editEscala, setEditEscala] = useState<EscalaRecord | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<EscalaRecord | null>(null)
  const [deleting, setDeleting] = useState(false)

  const [monthFilter, setMonthFilter] = useState<string>('all')
  const [yearFilter, setYearFilter] = useState<string>('all')
  const [projetoFilter, setProjetoFilter] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')

  const canManage = user?.role ? FOCAL_ROLES.includes(user.role) : false

  const loadEscalas = useCallback(async () => {
    setLoading(true)
    try {
      const result = await getEscalas(page, 20)
      setRecords(result.items as unknown as EscalaRecord[])
      setTotalPages(result.totalPages)
    } catch {
      setRecords([])
    } finally {
      setLoading(false)
    }
  }, [page])

  useEffect(() => {
    loadEscalas()
  }, [loadEscalas])

  useRealtime('escalas', () => {
    loadEscalas()
  })

  const filteredRecords = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    return records.filter((item) => {
      if (monthFilter !== 'all') {
        const itemDate = item.Data ? parseISO(item.Data.split(' ')[0]) : null
        if (!itemDate || itemDate.getMonth() !== Number(monthFilter)) return false
      }
      if (yearFilter !== 'all') {
        const itemDate = item.Data ? parseISO(item.Data.split(' ')[0]) : null
        if (!itemDate || itemDate.getFullYear() !== Number(yearFilter)) return false
      }
      if (projetoFilter !== 'all' && item.Projeto !== projetoFilter) return false
      if (term) {
        const name = item.expand?.Usuario_ID?.name || item.expand?.Usuario_ID?.email || ''
        if (!name.toLowerCase().includes(term)) return false
      }
      return true
    })
  }, [records, monthFilter, yearFilter, projetoFilter, searchTerm])

  const handleOpenCreate = () => {
    setModalMode('create')
    setEditEscala(null)
    setModalOpen(true)
  }

  const handleOpenEdit = (escala: EscalaRecord) => {
    setModalMode('edit')
    setEditEscala(escala)
    setModalOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await deleteEscala(deleteTarget.id)
      setDeleteTarget(null)
      loadEscalas()
    } catch {
      /* intentionally ignored */
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Escalas de Trabalho</h1>
          <p className="text-sm text-muted-foreground mt-1">Gerencie os plantões da sua equipe.</p>
        </div>
        {canManage && (
          <Button
            onClick={handleOpenCreate}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm gap-2"
          >
            <Plus className="w-4 h-4" />
            Novo Plantão
          </Button>
        )}
      </div>

      <Card className="border-border bg-card dark:bg-slate-900">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row flex-wrap items-stretch gap-3">
            <div className="flex gap-2">
              <Select value={monthFilter} onValueChange={setMonthFilter}>
                <SelectTrigger className="h-9 w-36 text-xs bg-background dark:bg-slate-900/80 border-input">
                  <SelectValue placeholder="Mês" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os meses</SelectItem>
                  {MONTH_OPTIONS.map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={yearFilter} onValueChange={setYearFilter}>
                <SelectTrigger className="h-9 w-28 text-xs bg-background dark:bg-slate-900/80 border-input">
                  <SelectValue placeholder="Ano" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {YEAR_OPTIONS.map((y) => (
                    <SelectItem key={y} value={y}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Select value={projetoFilter} onValueChange={setProjetoFilter}>
              <SelectTrigger className="h-9 w-40 text-xs bg-background dark:bg-slate-900/80 border-input">
                <SelectValue placeholder="Projeto" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os projetos</SelectItem>
                {PROJETO_ESCALA_OPTIONS.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar colaborador..."
                className="w-full h-9 pl-9 pr-4 rounded-lg border border-input bg-background dark:bg-slate-900/80 text-foreground dark:text-slate-100 text-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-blue-600" /> Plantões Agendados
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : filteredRecords.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Nenhum plantão encontrado com os filtros selecionados.
            </p>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Colaborador</TableHead>
                      <TableHead>Projeto</TableHead>
                      <TableHead>Turno</TableHead>
                      <TableHead>Status</TableHead>
                      {canManage && <TableHead className="text-right">Ações</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRecords.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="text-sm whitespace-nowrap">
                          {item.Data
                            ? format(parseISO(item.Data.split(' ')[0]), 'dd/MM/yyyy')
                            : '-'}
                        </TableCell>
                        <TableCell className="text-sm">
                          {item.expand?.Usuario_ID?.name || item.expand?.Usuario_ID?.email || '-'}
                        </TableCell>
                        <TableCell className="text-sm">
                          {item.Projeto ? (
                            <span
                              className={cn(
                                'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border',
                                PROJETO_COLORS[item.Projeto] ||
                                  'bg-gray-100 text-gray-700 border-gray-300',
                              )}
                            >
                              {item.Projeto}
                            </span>
                          ) : (
                            '-'
                          )}
                        </TableCell>
                        <TableCell className="text-sm whitespace-nowrap">
                          {item.Turno || '-'}
                        </TableCell>
                        <TableCell className="text-sm">
                          {item.Status ? (
                            <span
                              className={cn(
                                'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border',
                                STATUS_COLORS[item.Status] ||
                                  'bg-gray-100 text-gray-700 border-gray-300',
                              )}
                            >
                              {item.Status}
                            </span>
                          ) : (
                            '-'
                          )}
                        </TableCell>
                        {canManage && (
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleOpenEdit(item)}
                                className="h-8 w-8 text-muted-foreground hover:text-blue-600"
                                title="Editar"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setDeleteTarget(item)}
                                className="h-8 w-8 text-muted-foreground hover:text-red-600"
                                title="Excluir"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {totalPages > 1 && (
                <div className="flex items-center justify-between gap-2 mt-4">
                  <span className="text-xs text-muted-foreground">
                    Página {page} de {totalPages}
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page <= 1}
                      onClick={() => setPage(page - 1)}
                      className="text-xs gap-1"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                      Anterior
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page >= totalPages}
                      onClick={() => setPage(page + 1)}
                      className="text-xs gap-1"
                    >
                      Próxima
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <EscalaFormModal
        open={modalOpen}
        mode={modalMode}
        escala={
          editEscala
            ? {
                id: editEscala.id,
                Data: editEscala.Data,
                Usuario_ID: editEscala.expand?.Usuario_ID?.id || '',
                Projeto: editEscala.Projeto,
                Turno: editEscala.Turno,
                Status: editEscala.Status,
              }
            : null
        }
        onClose={() => setModalOpen(false)}
        onSaved={() => loadEscalas()}
      />

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent className="bg-card dark:bg-slate-900 text-card-foreground dark:text-slate-100 border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground dark:text-slate-100">
              Excluir Plantão
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground dark:text-slate-300">
              Tem certeza que deseja excluir o plantão de{' '}
              <strong className="text-foreground dark:text-slate-100">
                {deleteTarget?.expand?.Usuario_ID?.name || 'colaborador'}
              </strong>{' '}
              em{' '}
              {deleteTarget?.Data
                ? format(parseISO(deleteTarget.Data.split(' ')[0]), 'dd/MM/yyyy')
                : '-'}
              ? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={deleting}
              className="dark:border-slate-700 dark:text-slate-200"
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deleting ? 'Excluindo...' : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
