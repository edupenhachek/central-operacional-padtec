import pb from '@/lib/pocketbase/client'

export interface FeriadoRecord {
  id: string
  data: string
  nome: string
  created: string
  updated: string
}

export const getFeriadosForRange = async (
  startDate: string,
  endDate: string,
): Promise<FeriadoRecord[]> => {
  return pb.collection('feriados').getFullList({
    filter: `data >= "${startDate}" && data <= "${endDate}"`,
    sort: 'data',
  }) as Promise<FeriadoRecord[]>
}

export const getFeriadosForMonth = async (
  month: number,
  year: number,
): Promise<FeriadoRecord[]> => {
  const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`
  const lastDay = new Date(year, month + 1, 0).getDate()
  const endDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`
  return getFeriadosForRange(startDate, endDate)
}

export const createFeriado = async (data: {
  data: string
  nome: string
}): Promise<FeriadoRecord> => {
  return pb.collection('feriados').create(data) as Promise<FeriadoRecord>
}

export const deleteFeriado = async (id: string): Promise<void> => {
  await pb.collection('feriados').delete(id)
}
