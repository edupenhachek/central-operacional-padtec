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
export const YEAR_OPTIONS = Array.from({ length: 5 }, (_, i) => String(CURRENT_YEAR - 2 + i))

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
  FOLGA: 'text-gray-800 dark:text-gray-200',
  FÉRIAS: 'text-orange-900 dark:text-orange-200',
  ATESTADO: 'text-orange-900 dark:text-orange-200',
  TREINAMENTO: 'text-slate-800 dark:text-slate-100',
  'BANCO DE HORAS': 'text-yellow-900 dark:text-yellow-100',
  'FOLGA COMPENSATÓRIA': 'text-slate-800 dark:text-slate-100',
}

export const STATUS_CELL_BG: Record<string, string> = {
  FOLGA: 'bg-gray-200 dark:bg-gray-800/70',
  FÉRIAS: 'bg-orange-200 dark:bg-orange-900/50',
  ATESTADO: 'bg-orange-200 dark:bg-orange-900/50',
  TREINAMENTO: 'bg-slate-200 dark:bg-slate-800/70',
  'BANCO DE HORAS': 'bg-yellow-200 dark:bg-yellow-900/50',
  'FOLGA COMPENSATÓRIA': 'bg-slate-200 dark:bg-slate-800/70',
}

export const SHIFT_CELL_BG = 'bg-green-200 dark:bg-green-900/50'
export const SHIFT_CELL_COLOR = 'text-green-900 dark:text-green-100'
export const WEEKEND_HEADER_CLS = 'bg-red-200 dark:bg-red-900/50 text-red-800 dark:text-red-100'
export const WEEKEND_CELL_BG = 'bg-red-100 dark:bg-red-900/30'

export function filterUsersByPill<T extends { projeto?: string[] }>(users: T[], pill: string): T[] {
  if (pill === 'all') return users
  return users.filter((u) => (u.projeto || []).includes(pill))
}
