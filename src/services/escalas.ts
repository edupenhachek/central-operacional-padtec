import pb from '@/lib/pocketbase/client'

export const TURNO_OPTIONS = [
  '06H15 ÁS 15H15',
  '08H00 ÁS 17H00',
  '09H00 ÁS 18H00',
  '10H00 ÁS 19H00',
  '11H00 ÁS 20H00',
  '11H30 ÁS 20H30',
  '13H00 ÁS 22H00',
  '15H00 ÁS 23H43',
  '23H30 ÁS 06H30',
]

export const PROJETO_ESCALA_OPTIONS = ['NOC', 'COPE', 'BKO', 'OHR', 'Radisys']

export const STATUS_OPTIONS = ['Previsto', 'Confirmado', 'Falta']

export const PROJETO_COLORS: Record<string, string> = {
  NOC: 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-300 dark:border-blue-800',
  COPE: 'bg-green-100 text-green-700 dark:bg-green-950/60 dark:text-green-300 border-green-300 dark:border-green-800',
  BKO: 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-300 dark:border-purple-800',
  OHR: 'bg-orange-100 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300 border-orange-300 dark:border-orange-800',
  Radisys:
    'bg-gray-200 text-gray-700 dark:bg-slate-800 dark:text-slate-300 border-gray-400 dark:border-slate-600',
}

export const STATUS_COLORS: Record<string, string> = {
  Previsto:
    'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300 dark:border-amber-800',
  Confirmado:
    'bg-green-100 text-green-700 dark:bg-green-950/60 dark:text-green-300 border-green-300 dark:border-green-800',
  Falta:
    'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300 border-red-300 dark:border-red-800',
}

export interface EscalaRecord {
  id: string
  Data: string
  Projeto: string
  Turno: string
  Status: string
  expand?: {
    Usuario_ID?: { id: string; name: string; email: string; avatar?: string }
  }
}

export const getEscalas = async (page = 1, perPage = 20) => {
  return pb.collection('escalas').getList(page, perPage, {
    sort: '-Data',
    expand: 'Usuario_ID',
  })
}

export const getAllEscalas = async () => {
  return pb.collection('escalas').getFullList({
    sort: '-Data',
    expand: 'Usuario_ID',
  })
}

export const createEscala = (data: {
  Data: string
  Usuario_ID: string
  Projeto: string
  Turno: string
  Status?: string
}) =>
  pb.collection('escalas').create({
    ...data,
    Status: data.Status || 'Previsto',
  })

export const updateEscala = (
  id: string,
  data: Partial<{
    Data: string
    Usuario_ID: string
    Projeto: string
    Turno: string
    Status: string
  }>,
) => pb.collection('escalas').update(id, data)

export const deleteEscala = (id: string) => pb.collection('escalas').delete(id)

export const PATTERN_OPTIONS = [
  'Personalizado',
  '5x2 – Folga Seg/Ter',
  '5x2 – Folga Sáb/Dom',
  '12x36',
] as const

export type EscalaBatchRecord = {
  Data: string
  Usuario_ID: string
  Projeto: string
  Turno: string
  Status: string
}

export function generateEscalaDates(startDate: string, endDate: string, pattern: string): string[] {
  const dates: string[] = []
  const start = new Date(startDate + 'T00:00:00')
  const end = new Date(endDate + 'T00:00:00')
  if (start > end) return dates
  const current = new Date(start)
  let isWorkDay = true
  while (current <= end) {
    const dow = current.getDay()
    let include = false
    switch (pattern) {
      case 'Personalizado':
        include = true
        break
      case '5x2 – Folga Seg/Ter':
        include = dow !== 1 && dow !== 2
        break
      case '5x2 – Folga Sáb/Dom':
        include = dow !== 0 && dow !== 6
        break
      case '12x36':
        include = isWorkDay
        isWorkDay = !isWorkDay
        break
    }
    if (include) {
      const y = current.getFullYear()
      const m = String(current.getMonth() + 1).padStart(2, '0')
      const d = String(current.getDate()).padStart(2, '0')
      dates.push(`${y}-${m}-${d}`)
    }
    current.setDate(current.getDate() + 1)
  }
  return dates
}

export const getEscalasByUser = async (userId: string, month: number, year: number) => {
  const startMonth = `${year}-${String(month + 1).padStart(2, '0')}-01`
  const lastDay = new Date(year, month + 1, 0).getDate()
  const endMonth = `${year}-${String(month + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`
  return pb.collection('escalas').getFullList({
    sort: 'Data',
    expand: 'Usuario_ID',
    filter: `Usuario_ID = "${userId}" && Data >= "${startMonth}" && Data <= "${endMonth}"`,
  })
}

export const getTodayEscalas = async () => {
  const today = new Date()
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  return pb.collection('escalas').getFullList({
    filter: `Data >= "${todayStr}" && Data <= "${todayStr}"`,
    expand: 'Usuario_ID',
  })
}

export const batchCreateEscalas = async (records: EscalaBatchRecord[]) => {
  const results = await Promise.allSettled(
    records.map((record) => pb.collection('escalas').create(record)),
  )
  const succeeded = results.filter((r) => r.status === 'fulfilled').length
  const failed = results.length - succeeded
  return { succeeded, failed }
}
