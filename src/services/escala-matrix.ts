import pb from '@/lib/pocketbase/client'
import type { EscalaBatchRecord } from '@/services/escalas'

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
  dataFim: string,
  projeto: string,
) => {
  const start = new Date(dataInicio + 'T00:00:00')
  const end = new Date(dataFim + 'T00:00:00')
  const records: EscalaBatchRecord[] = []
  const current = new Date(start)
  while (current <= end) {
    const y = current.getFullYear()
    const m = String(current.getMonth() + 1).padStart(2, '0')
    const d = String(current.getDate()).padStart(2, '0')
    records.push({
      Data: `${y}-${m}-${d}`,
      Usuario_ID: usuarioId,
      Projeto: projeto,
      Turno: '',
      Status: 'FÉRIAS',
    })
    current.setDate(current.getDate() + 1)
  }
  const results = await Promise.allSettled(records.map((r) => upsertEscala(r)))
  const succeeded = results.filter((r) => r.status === 'fulfilled').length
  const failed = results.length - succeeded
  return { succeeded, failed }
}

export const generateMonthlySchedule = async (
  usuarioId: string,
  month: number,
  year: number,
  horarioTrabalho: string,
  projeto: string,
) => {
  const lastDay = new Date(year, month + 1, 0).getDate()
  const records: EscalaBatchRecord[] = []
  for (let i = 1; i <= lastDay; i++) {
    const date = new Date(year, month, i)
    const dow = date.getDay()
    const isWeekend = dow === 0 || dow === 6
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    records.push({
      Data: `${y}-${m}-${d}`,
      Usuario_ID: usuarioId,
      Projeto: projeto,
      Turno: isWeekend ? 'FOLGA' : horarioTrabalho,
      Status: 'Previsto',
    })
  }
  const results = await Promise.allSettled(records.map((r) => upsertEscala(r)))
  const succeeded = results.filter((r) => r.status === 'fulfilled').length
  const failed = results.length - succeeded
  return { succeeded, failed }
}
