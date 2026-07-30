import * as XLSX from 'xlsx'
import pb from '@/lib/pocketbase/client'

export interface ImportResult {
  success: boolean
  created: number
  updated: number
  errors: string[]
  total: number
}

export const importUsers = async (file: File): Promise<ImportResult> => {
  const arrayBuffer = await file.arrayBuffer()
  const workbook = XLSX.read(arrayBuffer, { type: 'array' })
  const sheetName = workbook.SheetNames[0]
  if (!sheetName) {
    return {
      success: false,
      created: 0,
      updated: 0,
      errors: ['Planilha vazia ou inválida.'],
      total: 0,
    }
  }
  const sheet = workbook.Sheets[sheetName]
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '' })

  return pb.send('/backend/v1/import-users', {
    method: 'POST',
    body: JSON.stringify({ rows }),
    headers: { 'Content-Type': 'application/json' },
  })
}
