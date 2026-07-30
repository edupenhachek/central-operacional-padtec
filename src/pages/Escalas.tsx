import { useState, useEffect, useCallback } from 'react'
import { format, parseISO } from 'date-fns'
import { Plus, CalendarDays } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { useRealtime } from '@/hooks/use-realtime'
import { getEscalas } from '@/services/escalas'
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
import { Skeleton } from '@/components/ui/skeleton'

interface EscalaRecord {
  id: string
  Data: string
  Projeto: string
  Turno: string
  expand?: {
    Usuario_ID?: { id: string; name: string; email: string }
  }
}

export default function Escalas() {
  const { user } = useAuth()
  const [records, setRecords] = useState<EscalaRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)

  const canCreate =
    user?.role === 'SUPERADMIN' ||
    user?.role === 'ADMIN' ||
    (user?.role?.startsWith('FOCAL') ?? false)

  const loadEscalas = useCallback(async () => {
    setLoading(true)
    try {
      const result = await getEscalas(page, 10)
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

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Escalas</h1>
          <p className="text-sm text-muted-foreground mt-1">Gestão de plantões operacionais.</p>
        </div>
        {canCreate && (
          <Button
            onClick={() => setModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm gap-2"
          >
            <Plus className="w-4 h-4" />
            Novo Plantão
          </Button>
        )}
      </div>

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
          ) : records.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Nenhum plantão registrado.
            </p>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Colaborador</TableHead>
                    <TableHead>Projeto</TableHead>
                    <TableHead>Turno</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {records.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="text-sm">
                        {item.Data ? format(parseISO(item.Data), 'dd/MM/yyyy') : '-'}
                      </TableCell>
                      <TableCell className="text-sm">
                        {item.expand?.Usuario_ID?.name || item.expand?.Usuario_ID?.email || '-'}
                      </TableCell>
                      <TableCell className="text-sm">{item.Projeto || '-'}</TableCell>
                      <TableCell className="text-sm">{item.Turno || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {totalPages > 1 && (
                <div className="flex items-center justify-end gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage(page - 1)}
                  >
                    Anterior
                  </Button>
                  <span className="text-xs text-muted-foreground">
                    Página {page} de {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages}
                    onClick={() => setPage(page + 1)}
                  >
                    Próxima
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <EscalaFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={() => loadEscalas()}
      />
    </div>
  )
}
