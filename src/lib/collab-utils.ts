import { formatDateStr, SHIFT_SHORT_LABELS } from '@/lib/escala-utils'

const COORDENADORES = ['eduardo guidini', 'caio nunes']
const FOCAL_BKO_NAMES = ['milla', 'kawe']
const FOCAL_NOC_NAMES = ['frank', 'edmar', 'roger']
const FOCAL_COPE_NAMES = ['joseylson', 'jefferson']

export function getCollaboratorBadgeLabel(name: string): string | null {
  const lower = name.toLowerCase()
  if (COORDENADORES.some((n) => lower.includes(n))) return 'COORDENADOR'
  if (FOCAL_BKO_NAMES.some((n) => lower.includes(n))) return 'FOCAL BKO'
  if (FOCAL_NOC_NAMES.some((n) => lower.includes(n))) return 'FOCAL NOC'
  if (FOCAL_COPE_NAMES.some((n) => lower.includes(n))) return 'FOCAL COPE'
  return null
}

export function getProjectBadgeLabel(projetos: string[]): string {
  if (!projetos || projetos.length === 0) return ''
  if (projetos.some((p) => p === 'NOC' || p === 'Radisys')) return 'NOC & Radisys'
  if (projetos.some((p) => p === 'COPE' || p === 'OHR')) return 'COPE & OHR'
  if (projetos.includes('BKO')) return 'BKO'
  return projetos.join(', ')
}

export const COLLAB_BADGE_COLORS: Record<string, string> = {
  COORDENADOR:
    'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-300 dark:border-indigo-800',
  'FOCAL BKO':
    'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-300 dark:border-purple-800',
  'FOCAL NOC':
    'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-300 dark:border-blue-800',
  'FOCAL COPE':
    'bg-green-100 text-green-700 dark:bg-green-950/60 dark:text-green-300 border-green-300 dark:border-green-800',
}

export const PROJECT_BADGE_COLORS: Record<string, string> = {
  'NOC & Radisys':
    'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-300 dark:border-blue-800',
  'COPE & OHR':
    'bg-green-100 text-green-700 dark:bg-green-950/60 dark:text-green-300 border-green-300 dark:border-green-800',
  BKO: 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-300 dark:border-purple-800',
}

export function getTeamsUrl(email: string): string {
  return `https://teams.microsoft.com/l/chat/0/0?users=${encodeURIComponent(email)}`
}

export function getShiftCountsPerDay<T extends { Data?: string; Turno?: string }>(
  escalas: T[],
  days: Date[],
): Map<string, Record<string, number>> {
  const map = new Map<string, Record<string, number>>()
  for (const day of days) {
    map.set(formatDateStr(day), {})
  }
  for (const escala of escalas) {
    const dateKey = escala.Data?.split(' ')[0]
    if (!dateKey || !map.has(dateKey)) continue
    const turno = escala.Turno || ''
    if (!turno || turno === 'FOLGA') continue
    const label = SHIFT_SHORT_LABELS[turno] || turno
    const dayCounts = map.get(dateKey)!
    dayCounts[label] = (dayCounts[label] || 0) + 1
  }
  return map
}
