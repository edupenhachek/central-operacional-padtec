import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export const SHIFT_SHORT_LABELS: Record<string, string> = {
  '06H15 ÁS 15H15': 'T1',
  '08H00 ÁS 17H00': 'T2',
  '09H00 ÁS 18H00': 'T3',
  '10H00 ÁS 19H00': 'T4',
  '11H00 ÁS 20H00': 'T5',
  '11H30 ÁS 20H30': 'T6',
  '13H00 ÁS 22H00': 'T7',
  '15H00 ÁS 23H43': 'T8',
  '23H30 ÁS 06H30': 'T9',
}

export const PROJECT_FILTER_OPTIONS = [
  { value: 'all', label: 'Todos' },
  { value: 'NOC / Radisys', label: 'NOC / Radisys' },
  { value: 'COPE / OHR', label: 'COPE / OHR' },
  { value: 'BKO', label: 'BKO' },
] as const

export const PROJECT_FILTER_MAP: Record<string, string[]> = {
  'NOC / Radisys': ['NOC', 'Radisys'],
  'COPE / OHR': ['COPE', 'OHR'],
  BKO: ['BKO'],
}

export const FOCAL_ROLES = ['SUPERADMIN', 'ADMIN', 'FOCAL NOC', 'FOCAL COPE', 'FOCAL BKO']

export const COORDINATOR_NAMES = ['eduardo guidini', 'caio nunes']

export function isCoordinator(name: string): boolean {
  const lower = name.toLowerCase()
  return COORDINATOR_NAMES.some((n) => lower.includes(n))
}

export const MONTH_OPTIONS = Array.from({ length: 12 }, (_, i) => ({
  value: String(i),
  label: format(new Date(2024, i, 1), 'MMMM', { locale: ptBR }),
}))

const CURRENT_YEAR = new Date().getFullYear()
export const YEAR_OPTIONS = Array.from({ length: 7 }, (_, i) => String(CURRENT_YEAR - 1 + i))

export function getShiftLabel(turno: string): string {
  if (!turno) return ''
  if (turno === 'FOLGA') return 'FOLGA'
  return SHIFT_SHORT_LABELS[turno] || turno
}

export function getDaysInMonth(month: number, year: number): Date[] {
  const lastDay = new Date(year, month + 1, 0).getDate()
  return Array.from({ length: lastDay }, (_, i) => new Date(year, month, i + 1))
}

export function formatDateStr(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function getDayHeader(date: Date): { day: string; weekday: string } {
  return {
    day: String(date.getDate()).padStart(2, '0'),
    weekday: format(date, 'EEE', { locale: ptBR }),
  }
}

export function isWeekend(date: Date): boolean {
  const dow = date.getDay()
  return dow === 0 || dow === 6
}

export function filterUsersByProject<T extends { projeto?: string[] }>(
  users: T[],
  filter: string,
): T[] {
  if (filter === 'all') return users
  const projects = PROJECT_FILTER_MAP[filter]
  if (!projects) return users
  return users.filter((u) => (u.projeto || []).some((p) => projects.includes(p)))
}

export const QUICK_FILTER_PILLS = [
  { value: 'all', label: 'TODOS' },
  { value: 'BKO', label: 'BKO' },
  { value: 'COPE', label: 'COPE' },
  { value: 'NOC', label: 'NOC' },
] as const

export const ESCALA_STATUS_OPTIONS = [
  'Horário Normal do Perfil',
  'FOLGA',
  'BANCO DE HORAS',
  'FÉRIAS',
  'ATESTADO',
  'TREINAMENTO',
  'FOLGA COMPENSATÓRIA',
] as const

export const STATUS_CELL_LABELS: Record<string, string> = {
  FOLGA: 'FOLGA',
  FÉRIAS: 'FÉR',
  ATESTADO: 'ATE',
  TREINAMENTO: 'TRE',
  'BANCO DE HORAS': 'BH',
  'FOLGA COMPENSATÓRIA': 'FC',
}

export const STATUS_CELL_COLORS: Record<string, string> = {
  FOLGA: 'text-slate-900 dark:text-slate-100 font-bold',
  FÉRIAS: 'text-amber-950 dark:text-amber-100 font-bold',
  ATESTADO: 'text-amber-950 dark:text-amber-100 font-bold',
  TREINAMENTO: 'text-blue-950 dark:text-blue-100 font-bold',
  'BANCO DE HORAS': 'text-yellow-950 dark:text-yellow-100 font-bold',
  'FOLGA COMPENSATÓRIA': 'text-slate-950 dark:text-slate-100 font-bold',
}

export const STATUS_CELL_BG: Record<string, string> = {
  FOLGA: 'bg-slate-300/90 dark:bg-slate-700/90',
  FÉRIAS: 'bg-amber-200 dark:bg-amber-900/70',
  ATESTADO: 'bg-amber-200 dark:bg-amber-900/70',
  TREINAMENTO: 'bg-blue-200 dark:bg-blue-900/70',
  'BANCO DE HORAS': 'bg-yellow-200 dark:bg-yellow-900/70',
  'FOLGA COMPENSATÓRIA': 'bg-slate-200 dark:bg-slate-700/80',
}

export const SHIFT_CELL_BG = 'bg-emerald-500/25 dark:bg-emerald-500/30'
export const SHIFT_CELL_COLOR = 'text-emerald-950 dark:text-emerald-100 font-bold'
export const WEEKEND_HEADER_CLS =
  'bg-rose-100 dark:bg-rose-950 text-rose-950 dark:text-rose-200 font-bold'
export const WEEKEND_CELL_BG = 'bg-rose-500/15 dark:bg-rose-950/40'

export const SCHEDULE_ORDER: Record<string, number> = {
  '06H15 ÁS 15H15': 1,
  '08H00 ÁS 17H00': 2,
  '09H00 ÁS 18H00': 3,
  '10H00 ÁS 19H00': 4,
  '11H00 ÁS 20H00': 5,
  '11H30 ÁS 20H30': 6,
  '13H00 ÁS 22H00': 7,
  '15H00 ÁS 23H43': 8,
  '23H30 ÁS 06H30': 9,
}

export function sortUsersBySchedule<T extends { horario_trabalho?: string; name?: string }>(
  users: T[],
): T[] {
  return [...users].sort((a, b) => {
    const orderA = SCHEDULE_ORDER[a.horario_trabalho || ''] ?? 99
    const orderB = SCHEDULE_ORDER[b.horario_trabalho || ''] ?? 99
    if (orderA !== orderB) return orderA - orderB
    return (a.name || '').localeCompare(b.name || '')
  })
}

export function filterUsersByPill<T extends { projeto?: string[] }>(users: T[], pill: string): T[] {
  if (pill === 'all') return users
  return users.filter((u) => (u.projeto || []).includes(pill))
}

export const DAY_KEYS = ['seg', 'ter', 'qua', 'qui', 'sex', 'sab', 'dom'] as const
export type DayKey = (typeof DAY_KEYS)[number]
export type DayValue = 'T' | 'F'

export interface WeekConfig {
  seg: DayValue
  ter: DayValue
  qua: DayValue
  qui: DayValue
  sex: DayValue
  sab: DayValue
  dom: DayValue
}

export type PatternConfig = Record<string, WeekConfig>

export interface PadraoEscalaRecord {
  id: string
  nome: string
  qtd_semanas: number
  configuracao: PatternConfig
  created: string
  updated: string
}

export const FALLBACK_PATTERN_OPTION = { value: 'fixo-5x2', label: '5x2 Padrão' }

export function getDynamicCycleOptions(qtdSemanas: number): string[] {
  return Array.from({ length: qtdSemanas }, (_, i) => `Semana ${i + 1}`)
}

export function getDayKey(dayOfWeek: number): DayKey {
  return DAY_KEYS[(dayOfWeek + 6) % 7]
}

export function getPatternDayValue(
  config: PatternConfig,
  weekNum: number,
  dayOfWeek: number,
): DayValue {
  const weekKey = `semana_${weekNum}`
  const week = config[weekKey]
  if (!week) return 'T'
  return week[getDayKey(dayOfWeek)] || 'T'
}

export function advanceWeek(currentWeek: number, qtdSemanas: number): number {
  return currentWeek >= qtdSemanas ? 1 : currentWeek + 1
}

export interface PendingChange {
  userId: string
  dateStr: string
  turno: string
  status: string
  observacao: string
  projeto: string
}

export const BULK_STATUS_OPTIONS = [
  { value: 'T', label: 'Trabalho' },
  { value: 'F', label: 'Folga' },
  { value: 'Férias', label: 'Férias' },
  { value: 'B', label: 'Banco de Horas' },
  { value: 'Atestado', label: 'Atestado' },
  { value: 'Treinamento', label: 'Treinamento' },
  { value: 'FC', label: 'Folga Compensatória' },
] as const

export function getCellDisplayValue(status: string, turno: string, userHorario: string): string {
  if (!status && !turno) return ''
  if (status === 'T' || status === 'Previsto' || status === 'Confirmado') {
    const shift = turno && turno !== 'FOLGA' ? turno : userHorario
    return shift ? SHIFT_SHORT_LABELS[shift] || 'T' : 'T'
  }
  if (status === 'F' || status === 'FOLGA') return 'F'
  if (status === 'FÉRIAS' || status === 'Férias') return 'Férias'
  if (status === 'B' || status === 'BANCO DE HORAS') return 'B'
  if (status === 'ATESTADO' || status === 'Atestado') return 'At'
  if (status === 'TREINAMENTO' || status === 'Treinamento') return 'Tr'
  if (status === 'FOLGA COMPENSATÓRIA' || status === 'FC') return 'FC'
  if (turno === 'FOLGA') return 'F'
  if (turno) return SHIFT_SHORT_LABELS[turno] || 'T'
  return status || ''
}

export function getCellBgByValue(displayValue: string, weekend: boolean): string {
  if (!displayValue) return weekend ? WEEKEND_CELL_BG : ''
  if (displayValue === 'Férias') return 'bg-purple-200 dark:bg-purple-900/70'
  if (displayValue.startsWith('T')) return SHIFT_CELL_BG
  if (displayValue.startsWith('F')) return 'bg-red-500/25 dark:bg-red-500/30'
  if (displayValue.startsWith('B')) return 'bg-yellow-200 dark:bg-yellow-900/70'
  if (displayValue.startsWith('At')) return 'bg-amber-200 dark:bg-amber-900/70'
  if (displayValue.startsWith('Tr')) return 'bg-blue-200 dark:bg-blue-900/70'
  if (displayValue.startsWith('FC')) return 'bg-slate-200 dark:bg-slate-700/80'
  return ''
}

export function getCellColorByValue(displayValue: string): string {
  if (!displayValue) return 'text-muted-foreground/40'
  if (displayValue === 'Férias') return 'text-purple-950 dark:text-purple-100 font-bold'
  if (displayValue.startsWith('T')) return SHIFT_CELL_COLOR
  if (displayValue.startsWith('F')) return 'text-red-950 dark:text-red-100 font-bold'
  if (displayValue.startsWith('B')) return 'text-yellow-950 dark:text-yellow-100 font-bold'
  if (displayValue.startsWith('At')) return 'text-amber-950 dark:text-amber-100 font-bold'
  if (displayValue.startsWith('Tr')) return 'text-blue-950 dark:text-blue-100 font-bold'
  if (displayValue.startsWith('FC')) return 'text-slate-950 dark:text-slate-100 font-bold'
  return 'text-foreground font-bold'
}

export const TURNO_SELECT_OPTIONS = Object.keys(SHIFT_SHORT_LABELS).map((k) => ({
  value: k,
  label: `${SHIFT_SHORT_LABELS[k]} — ${k}`,
}))

export type PeriodMode = 'mes' | 'ponto-senior'

export interface DateRange {
  start: Date
  end: Date
}

export function getRangeForPeriod(mode: PeriodMode, month: number, year: number): DateRange {
  if (mode === 'mes') {
    return { start: new Date(year, month, 1), end: new Date(year, month + 1, 0) }
  }
  return { start: new Date(year, month, 16), end: new Date(year, month + 1, 15) }
}

export function getDaysInRange(start: Date, end: Date): Date[] {
  const days: Date[] = []
  const current = new Date(start)
  while (current <= end) {
    days.push(new Date(current))
    current.setDate(current.getDate() + 1)
  }
  return days
}

export function feriadosToMap(feriados: { data: string; nome: string }[]): Record<string, string> {
  const map: Record<string, string> = {}
  for (const f of feriados) {
    const raw = f.data || ''
    const dateKey = raw.split('T')[0].split(' ')[0]
    if (dateKey) map[dateKey] = f.nome
  }
  return map
}

export function getPeriodLabel(mode: PeriodMode, month: number, year: number): string {
  if (mode === 'mes') {
    return format(new Date(year, month, 1), "MMMM 'de' yyyy", { locale: ptBR })
  }
  const start = new Date(year, month, 16)
  const end = new Date(year, month + 1, 15)
  return `Ponto Senior: ${format(start, 'dd/MM')} - ${format(end, 'dd/MM/yyyy')}`
}
