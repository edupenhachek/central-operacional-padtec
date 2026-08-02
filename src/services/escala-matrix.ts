import pb from '@/lib/pocketbase/client'
import type { EscalaBatchRecord } from '@/services/escalas'
import {
  formatDateStr,
  getPatternDayValue,
  advanceWeek,
  type PendingChange,
  type PatternConfig,
} from '@/lib/escala-utils'

export const getEscalasForMonth = async (month: number, year: number) => {
  const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`
  const lastDay = new Date(year, month + 1, 0).getDate()
  const endDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`
  return pb.collection('escalas').getFullList({
    filter: `Data >= "${startDate}" && Data <= "${endDate}"`,
    expand: 'Usuario_ID',
    sort: 'Data',
  })
}

export const getEscalasForRange = async (startDate: string, endDate: string) => {
  return pb.collection('escalas').getFullList({
    filter: `Data >= "${startDate}" && Data <= "${endDate}"`,
    expand: 'Usuario_ID',
    sort: 'Data',
  })
}

export const upsertEscala = async (data: {
  Data: string
  Usuario_ID: string
  Projeto: string
  Turno: string
  Status?: string
  observacao?: string
}) => {
  try {
    const existing = await pb
      .collection('escalas')
      .getFirstListItem(`Usuario_ID = "${data.Usuario_ID}" && Data = "${data.Data}"`)
    return pb.collection('escalas').update(existing.id, {
      Turno: data.Turno,
      Status: data.Status || 'Previsto',
      Projeto: data.Projeto,
      observacao: data.observacao,
    })
  } catch {
    return pb.collection('escalas').create({
      ...data,
      Status: data.Status || 'Previsto',
    })
  }
}

export const launchVacation = async (
  usuarioId: string,
  dataInicio: string,
  numDays: number,
  projeto: string,
) => {
  const start = new Date(dataInicio + 'T00:00:00')
  const records: EscalaBatchRecord[] = []
  for (let i = 0; i < numDays; i++) {
    const current = new Date(start)
    current.setDate(current.getDate() + i)
    records.push({
      Data: formatDateStr(current),
      Usuario_ID: usuarioId,
      Projeto: projeto,
      Turno: '',
      Status: 'FÉRIAS',
    })
  }
  const results = await Promise.allSettled(records.map((r) => upsertEscala(r)))
  const succeeded = results.filter((r) => r.status === 'fulfilled').length
  const failed = results.length - succeeded
  return { succeeded, failed }
}

function parseInitialWeek(initialCycle: string): number {
  const match = initialCycle.match(/(\d+)/)
  return match ? parseInt(match[1], 10) : 1
}

export const generateScheduleRange = async (
  users: { id: string; horario: string; projeto: string }[],
  startDate: string,
  endDate: string,
  pattern: string,
  initialCycle: string,
  patternConfig?: PatternConfig | null,
) => {
  const start = new Date(startDate + 'T00:00:00')
  const end = new Date(endDate + 'T00:00:00')
  if (start > end) return { succeeded: 0, failed: 0 }

  const records: EscalaBatchRecord[] = []
  let currentWeek = pattern === 'fixo-5x2' ? 1 : parseInitialWeek(initialCycle)
  const qtdSemanas = patternConfig
    ? Object.keys(patternConfig).filter((k) => k.startsWith('semana_')).length
    : 0

  const current = new Date(start)
  while (current <= end) {
    const dow = current.getDay()
    const dateStr = formatDateStr(current)

    if (pattern === 'fixo-5x2') {
      const workDay = dow !== 0 && dow !== 6
      for (const user of users) {
        records.push({
          Data: dateStr,
          Usuario_ID: user.id,
          Projeto: user.projeto,
          Turno: workDay ? user.horario : '',
          Status: workDay ? 'T' : 'F',
        })
      }
    } else if (patternConfig && qtdSemanas > 0) {
      if (current > start && dow === 1) currentWeek = advanceWeek(currentWeek, qtdSemanas)
      const status = getPatternDayValue(patternConfig, currentWeek, dow)
      for (const user of users) {
        records.push({
          Data: dateStr,
          Usuario_ID: user.id,
          Projeto: user.projeto,
          Turno: status === 'T' ? user.horario : '',
          Status: status,
        })
      }
    }
    current.setDate(current.getDate() + 1)
  }

  const results = await Promise.allSettled(records.map((r) => upsertEscala(r)))
  const succeeded = results.filter((r) => r.status === 'fulfilled').length
  const failed = results.length - succeeded
  return { succeeded, failed }
}

export const batchUpsertEscalas = async (changes: PendingChange[]) => {
  const results = await Promise.allSettled(
    changes.map((change) =>
      upsertEscala({
        Data: change.dateStr,
        Usuario_ID: change.userId,
        Projeto: change.projeto,
        Turno: change.turno,
        Status: change.status,
        observacao: change.observacao,
      }),
    ),
  )
  const failedChanges: PendingChange[] = []
  let succeeded = 0
  results.forEach((r, i) => {
    if (r.status === 'fulfilled') succeeded++
    else failedChanges.push(changes[i])
  })
  return { succeeded, failed: failedChanges.length, failedChanges }
}

export const generateMonthlySchedule = async (
  usuarioId: string,
  month: number,
  year: number,
  horarioTrabalho: string,
  projeto: string,
  pattern: string = 'fixo-5x2',
  initialCycle: string = '',
  patternConfig?: PatternConfig | null,
) => {
  const lastDay = new Date(year, month + 1, 0).getDate()
  const records: EscalaBatchRecord[] = []
  let currentWeek = pattern === 'fixo-5x2' ? 1 : parseInitialWeek(initialCycle)
  const qtdSemanas = patternConfig
    ? Object.keys(patternConfig).filter((k) => k.startsWith('semana_')).length
    : 0

  for (let i = 1; i <= lastDay; i++) {
    const date = new Date(year, month, i)
    const dow = date.getDay()
    const dateStr = formatDateStr(date)

    if (pattern === 'fixo-5x2') {
      const workDay = dow !== 0 && dow !== 6
      records.push({
        Data: dateStr,
        Usuario_ID: usuarioId,
        Projeto: projeto,
        Turno: workDay ? horarioTrabalho : 'FOLGA',
        Status: workDay ? 'Previsto' : 'FOLGA',
      })
    } else if (patternConfig && qtdSemanas > 0) {
      if (i > 1 && dow === 1) currentWeek = advanceWeek(currentWeek, qtdSemanas)
      const status = getPatternDayValue(patternConfig, currentWeek, dow)
      records.push({
        Data: dateStr,
        Usuario_ID: usuarioId,
        Projeto: projeto,
        Turno: status === 'T' ? horarioTrabalho : 'FOLGA',
        Status: status,
      })
    }
  }

  const results = await Promise.allSettled(records.map((r) => upsertEscala(r)))
  const succeeded = results.filter((r) => r.status === 'fulfilled').length
  const failed = results.length - succeeded
  return { succeeded, failed }
}
