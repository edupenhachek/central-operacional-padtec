import { useState, useEffect, useCallback } from 'react'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { CalendarDays } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { useRealtime } from '@/hooks/use-realtime'
import {
  getEscalasByUser,
  PROJETO_COLORS,
  STATUS_COLORS,
  type EscalaRecord,
} from '@/services/escalas'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

const MONTH_OPTIONS = Array.from({ length: 12 }, (_, i) => ({
  value: String(i),
  label: format(new Date(2024, i, 1), 'MMMM', { locale: ptBR }),
}))
const CURRENT_YEAR = new Date().getFullYear()
const YEAR_OPTIONS = Array.from({ length: 5 }, (_, i) => String(CURRENT_YEAR - 2 + i))

export function MyScheduleTab() {
  const { user } = useAuth()
  const [records, setRecords] = useState<EscalaRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [monthFilter, setMonthFilter] = useState(String(new Date().getMonth()))
  const [yearFilter, setYearFilter] = useState(String(new Date().getFullYear()))

  const loadMyEscalas = useCallback(async () => {
    if (!user?.id) return
    setLoading(true)
    try {
      const result = await getEscalasByUser(user.id, Number(monthFilter), Number(yearFilter))
      setRecords(result as unknown as EscalaRecord[])
    } catch {
      setRecords([])
    } finally {
      setLoading(false)
    }
  }, [user?.id, monthFilter, yearFilter])

  useEffect(() => {
    loadMyEscalas()
  }, [loadMyEscalas])

  useRealtime('escalas', () => {
    loadMyEscalas()
  })

  return (
    <div className="space-y-4">
      <Card className="border-border bg-card dark:bg-slate-900">
        <CardContent className="p-4">
          <div className="flex gap-2">
            <Select value={monthFilter} onValueChange={setMonthFilter}>
              <SelectTrigger className="h-9 w-36 text-xs bg-background dark:bg-slate-900/80 border-input">
                <SelectValue placeholder="Mês" />
              </SelectTrigger>
              <SelectContent>
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
                {YEAR_OPTIONS.map((y) => (
                  <SelectItem key={y} value={y}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-blue-600" /> Meus Plantões
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
              Nenhum plantão encontrado para este período.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Projeto</TableHead>
                    <TableHead>Turno</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {records.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="text-sm whitespace-nowrap">
                        {item.Data ? format(parseISO(item.Data.split(' ')[0]), 'dd/MM/yyyy') : '-'}
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
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
