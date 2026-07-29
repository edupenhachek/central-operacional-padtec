import type { UserRole } from '@/services/users'

export const ROLE_OPTIONS: UserRole[] = [
  'ADMIN',
  'USUARIO',
  'FOCAL BKO',
  'FOCAL NOC',
  'FOCAL COPE',
  'SUPERADMIN',
]

export const PROJETO_OPTIONS = ['NOC', 'BKO', 'COPE', 'OHR', 'Radisys']

export interface HorarioGroup {
  label: string
  projetos: string[]
  options: string[]
}

export const HORARIO_GROUPS: HorarioGroup[] = [
  {
    label: 'NOC / Radisys',
    projetos: ['NOC', 'Radisys'],
    options: [
      '06H15 ÁS 15H15',
      '08H00 ÁS 17H00',
      '09H00 ÁS 18H00',
      '13H00 ÁS 22H00',
      '15H00 ÁS 23H43',
      '23H30 ÁS 06H30',
    ],
  },
  {
    label: 'COPE e OHR',
    projetos: ['COPE', 'OHR'],
    options: ['06H15 ÁS 15H15', '08H00 ÁS 17H00', '15H00 ÁS 23H43', '23H30 ÁS 06H30'],
  },
  {
    label: 'BKO',
    projetos: ['BKO'],
    options: [
      '08H00 ÁS 17H00',
      '09H00 ÁS 18H00',
      '10H00 ÁS 19H00',
      '11H00 ÁS 20H00',
      '11H30 ÁS 20H30',
    ],
  },
]

export function getHorarioGroupsForProjetos(projetos: string[]): HorarioGroup[] {
  if (!projetos || projetos.length === 0) return HORARIO_GROUPS
  return HORARIO_GROUPS.filter((g) => g.projetos.some((p) => projetos.includes(p)))
}

export function getRoleOptionsForUser(role?: UserRole | null): UserRole[] {
  if (role === 'SUPERADMIN') return ROLE_OPTIONS
  return ROLE_OPTIONS.filter((r) => r !== 'SUPERADMIN')
}
